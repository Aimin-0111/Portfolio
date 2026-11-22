import * as THREE from "three";

/* Shared builders for the painted world: noise, islands, trees, land, clouds. */

let seed = 7;
export const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
export const hash3 = (x, y, z) => { const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return h - Math.floor(h); };
const ease = (t) => t * t * (3 - 2 * t);
export function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = ease(x - xi), yf = ease(y - yi), zf = ease(z - zi);
  const l = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);
  return l(l(l(c(0, 0, 0), c(1, 0, 0), xf), l(c(0, 1, 0), c(1, 1, 0), xf), yf),
           l(l(c(0, 0, 1), c(1, 0, 1), xf), l(c(0, 1, 1), c(1, 1, 1), xf), yf), zf);
}
export const fbm = (x, y, z) => vnoise(x, y, z) * .55 + vnoise(x * 2.1, y * 2.1, z * 2.1) * .3 + vnoise(x * 4.3, y * 4.3, z * 4.3) * .15;
export const smoothstep = (a, b, t) => { const x = Math.min(1, Math.max(0, (t - a) / (b - a))); return x * x * (3 - 2 * x); };

export const col = (hex) => new THREE.Color(hex);
export const jitter = (c, amt = .06) => c.clone().offsetHSL((rand() - .5) * amt * .5, (rand() - .5) * amt, (rand() - .5) * amt);
export const lam = (hex, glow = 0) => new THREE.MeshLambertMaterial({ color: col(hex), emissive: col(hex), emissiveIntensity: glow });

const GRASS = ["#6E9A62", "#86A36B", "#9EB394", "#A9B58D", "#7FA06A", "#98AD86"].map(col);
const SPECKS = ["#D9667F", "#E5C36A", "#F3E9D2", "#9DB8D0", "#B9A0C8"].map(col);
const ROCK = ["#B49590", "#A78A8E", "#C17A7E", "#9A8D94", "#C8A890", "#8B8A9A"].map(col);
const BLOSSOM = ["#E8899A", "#F0A0AE", "#D9667F", "#F6C6C9", "#E7CE86"].map(col);
const LEAVES = ["#6E9A62", "#86A36B", "#5F8A5A", "#94BB8A", "#7FA06A"].map(col);

/* height of an island's grassy top at (x, z), for an island of scale s */
export const topHeight = (x, z, s) => {
  const r = Math.hypot(x, z) / s;
  return (.35 - r * r * .006) * s + (fbm(x * .25 / s + 3, 7.3, z * .25 / s) - .5) * 1.1 * s * (1 - smoothstep(4.6, 6, r));
};

/* floating island: grassy top, rocky underside, tufts and flower dabs */
export function makeIsland(s, opts = {}) {
  const group = new THREE.Group();
  const prof = [];
  for (let r = .01; r < 5.9; r += .45) prof.push(new THREE.Vector2(r, .35 - r * r * .006));
  [[6, -.1], [5.85, -.6], [5.3, -1.4], [4.4, -2.4], [3.5, -3.5], [2.6, -4.6], [1.7, -5.8], [.9, -6.9], [.3, -7.8], [.01, -8.2]]
    .forEach(([r, y]) => prof.push(new THREE.Vector2(r, y)));
  const geo = new THREE.LatheGeometry(prof.map((p) => p.multiplyScalar(s)), 72);
  const pos = geo.attributes.position;
  const colors = [];
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    let c;
    if (y > -.05 * s) {
      y = topHeight(x, z, s);
      const n = fbm(x * .4 / s, 1, z * .4 / s);
      c = jitter(GRASS[Math.floor(n * GRASS.length * 1.4) % GRASS.length], .12);
      if (hash3(x * 3.1, 2, z * 3.1) > .9) c = jitter(SPECKS[Math.floor(hash3(x, 5, z) * SPECKS.length)], .08);
    } else {
      const k = 1 + (fbm(x * .45 / s, y * .45 / s, z * .45 / s) - .5) * .55;
      x *= k; z *= k;
      y += (fbm(x * .3 / s + 9, y * .3 / s, z * .3 / s) - .5) * .7 * s;
      const band = Math.floor((y / s + fbm(x * .2, y * .2, z * .2) * 2.2) * 1.15);
      c = jitter(ROCK[((band % ROCK.length) + ROCK.length) % ROCK.length], .1);
      if (y > -.9 * s) c.lerp(GRASS[0], .55);
    }
    pos.setXYZ(i, x, y, z);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const land = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
  land.castShadow = land.receiveShadow = true;
  group.add(land);
  group.add(makeTufts(opts.tufts ?? 900, (r) => Math.sqrt(r) * 5.5 * s, (x, z) => topHeight(x, z, s), s));
  if (opts.tree) group.add(makeTree(opts.tree.x * s, opts.tree.z * s, s * (opts.tree.size || 1), opts.tree.blossom, (x, z) => topHeight(x, z, s)));
  return group;
}

function makeTufts(count, radius, height, s) {
  const tuft = new THREE.InstancedMesh(new THREE.ConeGeometry(.06 * s, .42 * s, 3), new THREE.MeshLambertMaterial(), count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2, r = radius(rand());
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    e.set((rand() - .5) * .5, rand() * 3, (rand() - .5) * .5); q.setFromEuler(e);
    const k = .6 + rand() * .9;
    m.compose(v.set(x, height(x, z) + .15 * s * k, z), q, sc.set(k, k, k));
    tuft.setMatrixAt(i, m);
    const flower = rand() < .16;
    tuft.setColorAt(i, jitter(flower ? SPECKS[Math.floor(rand() * SPECKS.length)] : GRASS[Math.floor(rand() * GRASS.length)], .14));
  }
  tuft.receiveShadow = true;
  return tuft;
}

/* round, painterly tree; ground(x, z) gives the height to stand on */
export function makeTree(x, z, size, blossom, ground) {
  const g = new THREE.Group();
  const baseY = ground(x, z);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.16 * size, .34 * size, 2.8 * size, 7), lam("#7A6070"));
  trunk.position.set(x, baseY + 1.3 * size, z);
  trunk.rotation.z = .08;
  trunk.castShadow = true;
  g.add(trunk);
  const palette = blossom ? BLOSSOM : LEAVES;
  const blobs = blossom ? 9 : 6;
  for (let i = 0; i < blobs; i++) {
    const r = (.8 + rand() * .7) * size;
    const geo = new THREE.IcosahedronGeometry(r, 3);
    const p = geo.attributes.position, colors = [];
    for (let j = 0; j < p.count; j++) {
      const n = 1 + (vnoise(p.getX(j) * 2.2 + i, p.getY(j) * 2.2, p.getZ(j) * 2.2) - .5) * .35;
      p.setXYZ(j, p.getX(j) * n, p.getY(j) * n * .85, p.getZ(j) * n);
      const c = jitter(palette[Math.floor(rand() * palette.length)], .14);
      colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const blob = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
    const a = (i / blobs) * Math.PI * 2;
    const rr = i === 0 ? 0 : (.9 + rand() * .5) * size;
    blob.position.set(x + Math.cos(a) * rr, baseY + (2.9 + rand() * 1.1 + (i === 0 ? .8 : 0)) * size, z + Math.sin(a) * rr);
    blob.castShadow = blob.receiveShadow = true;
    g.add(blob);
  }
  return g;
}

/* the land below: rolling hills, a coast and the sea, colored like real ground */
const MEADOW = col("#7E9E64"), MEADOW_DEEP = col("#5F8656"), DRY = col("#A7AE7C"), EARTH = col("#9C8A6E"), STONE = col("#9A9088"), SAND = col("#E3D2B0"), SHALLOW = col("#9DB8D0");
export function makeLand({ center, width, depth, sea }) {
  const group = new THREE.Group();
  const heightAt = (x, z) => {
    const coast = smoothstep(-depth * .18, depth * .3, -(z - center.z) + (fbm(x * .01, 4, 1) - .5) * 70);
    const hills = (fbm(x * .011, 1.7, z * .011) - .32) * 34 + (fbm(x * .05, 3, z * .05) - .5) * 4;
    return sea - 3 + coast * Math.max(-1, hills + 6);
  };
  const geo = new THREE.PlaneGeometry(width, depth, 240, 100);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, colors = [];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + center.x, z = pos.getZ(i) + center.z;
    const y = heightAt(x, z);
    pos.setY(i, y);
    const slope = Math.hypot(heightAt(x + 1, z) - y, heightAt(x, z + 1) - y);
    const above = y - sea;
    let c;
    if (above < .6) c = SAND.clone().lerp(SHALLOW, smoothstep(.4, -2, above));
    else {
      const patch = fbm(x * .018, 5.5, z * .018);
      c = MEADOW.clone().lerp(MEADOW_DEEP, smoothstep(.42, .7, patch));
      c.lerp(DRY, smoothstep(9, 18, above) * .7);
      c.lerp(SAND, smoothstep(2.2, .6, above));
      c.lerp(EARTH, smoothstep(.55, 1.1, slope) * .8);
      c.lerp(STONE, smoothstep(19, 26, above) * .85);
      c = jitter(c, .035);
    }
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const land = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
  land.position.set(center.x, 0, center.z);
  land.receiveShadow = true;
  group.add(land);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(width * 2, depth * 3), lam("#9DB8D0", .18));
  water.rotation.x = -Math.PI / 2;
  water.position.set(center.x, sea, center.z);
  group.add(water);

  /* trees gather in the darker, wooded patches */
  for (let i = 0, placed = 0; i < 400 && placed < 30; i++) {
    const x = center.x + (rand() - .5) * width * .9, z = center.z + (rand() - .5) * depth * .6;
    const y = heightAt(x, z);
    if (y < sea + 2 || y > sea + 17 || fbm(x * .018, 5.5, z * .018) < .5) continue;
    group.add(makeTree(x, z, 1.4 + rand() * 1.2, false, () => y - .3));
    placed++;
  }
  return group;
}

/* drifting clouds; returns the mesh and a tick(t) function */
export function makeClouds(count, area) {
  const mat = new THREE.MeshLambertMaterial({ color: col("#FFF8F0"), emissive: col("#E9B9C0"), emissiveIntensity: .12 });
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), mat, count);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  const data = [];
  for (let i = 0; i < count; i++) {
    const high = i > count * .85;
    const x = area.x0 + rand() * (area.x1 - area.x0);
    const z = high ? area.z0 - 20 - rand() * 30 : area.z0 + rand() * (area.z1 - area.z0);
    const y = high ? 12 + rand() * 14 : area.y + rand() * 3;
    const s = high ? 4 + rand() * 8 : 2 + rand() * 3.5;
    data.push({ x, y, z, s, sp: .2 + rand() * .4 });
    mesh.setColorAt(i, jitter(col(["#FFFFFF", "#F6E6E8", "#EDE6F2", "#FFF3DE"][i % 4]), .05));
  }
  const tick = (t) => {
    data.forEach((d, i) => {
      m.compose(v.set(d.x + Math.sin(t * .03 * d.sp + i) * 1.5, d.y + Math.sin(t * .2 * d.sp + i) * .15, d.z), q, sc.set(d.s, d.s * .55, d.s));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  tick(0);
  return { mesh, mat, tick };
}
