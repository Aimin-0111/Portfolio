import * as THREE from "three";
import { rand, col, jitter, lam, topHeight, makeIsland, makeTree, makeLand, makeClouds } from "./nature.js";
import { makeGallery } from "./gallery.js";
import { createPaint } from "./paint.js";

/*
  The painted world. One place per page section ("stop"), joined by a flight path.
  The page scrolls in steps (see buildSteps in ui.js): one per stop, plus one per piece at Work.
  Work is a gallery built from content/projects.js (see gallery.js), so adding a project adds a frame.
*/

const BASE = {
  light: {
    top: "#7FA3C8", horizon: "#F4D6B4", bottom: "#EBC9C4", sunColor: "#FFE2A8", sunDir: [-.5, .35, -.8], stars: 0,
    hemiSky: "#E8E4F0", hemiGround: "#B98FA0", hemiI: 1.9, sunI: 3, fog: "#EED8C2", cloud: "#E9B9C0", cloudI: .12,
    shadowTint: [.86, .86, 1.12], lightTint: [1.03, 1, .95], window: .15, pColor: "#FFE7A8", pGlow: .45, pSize: 2.2, fall: "#F3F6F8", canvasGlow: .12,
  },
  dark: {
    top: "#151D2B", horizon: "#D47C7E", bottom: "#3A3346", sunColor: "#FF9E7A", sunDir: [-.55, .06, -.83], stars: 1,
    hemiSky: "#8F9FCC", hemiGround: "#5A4060", hemiI: 1.3, sunI: 1.4, fog: "#5A4558", cloud: "#6A4A60", cloudI: .3,
    shadowTint: [.78, .84, 1.18], lightTint: [1.14, .96, .86], window: 3.2, pColor: "#FFD27A", pGlow: 1.2, pSize: 3.2, fall: "#C9D6EA", canvasGlow: .42,
  },
};

/* each stop: where it is, how the camera frames it, and its color mood (Work's framing comes from gallery.js) */
const PLACES = {
  home: { at: [0, 0, 0], cam: [-2, 5.5, 38], look: [-6.8, -.8, 0], light: {}, dark: {} },
  work: { at: [70, 2, -26],
    light: { top: "#A99BC8", horizon: "#F4C9B8", bottom: "#E7B3BB", fog: "#EFCFC6", hemiSky: "#F2E0E6", sunColor: "#FFD9B0" },
    dark: { top: "#1E1A33", horizon: "#C9687E" } },
  notes: { at: [138, 5, -8], cam: [-5, 3.5, 28], look: [-7.5, .8, 0],
    light: { top: "#8FB3AC", horizon: "#E8EBD2", bottom: "#C8D7C2", fog: "#DCE4D2", hemiSky: "#E6F0E0", hemiGround: "#9FB39A", sunColor: "#FFF1C8", shadowTint: [.86, .94, 1.02] },
    dark: { top: "#14231F", horizon: "#7FA08E", fog: "#3E5048" } },
  about: { at: [196, -2, 18], cam: [-3, 3, 40], look: [-10, 1.5, 0],
    light: { top: "#7FA3C8", horizon: "#EEF1F2", bottom: "#D6E0EA", fog: "#E4EAF0", hemiSky: "#EEF2F8", hemiGround: "#A8B4C8", sunColor: "#FFF6E6", sunI: 2.4, shadowTint: [.84, .9, 1.12], lightTint: [1, 1, 1] },
    dark: { top: "#0F1626", horizon: "#7E93B8", fog: "#3E4A60" } },
};

const conv = (t) => {
  const o = {};
  for (const [k, v] of Object.entries(t)) o[k] = typeof v === "string" ? col(v) : Array.isArray(v) ? new THREE.Vector3(...v) : v;
  return o;
};

export function createWorld(canvas, { projects, steps }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 520);
  camera.layers.enable(1);
  const world = new THREE.Group();
  scene.add(world);

  /* sky */
  const skyU = {
    top: { value: col("#7FA3C8") }, horizon: { value: col("#F4D6B4") }, bottom: { value: col("#EBC9C4") },
    sunDir: { value: new THREE.Vector3(-.5, .35, -.8).normalize() }, sunColor: { value: col("#FFE2A8") }, stars: { value: 0 }, time: { value: 0 },
  };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(250, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, uniforms: skyU,
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `
      uniform vec3 top, horizon, bottom, sunDir, sunColor; uniform float stars, time; varying vec3 vDir;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164)))*43758.5453); }
      void main(){
        float y = vDir.y;
        vec3 c = y > 0. ? mix(horizon, top, pow(smoothstep(-.02, .32, y), .8)) : mix(horizon, bottom, smoothstep(0., .35, -y));
        float s = max(dot(normalize(vDir), sunDir), 0.);
        c += sunColor * (pow(s, 48.) * .9 + pow(s, 6.) * .25);
        vec3 q = floor(vDir * 260.);
        c += step(.9965, h(q)) * smoothstep(.05, .4, y) * stars * (.6 + .4 * sin(time * 2. + h(q + 1.) * 30.));
        gl_FragColor = vec4(c, 1.);
      }`,
  }));
  sky.layers.set(1);
  scene.add(sky);

  /* light and air */
  const hemi = new THREE.HemisphereLight(col("#E8E4F0"), col("#B98FA0"), 1.9);
  const sun = new THREE.DirectionalLight(col("#FFE2A8"), 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -28, right: 28, top: 28, bottom: -28, near: 1, far: 100 });
  sun.shadow.bias = -.0015;
  /* a soft light from the viewer's side, switched on at the gallery so the pieces aren't backlit */
  const galleryLight = new THREE.DirectionalLight(col("#FFF0DA"), 0);
  scene.add(hemi, sun, sun.target, galleryLight, galleryLight.target);
  scene.fog = new THREE.Fog(col("#EED8C2"), 70, 320);
  const SUN_OFFSET = new THREE.Vector3(-10, 18, 16), LAMP_OFFSET = new THREE.Vector3(-4, 8, 0);

  /* the land below and the clouds between */
  world.add(makeLand({ center: new THREE.Vector3(100, 0, -70), width: 460, depth: 220, sea: -17 }));
  const clouds = makeClouds(220, { x0: -50, x1: 260, z0: -70, z1: 35, y: -11 });
  world.add(clouds.mesh);

  const placeAt = (id) => new THREE.Vector3(...(PLACES[id]?.at || [0, 0, 0]));
  const islets = [];

  /* home: the main island with a tower, two trees, a pond and a waterfall */
  const home = makeIsland(1, { tufts: 1800, tree: { x: -1.6, z: -1.2, size: 1.15, blossom: true } });
  home.add(makeTree(-3.8, 1.9, .7, false, (x, z) => topHeight(x, z, 1)));
  const windowMat = new THREE.MeshLambertMaterial({ color: col("#3A3346"), emissive: col("#FFD27A"), emissiveIntensity: .15 });
  {
    const tower = new THREE.Group();
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(.62, .74, 2.7, 14), lam("#EFE3D0")); wall.position.y = 1.3;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(.98, 1.5, 14), lam("#C9606F")); roof.position.set(.05, 3.35, 0); roof.rotation.z = -.12;
    const win = new THREE.Mesh(new THREE.BoxGeometry(.26, .4, .1), windowMat); win.position.set(.18, 2, .66); win.rotation.y = .25;
    const door = new THREE.Mesh(new THREE.BoxGeometry(.34, .6, .1), lam("#7A6070")); door.position.set(.05, .3, .72);
    [wall, roof].forEach((m) => { m.castShadow = m.receiveShadow = true; });
    tower.add(wall, roof, win, door);
    tower.position.set(2.4, topHeight(2.4, .9, 1) - .1, .9); tower.rotation.y = .5;
    home.add(tower);
  }
  const pondA = .55, pond = new THREE.Mesh(new THREE.CircleGeometry(1.05, 28), lam("#9DB8D0", .25));
  pond.rotation.x = -Math.PI / 2; pond.scale.set(1, 1.5, 1);
  pond.position.set(Math.cos(pondA) * 4.3, topHeight(Math.cos(pondA) * 4.3, Math.sin(pondA) * 4.3, 1) + .06, Math.sin(pondA) * 4.3);
  home.add(pond);
  const fallU = { time: { value: 0 }, tint: { value: col("#F3F6F8") } };
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 10), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: fallU,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `
      uniform float time; uniform vec3 tint; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),u.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x), u.y); }
      void main(){
        float s = n(vec2(vUv.x * 9., vUv.y * 4. + time * 1.6));
        float a = (.45 + s * .55) * smoothstep(0., .25, vUv.x) * smoothstep(1., .75, vUv.x) * smoothstep(0., .45, vUv.y) * smoothstep(1., .95, vUv.y);
        gl_FragColor = vec4(mix(tint * .82, tint, s), a);
      }`,
  }));
  const fx = Math.cos(pondA) * 5.95, fz = Math.sin(pondA) * 5.95;
  fall.position.set(fx, -4.75, fz); fall.lookAt(fx * 2, -4.75, fz * 2);
  home.add(fall);
  home.position.copy(placeAt("home"));
  world.add(home);

  /* work: a salon wall of framed pieces, one per project */
  const gallery = makeGallery(projects, placeAt("work"));
  world.add(gallery.group);

  /* notes: a library island with a stack of books and flying pages */
  const L = placeAt("notes");
  const lib = makeIsland(.8, { tufts: 700, tree: { x: 2.4, z: -1.6, size: .9, blossom: false } });
  let by = topHeight(-.8, .4, .8);
  ["#C9606F", "#7FA3C8", "#E5C36A", "#6E9A62", "#EFE3D0", "#B9A0C8", "#C9606F"].forEach((hex) => {
    const hh = .3 + rand() * .2;
    const book = new THREE.Mesh(new THREE.BoxGeometry(1.7 - rand() * .4, hh, 1.15), lam(hex));
    book.position.set(-.8 + (rand() - .5) * .2, by + hh / 2, .4); book.rotation.y = (rand() - .5) * .5;
    book.castShadow = book.receiveShadow = true;
    lib.add(book); by += hh;
  });
  lib.position.copy(L);
  world.add(lib);
  const pageMat = new THREE.MeshLambertMaterial({ color: col("#FBF6EA"), side: THREE.DoubleSide, emissive: col("#FBF6EA"), emissiveIntensity: .25 });
  const pages = Array.from({ length: 14 }, () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(.5, .66), pageMat); world.add(m); return m; });

  /* about: a quiet island with a tree and a bench, and a balloon drifting by */
  const Q = placeAt("about");
  const quiet = makeIsland(.38, { tufts: 260, tree: { x: -1, z: -.4, size: 1.7, blossom: false } });
  const benchY = topHeight(1.1, .7, .38);
  const wood = lam("#7A6070");
  [[.9, .07, .3, 1.1, .28, .7], [.9, .3, .06, 1.1, .48, .58], [.05, .28, .05, .75, .14, .78], [.05, .28, .05, 1.45, .14, .78], [.05, .28, .05, .75, .14, .6], [.05, .28, .05, 1.45, .14, .6]]
    .forEach(([w, h, d, x, y, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wood); m.position.set(x, benchY + y, z); m.castShadow = true; quiet.add(m); });
  quiet.position.copy(Q);
  world.add(quiet);
  const balloon = new THREE.Group();
  {
    const geo = new THREE.SphereGeometry(2.3, 24, 18), cols = [], p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const c = jitter(col(Math.floor((Math.atan2(p.getZ(i), p.getX(i)) + Math.PI) / (Math.PI / 6)) % 2 ? "#E8899A" : "#F3E3B0"), .05);
      cols.push(c.r, c.g, c.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    const env = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true })); env.scale.set(1, 1.15, 1);
    const basket = new THREE.Mesh(new THREE.BoxGeometry(.9, .6, .9), lam("#A07A6A")); basket.position.y = -3.6;
    const flame = new THREE.Mesh(new THREE.SphereGeometry(.18, 10, 8), lam("#FFB060", 2)); flame.position.y = -2.5;
    balloon.add(env, basket, flame);
    [[-.5, -.5], [.5, -.5], [-.5, .5], [.5, .5]].forEach(([x, z]) => { const r = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, 1.4, 4), lam("#5A4A50")); r.position.set(x, -2.85, z); balloon.add(r); });
    balloon.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  }
  world.add(balloon);

  /* small islets along the route */
  for (let k = 0; k < 10; k++) {
    const isl = makeIsland(.16 + rand() * .16, { tufts: 90, tree: rand() < .5 ? { x: -.5, z: .3, size: 1.5, blossom: rand() < .5 } : null });
    const y = -3 + rand() * 12;
    isl.position.set(-25 + k * 25 + rand() * 10, y, -36 - rand() * 22);
    isl.userData = { y, phase: k * 2.1 };
    world.add(isl);
    islets.push(isl);
  }

  /* pollen by day, fireflies at night */
  const P = 420, pPos = new Float32Array(P * 3), pPhase = new Float32Array(P);
  for (let i = 0; i < P; i++) { pPos.set([-10 + rand() * 230, -4 + rand() * 14, -20 + rand() * 40], i * 3); pPhase[i] = rand() * 100; }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute("phase", new THREE.BufferAttribute(pPhase, 1));
  const pU = { time: { value: 0 }, color: { value: col("#FFE7A8") }, size: { value: 2.2 }, glow: { value: .45 } };
  const particles = new THREE.Points(pGeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: pU,
    vertexShader: `uniform float time, size; attribute float phase; varying float vF;
      void main(){ vec3 p = position; p.x += sin(time*.3+phase)*.6; p.y += sin(time*.5+phase*1.3)*.5; p.z += cos(time*.25+phase)*.6;
        vec4 mv = modelViewMatrix * vec4(p,1.); vF = .55 + .45*sin(time*2.2+phase*7.); gl_PointSize = size*(60./-mv.z)*(.6+vF*.6); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 color; uniform float glow; varying float vF; void main(){ float a = smoothstep(.5,0.,length(gl_PointCoord-.5)); gl_FragColor = vec4(color*a*glow*vF,1.); }`,
  }));
  particles.layers.set(1);
  world.add(particles);

  /* the flight path and the color moods follow the scroll steps */
  const list = steps.filter((st) => PLACES[st.stop]);
  const pieceStep = (i) => list.findIndex((st) => st.stop === "work" && st.piece === i);
  const pals = { light: list.map((st) => conv({ ...BASE.light, ...PLACES[st.stop].light })), dark: list.map((st) => conv({ ...BASE.dark, ...PLACES[st.stop].dark })) };
  const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  let camPath, lookPath, rise = [];
  function viewOf(st, narrow) {
    const v = { cam: new THREE.Vector3(), look: new THREE.Vector3() };
    if (st.stop === "work") return st.piece >= 0 ? gallery.pieceView(st.piece, tan, narrow, false, v) : gallery.wallView(tan, narrow, v);
    const pl = PLACES[st.stop], c = new THREE.Vector3(...pl.cam), l = new THREE.Vector3(...pl.look);
    if (narrow) { c.set(c.x + 4, c.y, c.z * 1.45); l.set(0, l.y - 2.5, l.z); }
    v.cam.copy(placeAt(st.stop)).add(c); v.look.copy(placeAt(st.stop)).add(l);
    return v;
  }
  function buildPaths() {
    const narrow = innerWidth / innerHeight < 1;
    gallery.layout(narrow);
    const views = list.map((st) => viewOf(st, narrow));
    camPath = new THREE.CatmullRomCurve3(views.map((v) => v.cam), false, "centripetal");
    lookPath = new THREE.CatmullRomCurve3(views.map((v) => v.look), false, "centripetal");
    /* rise a little between places, less between neighbouring pieces */
    rise = views.map((v, k) => (views[k + 1] ? Math.min(5, v.cam.distanceTo(views[k + 1].cam) * .07) : 0));
  }

  const paint = createPaint(renderer, camera);
  let RS = .72;
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    paint.setSize(Math.max(1, Math.round(w * RS)), Math.max(1, Math.round(h * RS)));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    buildPaths();
  }
  resize();
  addEventListener("resize", resize);

  function mixPal(list, p) {
    const i = Math.max(0, Math.min(list.length - 2, Math.floor(p))), f = list.length > 1 ? Math.max(0, Math.min(1, p - i)) : 0;
    const a = list[i], b = list[Math.min(i + 1, list.length - 1)], o = {};
    for (const k of Object.keys(a)) o[k] = a[k]?.clone ? a[k].clone().lerp(b[k], f) : a[k] + (b[k] - a[k]) * f;
    return o;
  }
  function applyPalette(p) {
    skyU.top.value.copy(p.top); skyU.horizon.value.copy(p.horizon); skyU.bottom.value.copy(p.bottom);
    skyU.sunColor.value.copy(p.sunColor); skyU.sunDir.value.copy(p.sunDir).normalize(); skyU.stars.value = p.stars;
    hemi.color.copy(p.hemiSky); hemi.groundColor.copy(p.hemiGround); hemi.intensity = p.hemiI;
    sun.color.copy(p.sunColor); sun.intensity = p.sunI;
    scene.fog.color.copy(p.fog);
    clouds.mat.emissive.copy(p.cloud); clouds.mat.emissiveIntensity = p.cloudI;
    paint.material.uniforms.shadowTint.value.copy(p.shadowTint); paint.material.uniforms.lightTint.value.copy(p.lightTint);
    windowMat.emissiveIntensity = p.window;
    canvasGlow = p.canvasGlow;
    pU.color.value.copy(p.pColor); pU.glow.value = p.pGlow; pU.size.value = p.pSize;
    fallU.tint.value.copy(p.fall);
  }

  /* state driven by the page */
  let canvasGlow = .12;
  const state = { target: 0, prog: 0, focus: -1, focusW: 0, highlight: -1, mode: 0, modeTarget: 0, dark: document.documentElement.dataset.theme === "dark" ? 1 : 0 };
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  if (!reduceMotion) {
    addEventListener("pointermove", (e) => { pointer.x = e.clientX / innerWidth * 2 - 1; pointer.y = e.clientY / innerHeight * 2 - 1; });
    document.addEventListener("pointerleave", () => { pointer.x = pointer.y = 0; });
  }

  /* clicking a frame opens its piece, but only while looking at the gallery */
  let onPick = null, hover = -1;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const workSteps = list.map((st, k) => (st.stop === "work" ? k : -1)).filter((k) => k >= 0);
  const atGallery = () => state.focus < 0 && workSteps.some((k) => Math.abs(state.prog - k) < .35);
  function frameAt(e) {
    if (e.target !== canvas || !atGallery()) return -1;
    ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return gallery.pick(ray.ray);
  }
  addEventListener("pointermove", (e) => {
    hover = frameAt(e);
    canvas.style.cursor = hover >= 0 ? "pointer" : "";
  });
  addEventListener("click", (e) => { const i = frameAt(e); if (i >= 0) onPick?.(i); });

  const clock = new THREE.Clock();
  const look = new THREE.Vector3(), fv = { cam: new THREE.Vector3(), look: new THREE.Vector3() };
  let slow = 0;
  function frame() {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    const raw = clock.getDelta(), dt = Math.min(raw, .05);
    slow = slow * .95 + (raw > .034 ? .05 : 0);
    if (slow > .7 && RS > .46) { RS = Math.max(.45, RS - .09); slow = 0; resize(); }
    const t = reduceMotion ? 0 : clock.elapsedTime;
    const k = (s) => Math.min(1, dt * s);

    state.prog += (state.target - state.prog) * k(2.6);
    state.dark += ((document.documentElement.dataset.theme === "dark" ? 1 : 0) - state.dark) * k(2.2);
    state.mode += (state.modeTarget - state.mode) * k(4);
    const light = mixPal(pals.light, state.prog), dark = mixPal(pals.dark, state.prog), pal = {};
    for (const key of Object.keys(light)) pal[key] = light[key]?.clone ? light[key].clone().lerp(dark[key], state.dark) : light[key] + (dark[key] - light[key]) * state.dark;
    applyPalette(pal);

    /* camera along the path; an open piece slides aside for its detail sheet */
    const u = list.length > 1 ? Math.min(1, Math.max(0, state.prog / (list.length - 1))) : 0;
    camPath.getPoint(u, camera.position);
    lookPath.getPoint(u, look);
    const seg = Math.min(list.length - 1, Math.floor(state.prog));
    camera.position.y += Math.sin((state.prog - seg) * Math.PI) * (rise[seg] || 0);
    const fs = state.focus >= 0 ? pieceStep(state.focus) : -1;
    state.focusW += ((fs >= 0 ? Math.max(0, 1 - Math.abs(state.prog - fs) * 2) : 0) - state.focusW) * k(3);
    if (state.focusW > .001 && fs >= 0) {
      gallery.pieceView(state.focus, tan, innerWidth / innerHeight < 1, true, fv);
      camera.position.lerp(fv.cam, state.focusW);
      look.lerp(fv.look, state.focusW);
    }
    pointer.sx += (pointer.x - pointer.sx) * k(2.5); pointer.sy += (pointer.y - pointer.sy) * k(2.5);
    camera.position.x += pointer.sx * 2 + Math.sin(t * .06) * 1.2;
    camera.position.y -= pointer.sy * 1.1;
    look.x += pointer.sx * .6;
    camera.lookAt(look);
    sky.position.copy(camera.position);
    sun.target.position.copy(look); sun.position.copy(look).add(SUN_OFFSET);
    const outside = workSteps.length ? Math.max(workSteps[0] - state.prog, state.prog - workSteps.at(-1), 0) : 9;
    galleryLight.intensity = Math.max(0, 1 - outside * 1.4) * (.9 + state.dark * .5);
    galleryLight.position.copy(camera.position).add(LAMP_OFFSET);
    galleryLight.target.position.copy(look);

    /* life */
    home.position.y = Math.sin(t * .4) * .12;
    islets.forEach((g) => { g.position.y = g.userData.y + Math.sin(t * .5 + g.userData.phase) * .25; g.rotation.y = t * .03 + g.userData.phase; });
    gallery.tick(t, dt, state.highlight >= 0 ? state.highlight : hover, canvasGlow);
    pages.forEach((pg, i) => {
      const a = t * .25 + i * .45, r = 3.2 + (i % 3) * .6;
      pg.position.set(L.x + Math.cos(a) * r, L.y + 2.2 + Math.sin(t * .6 + i) * .6 + (i % 4) * .5, L.z + Math.sin(a) * r);
      pg.rotation.set(Math.sin(t + i) * .4, a, Math.cos(t * .7 + i) * .3);
    });
    balloon.position.set(Q.x + 5 + Math.sin(t * .07) * 2, Q.y + 8 + Math.sin(t * .5) * .5, Q.z - 6);
    clouds.tick(t);
    skyU.time.value = fallU.time.value = pU.time.value = t;

    paint.render(scene, camera, state.mode, t);
  }
  frame();

  return {
    /* p: 0 = first stop, 1 = second stop, ... */
    setProgress(p) { state.target = p; },
    jumpTo(p) { state.target = state.prog = p; },
    /* piece i has its detail sheet open, or -1 */
    focusProject(i) { state.focus = i; },
    /* lift frame i toward the viewer, or -1 */
    highlight(i) { state.highlight = i; },
    /* fn(i) is called when frame i is clicked */
    onPick(fn) { onPick = fn; },
    setMode(m) { state.modeTarget = m === "ink" ? 1 : 0; },
  };
}
