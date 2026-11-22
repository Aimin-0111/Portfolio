import * as THREE from "three";
import { lam, makeTree } from "./nature.js";

/*
  Little scenes that sit on top of a project island.
  A project picks one with `island: "<name>"` in content/projects.js.
  To add a new kind: add a function here. It receives the island group `g`
  and `ground(x, z)`, the height of the grass at that point (island radius is about 2.4).
*/

const at = (mesh, x, y, z) => { mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; return mesh; };
const box = (w, h, d, hex, glow) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lam(hex, glow));

export const PROPS = {
  /* a small keep with a tower and a floating die */
  keep(g, ground) {
    const h = ground(-.3, -.2);
    g.add(at(box(1.1, 1.3, 1.1, "#EFE3D0"), -.3, h + .65, -.2));
    const roof = at(new THREE.Mesh(new THREE.ConeGeometry(.9, .9, 4), lam("#7FA3C8")), -.3, h + 1.75, -.2); roof.rotation.y = Math.PI / 4; g.add(roof);
    const th = ground(.65, .35);
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(.28, .32, 1.9, 10), lam("#E8DCC8")), .65, th + .95, .35));
    g.add(at(new THREE.Mesh(new THREE.ConeGeometry(.42, .7, 10), lam("#C9606F")), .65, th + 2.25, .35));
    const die = at(new THREE.Mesh(new THREE.IcosahedronGeometry(.5, 0), lam("#E5C36A", .2)), 1.5, h + 2.7, .7); die.rotation.set(.5, .3, .2); g.add(die);
  },

  /* a building under a floating map pin */
  pin(g, ground) {
    const h = ground(0, 0);
    g.add(at(box(1.8, .9, 1.1, "#F2D8A8", .08), 0, h + .45, 0));
    const roof = at(new THREE.Mesh(new THREE.ConeGeometry(1.2, .55, 4), lam("#C9606F")), 0, h + 1.17, 0); roof.rotation.y = Math.PI / 4; roof.scale.set(1.25, 1, .8); g.add(roof);
    g.add(at(box(.35, .05, 2.2, "#E5C36A"), .2, ground(.2, 1.4) + .03, 1.4));
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(.36, 20, 14), lam("#D9667F", .15)), 0, h + 2.6, 0));
    const tip = at(new THREE.Mesh(new THREE.ConeGeometry(.33, .75, 20), lam("#D9667F", .15)), 0, h + 2.1, 0); tip.rotation.x = Math.PI; g.add(tip);
    g.add(makeTree(1.5, -1.1, .55, false, ground));
  },

  /* stacked voxel blocks and a blocky tree */
  voxel(g, ground) {
    const b = new THREE.BoxGeometry(.42, .42, .42);
    const grass = lam("#7FA06A"), dirt = lam("#A07A6A"), wood = lam("#7A6070"), leaf = lam("#5F8A5A");
    [[1, 2, 1], [2, 3, 2], [1, 2, 1]].forEach((row, i) => row.forEach((n, j) => {
      for (let k = 0; k < n; k++) {
        const x = (i - 1) * .42 - .4, z = (j - 1) * .42;
        g.add(at(new THREE.Mesh(b, k === n - 1 ? grass : dirt), x, ground(x, z) + .21 + k * .42, z));
      }
    }));
    const tx = .9, tz = .2, ty = ground(tx, tz);
    for (let k = 0; k < 3; k++) g.add(at(new THREE.Mesh(b, wood), tx, ty + .21 + k * .42, tz));
    for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) for (let l = 0; l < 2; l++) {
      if (l === 1 && Math.abs(a) + Math.abs(c) === 2) continue;
      g.add(at(new THREE.Mesh(b, leaf), tx + a * .42, ty + 1.47 + l * .42, tz + c * .42));
    }
  },

  /* a four-wheeled robot cart with a light on its mast */
  robot(g, ground) {
    const k = 1.6, h = ground(0, .2);
    const r = new THREE.Group();
    r.add(at(box(1.3, .32, 1.3, "#7FA3C8"), 0, .42, .2));
    r.add(at(box(1.36, .14, .2, "#D9667F"), 0, .34, .9));
    [[-.6, -.45], [.6, -.45], [-.6, .85], [.6, .85]].forEach(([x, z]) => {
      const w = at(new THREE.Mesh(new THREE.CylinderGeometry(.21, .21, .16, 16), lam("#3A3346")), x, .22, z); w.rotation.z = Math.PI / 2; r.add(w);
    });
    r.add(at(box(.1, 1.1, .1, "#9A8D94"), -.35, 1.1, -.2));
    r.add(at(new THREE.Mesh(new THREE.SphereGeometry(.14, 12, 10), lam("#E5C36A", 1.2)), -.35, 1.72, -.2));
    r.scale.setScalar(k); r.position.y = h;
    g.add(r);
  },

  /* a chip with golden pins under a floating crystal */
  chip(g, ground) {
    const k = 1.5, h = ground(0, 0);
    const c = new THREE.Group();
    c.add(at(box(1.5, .2, 1.5, "#3A3346"), 0, .12, 0));
    for (let i = -2; i <= 2; i++) {
      c.add(at(box(.1, .06, .3, "#E5C36A"), i * .28, .05, .88)); c.add(at(box(.1, .06, .3, "#E5C36A"), i * .28, .05, -.88));
      c.add(at(box(.3, .06, .1, "#E5C36A"), .88, .05, i * .28)); c.add(at(box(.3, .06, .1, "#E5C36A"), -.88, .05, i * .28));
    }
    const crystal = at(new THREE.Mesh(new THREE.OctahedronGeometry(.48, 0), lam("#9DB8D0", .45)), 0, 1.6, 0);
    crystal.scale.set(1, 1.8, 1); crystal.rotation.y = .4; c.add(crystal);
    c.scale.setScalar(k); c.position.y = h;
    g.add(c);
  },

  /* a moon, some music notes and a blossom tree */
  moon(g, ground) {
    const h = ground(0, 0);
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(.8, 28, 20), lam("#F3E3B0", .55)), .9, h + 2.6, -.6));
    [[-.1, 1.4, 1.0], [.45, 2.1, 1.1], [1.0, 1.35, 1.2]].forEach(([x, y, z]) => {
      g.add(at(new THREE.Mesh(new THREE.SphereGeometry(.15, 14, 10), lam("#3A3346")), x, h + y, z));
      g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .55, 6), lam("#3A3346")), x + .13, h + y + .27, z));
    });
    g.add(makeTree(-1.5, -1.3, .5, true, ground));
  },

  /* fallback: a single tree */
  tree(g, ground) {
    g.add(makeTree(0, 0, .8, false, ground));
  },
};
