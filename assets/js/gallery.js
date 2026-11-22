import * as THREE from "three";
import { col, lam, makeIsland, topHeight } from "./nature.js";
import { PROPS } from "./props.js";

/*
  The Work stop: a salon wall of floating frames, one per project.
  A project with an `image` hangs as that picture, painted by the brush filter like everything else.
  A project without one gets a soft painted sky with its little island stepping out of the frame.
  Frames are laid out from content/projects.js, so adding a project adds a frame.
  This file also works out where the camera stands to see the whole wall or one piece.
*/

const CW = 9, CH = 5.6, BORDER = .7, LIP = .14;
const OW = CW + BORDER * 2, OH = CH + BORDER * 2;
const GAP_X = 3, GAP_Y = 2.6;
/* canvas colors for pieces without an image, top to bottom */
const SKIES = [["#E7A9B4", "#F7E6DA"], ["#97B6D3", "#EEF0E8"], ["#A9C79B", "#F2EEDA"], ["#E5C77F", "#F8EFDC"], ["#BBA8D8", "#F3E9EE"], ["#E9AE96", "#F9E7D6"]];

/* show an image like CSS object-fit: cover on a canvas of the given aspect */
function cover(tex, aspect) {
  const ia = tex.image.width / tex.image.height;
  if (ia > aspect) { tex.repeat.set(aspect / ia, 1); tex.offset.set((1 - aspect / ia) / 2, 0); }
  else { tex.repeat.set(1, ia / aspect); tex.offset.set(0, (1 - ia / aspect) / 2); }
}

export function makeGallery(projects, center) {
  const group = new THREE.Group();
  const PS = .42, ground = (x, z) => topHeight(x, z, PS);
  const frameMat = lam("#C39C63"), lipMat = lam("#EADCB8");
  const loader = new THREE.TextureLoader();

  const frames = projects.map((p, i) => {
    const g = new THREE.Group();
    const bar = (w, h, d, x, y, z, mat) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m);
    };
    bar(OW, BORDER, .5, 0, (CH + BORDER) / 2, 0, frameMat);
    bar(OW, BORDER, .5, 0, -(CH + BORDER) / 2, 0, frameMat);
    bar(BORDER, CH, .5, (CW + BORDER) / 2, 0, 0, frameMat);
    bar(BORDER, CH, .5, -(CW + BORDER) / 2, 0, 0, frameMat);
    bar(CW, LIP, .28, 0, (CH - LIP) / 2, .05, lipMat);
    bar(CW, LIP, .28, 0, -(CH - LIP) / 2, .05, lipMat);
    bar(LIP, CH, .28, (CW - LIP) / 2, 0, .05, lipMat);
    bar(LIP, CH, .28, -(CW - LIP) / 2, 0, .05, lipMat);

    let canvasMat, canvasGeo = new THREE.PlaneGeometry(CW, CH), isle = null, glow = 0;
    if (p.image?.src) {
      /* the project's own picture */
      const tex = loader.load(p.image.src, (t) => { cover(t, CW / CH); t.needsUpdate = true; });
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      canvasMat = new THREE.MeshLambertMaterial({ map: tex, emissive: col("#FFFFFF"), emissiveMap: tex, emissiveIntensity: .3 });
      glow = .22;
    } else {
      /* a soft painted sky, darker at the top, with the project's island in front */
      const [topHex, lowHex] = SKIES[i % SKIES.length];
      const geo = canvasGeo = new THREE.PlaneGeometry(CW, CH, 1, 10), cols = [], cp = geo.attributes.position;
      for (let v = 0; v < cp.count; v++) {
        const c = col(lowHex).lerp(col(topHex), Math.pow((cp.getY(v) + CH / 2) / CH, 1.3));
        cols.push(c.r, c.g, c.b);
      }
      geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
      canvasMat = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: col(lowHex), emissiveIntensity: .12 });
      isle = new THREE.Group();
      isle.add(makeIsland(PS, { tufts: 320 }));
      (PROPS[p.island] || PROPS.tree)(isle, ground);
      isle.scale.setScalar(.78);
      isle.position.set(0, .55, 2.2);
      isle.rotation.x = .32;
      g.add(isle);
    }
    const canvas = new THREE.Mesh(canvasGeo, canvasMat);
    canvas.position.z = -.1;
    canvas.receiveShadow = true;
    g.add(canvas);

    group.add(g);
    return { g, isle, canvasMat, glow, phase: i * 1.3, base: new THREE.Vector3(), lift: 0 };
  });

  let size = { width: OW, height: OH };
  /* salon hang: two rows on wide screens, two columns on narrow ones; a short last row is centered */
  function layout(narrow) {
    const n = frames.length, cols = narrow ? Math.min(2, n) : Math.ceil(n / 2), rows = Math.ceil(n / cols);
    const sx = OW + GAP_X, sy = OH + GAP_Y;
    frames.forEach((f, i) => {
      const r = Math.floor(i / cols), inRow = Math.min(cols, n - r * cols), c = i % cols;
      f.base.set(
        center.x + (c - (inRow - 1) / 2) * sx + Math.sin(i * 2.3) * .4,
        center.y + ((rows - 1) / 2 - r) * sy + Math.sin(i * 1.7) * .35,
        center.z + Math.cos(i * 1.9) * .7,
      );
      f.g.rotation.y = Math.sin(i * 3.1) * .04;
      f.g.position.copy(f.base);
    });
    size = { width: cols * sx - GAP_X + 1, height: rows * sy - GAP_Y + 1 };
  }

  /*
    Camera framing: the art (w × h) is fitted into the part of the screen the text leaves free.
    On wide screens the text takes `side` pixels on the left (or a detail sheet takes them on
    the right, when `open`); on narrow screens the text sits at the bottom.
  */
  function frameView(w, h, at, tan, narrow, side, open, out) {
    const W = innerWidth, H = innerHeight, aspect = W / H;
    let visH, sx = .5, sy = .5;
    if (narrow) {
      visH = Math.max(w / .84 / aspect, h / .44);
      sy = .3;
    } else {
      const free = Math.max(.3, .94 - side / W);
      visH = Math.max(w / (free * .9) / aspect, h / .7);
      sx = open ? .03 + free / 2 : .97 - free / 2;
    }
    const d = visH / (2 * tan);
    out.look.copy(at).add(new THREE.Vector3((.5 - sx) * visH * aspect, (sy - .5) * visH, 0));
    out.cam.copy(out.look).add(new THREE.Vector3(0, 1.2 + d * .04, d));
    return out;
  }
  /* how much room the text takes on the left, in pixels (see .stop and .stop-piece in style.css) */
  const textRoom = (px) => Math.min(72, innerWidth * .05) + px;
  const wallView = (tan, narrow, out) => frameView(size.width, size.height, center, tan, narrow, textRoom(440), false, out);
  const pieceView = (i, tan, narrow, open, out) => frameView(OW, OH, frames[i].base, tan, narrow, open ? Math.min(520, innerWidth - 24) + 36 : textRoom(370), open, out);

  /* which frame is under a ray, or -1 */
  const local = new THREE.Ray(), inv = new THREE.Matrix4(), hit = new THREE.Vector3();
  function pick(ray) {
    for (let i = 0; i < frames.length; i++) {
      inv.copy(frames[i].g.matrixWorld).invert();
      local.copy(ray).applyMatrix4(inv);
      if (Math.abs(local.direction.z) < 1e-4) continue;
      const s = -local.origin.z / local.direction.z;
      if (s <= 0) continue;
      hit.copy(local.origin).addScaledVector(local.direction, s);
      if (Math.abs(hit.x) < OW / 2 && Math.abs(hit.y) < OH / 2) return i;
    }
    return -1;
  }

  function tick(t, dt, highlighted, glow) {
    frames.forEach((f, i) => {
      f.lift += ((i === highlighted ? 1 : 0) - f.lift) * Math.min(1, dt * 5);
      f.g.position.set(f.base.x, f.base.y + Math.sin(t * .5 + f.phase) * .12, f.base.z + f.lift * 1.2);
      if (f.isle) {
        f.isle.rotation.y = Math.sin(t * .22 + f.phase) * .45 - .25;
        f.isle.position.y = .55 + Math.sin(t * .7 + f.phase) * .08;
      }
      f.canvasMat.emissiveIntensity = glow + f.glow + f.lift * .08;
    });
  }

  return { group, layout, wallView, pieceView, pick, tick, count: frames.length };
}
