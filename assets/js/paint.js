import * as THREE from "three";

/*
  Turns a rendered scene into a painting.
  mode 0 = paint (Kuwahara brushstrokes), mode 1 = ink (Moebius-style outlines and hatching).
  Both share the same color grade: warm lights, violet shadows, paper grain.
*/
export function createPaint(renderer, camera) {
  const target = new THREE.WebGLRenderTarget(1, 1, { depthTexture: new THREE.DepthTexture(1, 1), type: THREE.HalfFloatType });
  const normalTarget = new THREE.WebGLRenderTarget(1, 1);
  const normalMat = new THREE.MeshNormalMaterial();

  const material = new THREE.ShaderMaterial({
    uniforms: {
      tColor: { value: target.texture }, tDepth: { value: target.depthTexture }, tNormal: { value: normalTarget.texture },
      res: { value: new THREE.Vector2(1, 1) }, mode: { value: 0 }, time: { value: 0 },
      cnear: { value: camera.near }, cfar: { value: camera.far },
      shadowTint: { value: new THREE.Vector3(.86, .86, 1.12) }, lightTint: { value: new THREE.Vector3(1.03, 1, .95) },
      inkColor: { value: new THREE.Color("#2E2B26") },
    },
    depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
    fragmentShader: `
      uniform sampler2D tColor, tDepth, tNormal; uniform vec2 res; uniform float mode, time, cnear, cfar;
      uniform vec3 shadowTint, lightTint, inkColor; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),u.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x), u.y); }
      float luma(vec3 c){ return dot(c, vec3(.299,.587,.114)); }

      vec3 kuwahara(vec2 uv){
        vec2 px = 1. / res;
        vec3 m0=vec3(0.), m1=vec3(0.), m2=vec3(0.), m3=vec3(0.), s0=vec3(0.), s1=vec3(0.), s2=vec3(0.), s3=vec3(0.);
        const int R = 5;
        for (int j = 0; j <= R; j++) for (int i = 0; i <= R; i++) {
          vec3 c;
          c = texture2D(tColor, uv + vec2(-i, -j) * px).rgb; m0 += c; s0 += c * c;
          c = texture2D(tColor, uv + vec2( i, -j) * px).rgb; m1 += c; s1 += c * c;
          c = texture2D(tColor, uv + vec2( i,  j) * px).rgb; m2 += c; s2 += c * c;
          c = texture2D(tColor, uv + vec2(-i,  j) * px).rgb; m3 += c; s3 += c * c;
        }
        float k = float((R + 1) * (R + 1));
        m0 /= k; m1 /= k; m2 /= k; m3 /= k;
        float v0 = dot(abs(s0 / k - m0 * m0), vec3(1.)), v1 = dot(abs(s1 / k - m1 * m1), vec3(1.));
        float v2 = dot(abs(s2 / k - m2 * m2), vec3(1.)), v3 = dot(abs(s3 / k - m3 * m3), vec3(1.));
        vec3 r = m0; float b = v0;
        if (v1 < b) { b = v1; r = m1; } if (v2 < b) { b = v2; r = m2; } if (v3 < b) { r = m3; }
        return r;
      }
      float ld(vec2 uv){ float z = texture2D(tDepth, uv).x * 2. - 1.; return (2. * cnear * cfar) / (cfar + cnear - z * (cfar - cnear)); }
      float edge(vec2 uv){
        vec2 px = 1.25 / res;
        float c = ld(uv);
        float de = (abs(ld(uv - vec2(px.x, 0.)) - c) + abs(ld(uv + vec2(px.x, 0.)) - c) + abs(ld(uv + vec2(0., px.y)) - c) + abs(ld(uv - vec2(0., px.y)) - c)) / c;
        vec3 nc = texture2D(tNormal, uv).rgb;
        float ne = length(texture2D(tNormal, uv + vec2(px.x, 0.)).rgb - nc) + length(texture2D(tNormal, uv - vec2(px.x, 0.)).rgb - nc)
                 + length(texture2D(tNormal, uv + vec2(0., px.y)).rgb - nc) + length(texture2D(tNormal, uv - vec2(0., px.y)).rgb - nc);
        return clamp(smoothstep(.05, .12, de) + smoothstep(.55, .95, ne), 0., 1.);
      }
      void main(){
        vec2 px = 1. / res;
        vec2 wob = vec2(n(vUv * res / 16.), n(vUv * res / 16. + 7.3)) - .5;
        vec2 uv = vUv + wob * px * 3.;
        vec3 paint = mode < .999 ? kuwahara(uv) : vec3(0.);
        vec3 ink = vec3(0.);
        if (mode > .001) {
          vec3 base = texture2D(tColor, uv).rgb;
          float l = luma(base);
          vec3 flatc = base * (floor(l * 4. + .5) / 4. + .08) / (l + .08);
          float hatch = step(.78, fract((gl_FragCoord.x - gl_FragCoord.y) / 5.)) * (1. - smoothstep(.1, .28, l));
          flatc = mix(flatc, inkColor, hatch * .65);
          ink = mix(flatc, inkColor, edge(vUv + wob * px * 1.5));
        }
        vec3 c = mix(paint, ink, mode);
        float l = luma(c);
        c *= mix(shadowTint, lightTint, smoothstep(.08, .75, l));
        c = mix(vec3(l), c, 1.04);
        c += (h(gl_FragCoord.xy) - .5) * .035 + (n(vUv * vec2(900., 210.)) - .5) * .03;
        vec2 v = vUv - .5; c *= 1. - dot(v, v) * .3;
        gl_FragColor = vec4(max(c, 0.), 1.);
        #include <colorspace_fragment>
      }`,
  });
  const quad = new THREE.Scene();
  quad.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  return {
    material,
    setSize(w, h) { target.setSize(w, h); normalTarget.setSize(w, h); material.uniforms.res.value.set(w, h); },
    render(scene, cam, mode, time) {
      renderer.setRenderTarget(target);
      renderer.render(scene, cam);
      if (mode > .001) {
        cam.layers.disable(1);
        scene.overrideMaterial = normalMat;
        renderer.setRenderTarget(normalTarget);
        renderer.render(scene, cam);
        scene.overrideMaterial = null;
        cam.layers.enable(1);
      }
      material.uniforms.mode.value = mode;
      material.uniforms.time.value = time;
      renderer.setRenderTarget(null);
      renderer.render(quad, quadCam);
    },
  };
}
