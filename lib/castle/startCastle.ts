// @ts-nocheck
/* Innerve 11 — Infinity Castle (無限城) v2.
   Scroll-driven Three.js flythrough, with a shared route for the camera and scenery.
   The scroll driver (lib/scroll/driver.ts) pins #castle and writes window.CASTLE.progress (0..1).
   This renders, fires biwa "shifts" that rearrange the castle, and emits
   `castle-moon` / `castle-night` / `castle-gates` / `castle-shift` events
   consumed by the React HUD (components/sections/castle/InfinityCastle.tsx). */
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { gsap } from "gsap";
import { BEND_Z, distanceToRide, ENTRANCE_Z, EXIT_Z, EYE_HEIGHT, routeFraction, routePoint, turnAngle } from "./route";
import {
  CASTLE_FLOOR_A,
  NIGHT_GATES,
  UPPER_MOONS,
  ROUTE_EXTRAS,
} from "@/data/castle";
import {
  canvasTex,
  createAuraTexture,
  drawPlaque,
  drawShoji,
  drawTatami,
  drawWood,
  plateTex,
} from "@/lib/castle/textures";

export function startCastle(host: HTMLCanvasElement): (() => void) | undefined {
  let disposed = false;
  let rafId = 0;

  const state = (window.CASTLE = window.CASTLE || { progress: 0 });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = innerWidth < 700;
  const level = () => (window.SFX && window.SFX.level ? window.SFX.level() : 0);

  const attributes: WebGLContextAttributes = { antialias: !mobile, powerPreference: "high-performance" };
  const context = host.getContext("webgl2", attributes) ?? host.getContext("webgl", attributes);
  if (!context) return;
  const renderer = new THREE.WebGLRenderer({ canvas: host, context, ...attributes });
  const DPR_MAX = Math.min(devicePixelRatio, mobile ? 1.25 : 1.5);
  let dpr = DPR_MAX;
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0b0407");
  scene.fog = new THREE.FogExp2("#12060b", 0.026);
  const camera = new THREE.PerspectiveCamera(64, 1, 0.1, 500);

  state.info = renderer.info;
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.5, 0.82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- textures ---------- */
  const shojiTex = canvasTex(256, 384, drawShoji);
  const shaftBays = 20;
  const shaftPaper = canvasTex(256, 384, drawShoji, [2, shaftBays]);
  const woodTex = canvasTex(256, 256, drawWood, [1, 8]);
  const tatamiTex = canvasTex(128, 256, drawTatami);

  /* ---------- materials ---------- */
  // Lambert keeps per-pixel cost low; everything static is merged below into a few draw calls
  const M = {
    shoji: new THREE.MeshLambertMaterial({ map: shojiTex, emissive: new THREE.Color("#ff9d4a"), emissiveMap: shojiTex, emissiveIntensity: 0.45, side: THREE.DoubleSide }),
    shaftWall: new THREE.MeshLambertMaterial({ color: "#e5aa75", map: shaftPaper, emissive: "#ff983e", emissiveMap: shaftPaper, emissiveIntensity: 0.65 }),
    wood: new THREE.MeshLambertMaterial({ map: woodTex }),
    beam: new THREE.MeshLambertMaterial({ color: "#1d0d08" }),
    red: new THREE.MeshLambertMaterial({ color: "#8e0a1f", emissive: new THREE.Color("#3a0008") }),
    tatami: new THREE.MeshLambertMaterial({ map: tatamiTex }),
    lantern: new THREE.MeshLambertMaterial({ color: "#ffcf8a", emissive: new THREE.Color("#ff7a1a"), emissiveIntensity: 2.4 }),
  };
  // floating rooms/stairs (instanced only) dissolve as they near the lens, so a tumbling block never fills the view
  [M.shoji, M.wood, M.tatami, M.beam, M.red].forEach((mat) => {
    mat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader
        .replace("void main() {", "#ifdef USE_INSTANCING\nvarying float vNearD;\n#endif\nvoid main() {")
        .replace("#include <project_vertex>", "#include <project_vertex>\n#ifdef USE_INSTANCING\nvNearD = length(mvPosition.xyz);\n#endif");
      sh.fragmentShader = sh.fragmentShader.replace(
        "void main() {",
        "#ifdef USE_INSTANCING\nvarying float vNearD;\n#endif\nvoid main() {\n#ifdef USE_INSTANCING\n{ float fa = smoothstep(5.0, 15.0, vNearD); float dn = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))); if (fa < dn) discard; }\n#endif"
      );
    };
  });
  scene.add(new THREE.HemisphereLight("#ff9a6a", "#1a0610", 0.5));
  const camLight = new THREE.PointLight("#ffb070", 18, 26, 1.6);
  scene.add(camLight);
  const demonLight = new THREE.PointLight("#ff1a3c", 0, 14, 1.4);
  scene.add(demonLight);

  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const lanternGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.62, 10);
  const lantern = (x, y, z, parent) => {
    const l = new THREE.Mesh(lanternGeo, M.lantern);
    l.position.set(x, y, z);
    parent.add(l);
  };

  /* ---------- architecture ---------- */
  const world = new THREE.Group();
  scene.add(world);
  const lip = BEND_Z + 3;
  const floor = box(6, 0.4, 10 - lip, M.wood);
  floor.position.set(0, CASTLE_FLOOR_A, (10 + lip) / 2);
  world.add(floor);

  // Build the shaft in corridor coordinates, then tip the whole frame down.
  const shaft = new THREE.Group();
  shaft.rotation.x = -Math.PI / 2;
  shaft.position.copy(routePoint(0, 0, EXIT_Z));
  shaft.translateZ(-EXIT_Z);
  world.add(shaft);

  {
    const fy = CASTLE_FLOOR_A;
    for (let z = 8, i = 0; z > lip; z -= 10, i++) {
      [-3.1, 3.1].forEach((x) => {
        const p = box(0.45, 6.4, 0.45, M.beam);
        p.position.set(x, fy + 3, z);
        world.add(p);
      });
      const lin = box(7.4, 0.45, 0.55, M.red);
      lin.position.set(0, fy + 6.1, z);
      world.add(lin);
      const lin2 = box(6.8, 0.25, 0.4, M.beam);
      lin2.position.set(0, fy + 5.5, z);
      world.add(lin2);
      const side = i % 2 ? 1 : -1;
      for (let k = 0; k < 2; k++) {
        const s = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 5.4), M.shoji);
        s.position.set(side * 3.05, fy + 2.75, z - 2.2 - k * 2.6);
        s.rotation.y = (side * Math.PI) / 2;
        world.add(s);
      }
      lantern(-side * 2.4, fy + 4.8, z - 5, world);
    }
  }

  // Four inward-facing sheets meet at the corners. The paper lattice repeats
  // along each sheet, so the walls stay continuous between the timber frames.
  {
    const width = 9;
    const half = width / 2;
    const top = BEND_Z + CASTLE_FLOOR_A + 0.2 - EYE_HEIGHT;
    const bottom = -222;
    const length = top - bottom;
    const middle = (top + bottom) / 2;
    const wall = new THREE.PlaneGeometry(width, length);
    wall.rotateX(-Math.PI / 2);
    wall.translate(0, -half, 0);
    for (let side = 0; side < 4; side++) {
      const panel = new THREE.Mesh(wall, M.shaftWall);
      panel.rotation.z = side * Math.PI / 2;
      panel.position.set(0, EYE_HEIGHT, middle);
      shaft.add(panel);
    }

    const timber = 0.22;
    const edge = half - timber / 2;
    for (const x of [-edge, edge]) {
      for (const y of [-edge, edge]) {
        const post = box(timber, timber, length, M.beam);
        post.position.set(x, EYE_HEIGHT + y, middle);
        shaft.add(post);
      }
    }

    const span = width - 2 * timber;
    for (let bay = 0; bay <= shaftBays; bay++) {
      const z = top - length * bay / shaftBays;
      for (const offset of [-edge, edge]) {
        const across = box(span, timber, 0.32, M.beam);
        across.position.set(0, EYE_HEIGHT + offset, z);
        shaft.add(across);
        const upright = box(timber, span, 0.32, M.beam);
        upright.position.set(offset, EYE_HEIGHT, z);
        shaft.add(upright);
      }
      if (bay === 0) {
        for (const x of [-2.6, 2.6]) lantern(x, EYE_HEIGHT + half - 0.5, z, shaft);
      } else if (bay % 2 === 1) {
        const side = bay % 4 === 1 ? 1 : -1;
        lantern(side * (half - 0.4), EYE_HEIGHT + side * 1.8, z, shaft);
      }
    }
  }
  // Two lights mark the edge. The space below is open for the descent.
  for (const x of [-2.8, 2.8]) {
    const post = box(0.28, 1.2, 0.28, M.beam);
    post.position.set(x, CASTLE_FLOOR_A + 0.66, lip + 0.3);
    world.add(post);
    lantern(x, CASTLE_FLOOR_A + 1.55, lip + 0.3, world);
  }

  /* ---------- bake the static architecture: one draw call per material ---------- */
  {
    world.updateMatrixWorld(true);
    const byMat = new Map();
    world.traverse((o) => {
      if (!o.isMesh) return;
      const g = o.geometry.clone();
      g.applyMatrix4(o.matrixWorld);
      if (!byMat.has(o.material)) byMat.set(o.material, []);
      byMat.get(o.material).push(g);
    });
    world.clear();
    byMat.forEach((geos, mat) => world.add(new THREE.Mesh(mergeGeometries(geos, false), mat)));
  }

  /* ---------- floating rooms in every orientation (instanced) ----------
     Rooms never sit inside the camera tube (rejection-sampled against the flight path) and the
     "shift" re-places them with a smooth tween instead of popping them in and out. */
  const rooms = new THREE.Group();
  scene.add(rooms);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const roomMats = [M.shoji, M.wood, M.tatami, M.beam, M.red];
  const perMat = mobile ? 22 : 44;
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const instanced = [];
  const dummy = new THREE.Object3D();
  // encounter anchors (world coords): floating rooms must never cover a character
  const anchors = UPPER_MOONS.concat(ROUTE_EXTRAS).map((m) => routePoint(m.x, m.fy + m.height / 2 + 0.2, m.z));
  const clearOfDemons = (wx, wy, wz, radius) => {
    const need = radius + 10;
    for (const a of anchors) {
      const dx = a.x - wx;
      const dy = a.y - wy;
      const dz = a.z - wz;
      if (dx * dx + dy * dy + dz * dz < need * need) return false;
    }
    return true;
  };
  // the right-hand side of the terminal approach (final doors at z=-208):
  // keep big room faces out of the end view's right half so only the authored
  // doors and corridor remain there. Front (doors) and left side untouched.
  const endClearance = new THREE.Box3().setFromPoints([
    routePoint(2, CASTLE_FLOOR_A - 5.8, -186),
    routePoint(16, CASTLE_FLOOR_A + 12.2, -224),
  ]);
  const clearancePoint = new THREE.Vector3();
  const clearOfEnd = (wx, wy, wz, radius) => {
    return endClearance.distanceToPoint(clearancePoint.set(wx, wy, wz)) >= radius;
  };
  // oriented-box overlap (SAT, Gottschalk): true when the two boxes interpenetrate
  const qAxes = (q) => {
    const x = q.x, y = q.y, z = q.z, w = q.w;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx2 = w * x2, wy2 = w * y2, wz2 = w * z2;
    return [
      [1 - (yy + zz), xy - wz2, xz + wy2],
      [xy + wz2, 1 - (xx + zz), yz - wx2],
      [xz - wy2, yz + wx2, 1 - (xx + yy)],
    ];
  };
  const obbOverlap = (aA, eA, aB, eB, t) => {
    const R = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const AR = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      R[i][j] = aA[i][0] * aB[j][0] + aA[i][1] * aB[j][1] + aA[i][2] * aB[j][2];
      AR[i][j] = Math.abs(R[i][j]) + 1e-6;
    }
    const tA = [
      t[0] * aA[0][0] + t[1] * aA[0][1] + t[2] * aA[0][2],
      t[0] * aA[1][0] + t[1] * aA[1][1] + t[2] * aA[1][2],
      t[0] * aA[2][0] + t[1] * aA[2][1] + t[2] * aA[2][2],
    ];
    for (let i = 0; i < 3; i++) {
      if (Math.abs(tA[i]) > eA[i] + eB[0] * AR[i][0] + eB[1] * AR[i][1] + eB[2] * AR[i][2]) return false;
    }
    for (let j = 0; j < 3; j++) {
      const tB = tA[0] * R[0][j] + tA[1] * R[1][j] + tA[2] * R[2][j];
      if (Math.abs(tB) > eB[j] + eA[0] * AR[0][j] + eA[1] * AR[1][j] + eA[2] * AR[2][j]) return false;
    }
    for (let i = 0; i < 3; i++) {
      const i1 = (i + 1) % 3, i2 = (i + 2) % 3;
      for (let j = 0; j < 3; j++) {
        const j1 = (j + 1) % 3, j2 = (j + 2) % 3;
        const val = Math.abs(tA[i2] * R[i1][j] - tA[i1] * R[i2][j]);
        const rhs = eA[i1] * AR[i2][j] + eA[i2] * AR[i1][j] + eB[j1] * AR[i][j2] + eB[j2] * AR[i][j1];
        if (val > rhs) return false;
      }
    }
    return true;
  };
  // near the route, a new room must not interpenetrate an already-placed one
  const clearOfRooms = (px, py, pz, q, s) => {
    const e1 = [s.x / 2, s.y / 2, s.z / 2];
    const r1 = Math.hypot(e1[0], e1[1], e1[2]);
    let a1 = null;
    for (const inst of instanced) {
      if (!inst.userData.scaled) continue;
      const cur = inst.userData.cur;
      for (let i = 0; i < cur.length; i++) {
        const c = cur[i];
        if (!c || c.s.x === 0) continue;
        const e2 = [c.s.x / 2, c.s.y / 2, c.s.z / 2];
        const r2 = Math.hypot(e2[0], e2[1], e2[2]);
        const tx = c.p.x - px;
        const ty = c.p.y - py;
        const tz = c.p.z - pz;
        if (Math.hypot(tx, ty, tz) > r1 + r2) continue;
        if (!a1) a1 = qAxes(q);
        if (obbOverlap(a1, e1, qAxes(c.q), e2, [tx, ty, tz])) return false;
      }
    }
    return true;
  };
  // a biwa shift glides rooms to new slots: the glide path must not sweep
  // through the camera corridor or across a character
  const clearGlide = (fromSlot, t, bound) => {
    const dwx = t.p.x - fromSlot.p.x;
    const dwy = t.p.y - fromSlot.p.y;
    const dwz = t.p.z - fromSlot.p.z;
    const length = Math.hypot(dwx, dwy, dwz);
    const steps = Math.max(1, Math.ceil(length / 6));
    // Each midpoint covers half a step on either side, including between samples.
    const fBound = Math.max(bound, fromSlot.s.length() * 0.5) + length / (2 * steps);
    for (let k = 0; k < steps; k++) {
      const e = (k + 0.5) / steps;
      const x = fromSlot.p.x + dwx * e;
      const y = fromSlot.p.y + dwy * e;
      const z = fromSlot.p.z + dwz * e;
      if (distanceToRide(x, y, z) < fBound + 8) return false;
      if (!clearOfDemons(x, y, z, fBound)) return false;
      if (!clearOfEnd(x, y, z, fBound)) return false;
    }
    return true;
  };
  // per-instance transform: current + target (position, quaternion, scale).
  // fromSlot set (biwa shift): the glide from it must stay clear too; returns
  // null when nothing fits so the caller keeps the room where it is.
  const makeSlot = (scaled, fromSlot = null) => {
    const t = { p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(1, 1, 1) };
    for (let tries = 0; tries < 40; tries++) {
      const ang = rnd(0, Math.PI * 2);
      const r = rnd(12, 70);
      routePoint(Math.cos(ang) * r, rnd(-100, 60), -105 + Math.sin(ang) * r * 1.8, t.p);
      t.q.setFromEuler(
        new THREE.Euler(
          rnd(-0.6, 0.6) + (Math.random() < 0.25 ? Math.PI / 2 : 0),
          rnd(0, Math.PI),
          rnd(-0.6, 0.6) + (Math.random() < 0.2 ? Math.PI : 0)
        )
      );
      if (scaled) t.s.set(rnd(2, 10), rnd(0.4, 7), rnd(2, 12));
      else t.s.set(1, 1, 1);
      const bound = scaled ? t.s.length() * 0.5 : 9.5;
      const { x, y, z } = t.p;
      const dmin = distanceToRide(x, y, z);
      if (dmin < bound + 8) continue;
      if (!clearOfDemons(x, y, z, bound) || !clearOfEnd(x, y, z, bound)) continue;
      if (scaled && dmin < 34 && !clearOfRooms(x, y, z, t.q, t.s)) continue;
      if (fromSlot && !clearGlide(fromSlot, t, bound)) continue;
      return t;
    }
    if (fromSlot) return null;
    t.s.set(0, 0, 0);
    return t; // nowhere safe: leave it out
  };
  const writeSlot = (inst, i, p, q, sc) => {
    dummy.position.copy(p);
    dummy.quaternion.copy(q);
    dummy.scale.copy(sc);
    dummy.updateMatrix();
    inst.setMatrixAt(i, dummy.matrix);
  };
  const addInst = (inst, scaled) => {
    inst.userData.scaled = scaled;
    inst.userData.cur = [];
    inst.userData.from = [];
    inst.userData.to = [];
    instanced.push(inst);
    for (let i = 0; i < inst.count; i++) {
      const t = makeSlot(scaled);
      inst.userData.cur.push(t);
      inst.userData.from.push(null);
      inst.userData.to.push(null);
      writeSlot(inst, i, t.p, t.q, t.s);
    }
    inst.instanceMatrix.needsUpdate = true;
    inst.frustumCulled = false;
    rooms.add(inst);
  };
  roomMats.forEach((mat, k) => addInst(new THREE.InstancedMesh(boxGeo, mat, k === 0 ? perMat * 2 : perMat), true));
  {
    // staircases: one merged flight, instanced
    const steps = [];
    for (let k = 0; k < 10; k++) {
      const g = new THREE.BoxGeometry(2.4, 0.3, 0.9);
      g.translate(0, k * 0.45, -k * 0.8);
      steps.push(g);
    }
    addInst(new THREE.InstancedMesh(mergeGeometries(steps), M.wood, 22), false);
  }

  /* ---------- Upper Moons — inflated 2.5D figures that turn and lunge ---------- */
  const demons = [];
  const auraTex = createAuraTexture();
  // each demon: the official art as a billboard
  const addDemon = (i, { id, kanji, x, fy, z, height, onPlatform }) => {
    const g = new THREE.Group();
    // Center the art in its own encounter plane.
    routePoint(x, fy + height / 2 + 0.2, z, g.position);
    scene.add(g);
    const d = { g, i, home: g.position.clone(), pathU: routeFraction(z), side: Math.sign(x) || 1, lunge: 0, lunged: false, turn: 0, flat: null };
    demons.push(d);
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 0.81),
      new THREE.MeshBasicMaterial({ map: plateTex(kanji), transparent: true, depthWrite: false, toneMapped: false, fog: false, opacity: 0 })
    );
    plate.position.y = height + 0.7;
    g.add(plate);
    plate.visible = false; // kanji name plate removed
    d.plate = plate;
    const aura = new THREE.Mesh(
      new THREE.PlaneGeometry(height * 1.5, height * 1.5),
      new THREE.MeshBasicMaterial({ map: auraTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, opacity: 0 })
    );
    aura.position.set(0, 0, -0.6);
    g.add(aura);
    d.aura = aura;
    // Retry a failed art load: a transient failure (dev recompile, network hiccup) must not
    // remove the character for the whole session. Names the file on the console if it never loads.
    const artUrl = `assets/img/chars/${id}.webp`;
    let artAttempts = 0;
    const loadArt = () => {
      if (disposed) return;
      new THREE.TextureLoader().load(artUrl, onArt, undefined, () => {
        if (disposed) return;
        artAttempts++;
        if (artAttempts < 4) d.artTimer = setTimeout(loadArt, 800 * artAttempts);
        else console.error(`castle: character art failed to load after retries: ${artUrl}`);
      });
    };
    const onArt = (tex) => {
      if (disposed) { tex.dispose(); return; }
      tex.colorSpace = THREE.SRGBColorSpace;
      const a = tex.image.width / tex.image.height;
      // art that is cropped at its bottom edge (Doma) shows a hard cut: fade its lower part out
      let useTex = tex;
      try {
        const im = tex.image;
        const cv = document.createElement("canvas");
        cv.width = im.width;
        cv.height = im.height;
        const cx = cv.getContext("2d");
        cx.drawImage(im, 0, 0);
        const row = cx.getImageData(0, im.height - 2, im.width, 1).data;
        let solid = 0;
        for (let q = 3; q < row.length; q += 4) if (row[q] > 200) solid++;
        if (solid > im.width * 0.25) {
          const gr = cx.createLinearGradient(0, im.height * 0.62, 0, im.height);
          gr.addColorStop(0, "rgba(0,0,0,1)");
          gr.addColorStop(1, "rgba(0,0,0,0)");
          cx.globalCompositeOperation = "destination-in";
          cx.fillStyle = gr;
          cx.fillRect(0, 0, im.width, im.height);
          useTex = new THREE.CanvasTexture(cv);
          useTex.colorSpace = THREE.SRGBColorSpace;
          tex.dispose();
          d.cropped = true;
          if (d.plat) d.plat.visible = false;
        }
      } catch (e) {
        /* keep the original texture */
      }
      const mat = new THREE.MeshBasicMaterial({
        map: useTex,
        color: new THREE.Color(0.8, 0.8, 0.8),
        transparent: true,
        alphaTest: 0.02,
        fog: false,
        depthWrite: false,
        toneMapped: false,
        opacity: 0,
      });
      d.flat = new THREE.Mesh(new THREE.PlaneGeometry(height * a, height), mat);
      d.flat.position.y = 0;
      g.add(d.flat);
    };
    loadArt();
    if (onPlatform) {
      const p = box(1.6, 0.3, 1.6, M.red);
      routePoint(x, fy, z, p.position);
      p.rotation.x = -turnAngle(z);
      // dissolves like the character: a solid slab passing the lens would fill the screen
      p.material = p.material.clone();
      p.material.transparent = true;
      p.material.depthWrite = false;
      d.plat = p;
      scene.add(p);
    }
  };
  UPPER_MOONS.forEach((moon, i) => addDemon(i, moon));
  ROUTE_EXTRAS.forEach((moon, k) => addDemon(UPPER_MOONS.length + k, moon));
  /* ---------- the final doors ---------- */
  const DOOR_Z = -208;
  const DY = CASTLE_FLOOR_A + 3.2;
  const doorway = new THREE.Group();
  routePoint(0, DY, DOOR_Z, doorway.position);
  doorway.rotation.x = -turnAngle(DOOR_Z);
  scene.add(doorway);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 6.2), new THREE.MeshBasicMaterial({ color: "#ff1030", fog: false, toneMapped: false }));
  glow.position.z = -0.6;
  doorway.add(glow);
  const doorL = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 6), M.shoji);
  doorL.position.x = -1.6;
  doorway.add(doorL);
  const doorR = doorL.clone();
  doorR.position.x = 1.6;
  doorway.add(doorR);
  const df = box(7.4, 0.5, 0.5, M.red);
  df.position.y = 3.2;
  doorway.add(df);

  /* ---------- hanging gate plaques on the way down ---------- */
  const nights = NIGHT_GATES.map((n) => ({ ...n }));
  const plaques = nights.map((n) => {
    const tex = canvasTex(1024, 512, drawPlaque(n));
    tex.anisotropy = 8;
    const mat = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.92, 0.92, 0.92), toneMapped: false, fog: true, transparent: true });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.6), mat);
    const gate = new THREE.Group();
    routePoint(0, n.fy + 4.35, n.z, gate.position);
    gate.rotation.x = -turnAngle(n.z);
    scene.add(gate);
    m.position.z = 0.05;
    gate.add(m);
    const cordMat = M.beam.clone();
    const rimMat = M.red.clone();
    for (const trim of [cordMat, rimMat]) {
      trim.transparent = true;
      trim.depthWrite = false;
    }
    [-2.3, 2.3].forEach((x) => {
      const c = box(0.07, 1.1, 0.07, cordMat);
      c.position.set(x, 1.85, 0);
      gate.add(c);
    });
    {
      for (const y of [-1.35, 1.35]) {
        const rim = box(5.5, 0.14, 0.2, rimMat);
        rim.position.y = y;
        gate.add(rim);
      }
    }
    n.pos = gate.position;
    n.tex = tex;
    return { gate, materials: [mat, cordMat, rimMat] };
  });
  // fonts load after the first paint: redraw the plaques once they are in
  if (document.fonts && document.fonts.load) {
    Promise.all(["168px Anton", "64px 'Shippori Mincho B1'", "600 30px Inter"].map((f) => document.fonts.load(f, "壱15 NOVJAN")))
      .then(() => {
        if (disposed) return;
        nights.forEach((n) => {
          const c = n.tex.image;
          const g = c.getContext("2d");
          g.clearRect(0, 0, c.width, c.height);
          drawPlaque(n)(g, c.width, c.height);
          n.tex.needsUpdate = true;
        });
      })
      .catch(() => {});
  }
  // where on the scroll (0..1) the camera passes each gate: invert the same easing the camera uses
  const progressAt = (z) => {
    const bu = routeFraction(z);
    let lo = 0;
    let hi = 0.93;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (THREE.MathUtils.smoothstep(mid, 0, 0.93) < bu) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  nights.forEach((n) => {
    n.p = progressAt(n.z);
  });
  state.nights = nights.map(({ k, n, day, yr, what, at, p }) => ({ k, n, day, yr, what, at, p }));
  window.dispatchEvent(new CustomEvent("castle-gates", { detail: state.nights }));

  /* ---------- dust ---------- */
  const dustN = mobile ? 700 : 1500;
  const dust = new Float32Array(dustN * 3);
  const mote = new THREE.Vector3();
  for (let i = 0; i < dustN; i++) {
    routePoint(rnd(-24, 24), rnd(-55, 15), rnd(-225, 12), mote).toArray(dust, i * 3);
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute("position", new THREE.BufferAttribute(dust, 3));
  const dustMat = new THREE.PointsMaterial({ color: "#ffb36b", size: 0.08, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(dg, dustMat));

  /* ---------- biwa shifts: the castle rearranges itself ---------- */
  const SHIFTS = nights.map((n) => ({ at: n.p + 0.01, armed: true }));
  let lastShift = 0;
  let shiftKick = 0;
  let shiftRaw = 0; // the kick's target: set to 1 by a shift, decays in real time
  let shiftT = 1; // 0..1 while rooms glide to their new places
  const shift = () => {
    window.SFX && window.SFX.play("biwa");
    instanced.forEach((inst) => {
      const u = inst.userData;
      for (let i = 0; i < inst.count; i++) {
        u.from[i] = { p: u.cur[i].p.clone(), q: u.cur[i].q.clone(), s: u.cur[i].s.clone() };
        const ns = Math.random() < 0.3 ? makeSlot(u.scaled, u.cur[i]) : null;
        const dst = ns || u.cur[i];
        u.to[i] = { p: dst.p.clone(), q: dst.q.clone(), s: dst.s.clone() };
      }
    });
    shiftT = 0;
    shiftRaw = 1;
    window.dispatchEvent(new CustomEvent("castle-shift", { detail: { shaft: 0 } }));
  };
  const glideRooms = (dt) => {
    if (shiftT >= 1) return;
    shiftT = Math.min(1, shiftT + dt / 1.1);
    const e = 1 - Math.pow(1 - shiftT, 3);
    instanced.forEach((inst) => {
      const u = inst.userData;
      for (let i = 0; i < inst.count; i++) {
        const f = u.from[i];
        const t = u.to[i];
        const c = u.cur[i];
        c.p.lerpVectors(f.p, t.p, e);
        c.q.slerpQuaternions(f.q, t.q, e);
        c.s.lerpVectors(f.s, t.s, e);
        writeSlot(inst, i, c.p, c.q, c.s);
      }
      inst.instanceMatrix.needsUpdate = true;
    });
  };

  /* ---------- loop ---------- */
  const resize = () => {
    const w = host.clientWidth || innerWidth;
    const h = host.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const sizes = new ResizeObserver(resize);
  sizes.observe(host);

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  const onPointer = (e) => {
    mouse.x = e.clientX / innerWidth - 0.5;
    mouse.y = e.clientY / innerHeight - 0.5;
  };
  addEventListener("pointermove", onPointer);
  let pendingMoon = -1;
  let pendingAt = 0;
  let pendingNight = -1;
  let pendingNightAt = 0;
  let curNight = -1;
  let visible = false;
  let smooth = 0;
  let moon = -1;
  let ft = 1 / 60;
  let frames = -60;
  const io = new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      state.visible = visible;
      if (visible) smooth = state.progress;
    },
    { rootMargin: "0px" }
  );
  io.observe(host);

  const clock = new THREE.Clock();
  const fwd = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  const smoothstep = THREE.MathUtils.smoothstep;

  const frame = () => {
    if (disposed) return;
    rafId = requestAnimationFrame(frame);
    const dtRaw = clock.getDelta();
    const dt = Math.min(dtRaw, 0.05);
    if (!visible) return;
    const t = clock.elapsedTime;
    const lv = level();
    smooth += (state.progress - smooth) * (reduced ? 1 : 1 - Math.exp(-Math.min(dtRaw, 0.25) * 8));
    // adaptive resolution: keep the flythrough fluid on any GPU
    ft = ft * 0.95 + dt * 0.05;
    frames++;
    if (frames > 150 && !document.hidden) {
      if (ft > 0.026 && dpr > 0.75) {
        dpr = Math.max(0.75, dpr * 0.9);
        renderer.setPixelRatio(dpr);
        composer.setPixelRatio(dpr);
        resize();
        frames = 0;
      } else if (ft < 0.012 && dpr < DPR_MAX) {
        dpr = Math.min(DPR_MAX, dpr * 1.05);
        renderer.setPixelRatio(dpr);
        composer.setPixelRatio(dpr);
        resize();
        frames = 0;
      }
    }
    const p = smooth;

    // Consume every crossed gate, including ones skipped in a fast scroll.
    let crossedGate = false;
    SHIFTS.forEach((s) => {
      if (s.armed && p >= s.at) {
        s.armed = false;
        crossedGate = true;
      } else if (!s.armed && p < s.at - 0.06) {
        s.armed = true;
      }
    });
    if (crossedGate && performance.now() - lastShift > 1500) {
      lastShift = performance.now();
      shift();
    }
    // sudden but not a one-frame snap: the kick rises in ~40ms and decays at the same rate on any frame rate
    shiftRaw *= Math.exp(-Math.min(dtRaw, 0.25) * 5);
    shiftKick += (shiftRaw - shiftKick) * (1 - Math.exp(-Math.min(dtRaw, 0.25) * 25));

    // Keep the visitor's left and right steady as the camera pitches into the shaft.
    const u = smoothstep(p, 0, 0.93);
    const z = THREE.MathUtils.lerp(ENTRANCE_Z, EXIT_Z, u);
    const angle = turnAngle(z);
    fwd.set(0, -Math.sin(angle), -Math.cos(angle));
    const kM = 1 - Math.exp(-dt * 3);
    mouse.sx += (mouse.x - mouse.sx) * kM;
    mouse.sy += (mouse.y - mouse.sy) * kM;
    routePoint(Math.sin(p * 11) * 0.28 + mouse.sx, EYE_HEIGHT + Math.sin(p * 15) * 0.14 - mouse.sy * 0.6, z, camera.position);
    camera.rotation.set(-angle - mouse.sy * 0.12, -mouse.sx * 0.18, shiftKick * 0.018, "XYZ");
    const baseFov = camera.aspect < 0.8 ? 80 : 64;
    camera.fov += (baseFov + shiftKick * 2 - camera.fov) * (1 - Math.exp(-dt * 6));
    camera.updateProjectionMatrix();
    camLight.position.copy(camera.position).addScaledVector(fwd, 3);

    // world motion
    glideRooms(dt);
    M.lantern.emissiveIntensity = 2 + Math.sin(t * 9) * 0.25 + Math.sin(t * 23) * 0.15 + lv * 1.5;
    M.shoji.emissiveIntensity = 0.42 + lv * 0.3 + shiftKick * 0.15;
    dustMat.size = 0.08 + lv * 0.12;

    // demons: billboards that face you, glow and lunge when close
    let near = -1;
    let nd = 1e9;
    demons.forEach((d) => {
      const dist = camera.position.distanceTo(d.home);
      if (dist > 80) {
        d.g.visible = false;
        return;
      }
      d.g.visible = true;
      // dissolve before the camera reaches it: an opaque character plate at close range fills the whole screen
      const routeDistance = d.pathU - u;
      const reveal = smoothstep(routeDistance, -0.012, 0.008) * (1 - smoothstep(routeDistance, 0.1, 0.15));
      // figures are ~20+ units apart, so a 12-38 unit fade shows one or two at different depths, never a pile
      const o = smoothstep(dist, 7, 12) * (1 - smoothstep(dist, 28, 40)) * reveal;
      if (d.plat) d.plat.material.opacity = smoothstep(dist, 9, 16) * (1 - smoothstep(dist, 36, 64));
      d.plate.material.opacity = o * (0.8 + Math.sin(t * 4 + d.i) * 0.2);
      d.plate.quaternion.copy(camera.quaternion);
      const prox = 1 - smoothstep(dist, 3, 26);
      d.turn += (d.side * -0.6 * prox - d.turn) * (1 - Math.exp(-dt * 3));
      if (d.flat) {
        d.g.quaternion.copy(camera.quaternion);
        d.g.rotateY(d.turn * 0.5);
        d.flat.material.opacity = o;
      }
      if (!d.lunged && dist < 9) {
        d.lunged = true;
        window.SFX && window.SFX.play("whoosh");
        gsap.timeline().to(d, { lunge: 1, duration: 0.22, ease: "power3.out" }).to(d, { lunge: 0, duration: 0.9, ease: "power2.inOut" });
      }
      if (dist > 45) d.lunged = false;
      tmp.copy(camera.position).sub(d.home).normalize();
      d.g.position.copy(d.home).addScaledVector(tmp, d.lunge * 1.6);
      d.g.translateY(Math.sin(t * 1.4 + d.i) * 0.08);
      d.aura.material.opacity = o * (0.3 + lv * 0.5 + d.lunge * 0.8 + Math.sin(t * 3 + d.i) * 0.08);
      d.aura.scale.setScalar(1 + d.lunge * 0.4 + Math.sin(t * 2 + d.i) * 0.04);
      if (d.i < UPPER_MOONS.length && dist < 24 && dist < nd && tmp.subVectors(d.g.position, camera.position).dot(fwd) > -3) {
        nd = dist;
        near = d.i;
      }
    });
    if (p > 0.86) near = -1;
    if (near !== pendingMoon) {
      pendingMoon = near;
      pendingAt = performance.now();
    }
    if (pendingMoon !== moon && (pendingMoon < 0 || performance.now() - pendingAt > 350)) {
      moon = pendingMoon;
      window.dispatchEvent(new CustomEvent("castle-moon", { detail: moon }));
    }
    if (near >= 0) {
      demonLight.position.copy(demons[near].g.position).add(tmp2.set(0, 1, 2).applyQuaternion(camera.quaternion));
      demonLight.intensity += (9 - demonLight.intensity) * 0.1;
    } else {
      demonLight.intensity *= 0.9;
    }

    // which Night gate are we at?
    // only a gate still ahead of (or just under) the camera counts; once passed its date goes at once
    let night = -1;
    let nearestGate = 1e9;
    for (let i = 0; i < nights.length; i++) {
      const gd = camera.position.distanceTo(nights[i].pos);
      if (gd < (i === 0 ? 11 : 13) && gd < nearestGate && p > 0.14 && p < 0.86 && tmp2.subVectors(nights[i].pos, camera.position).dot(fwd) > -3) {
        night = i;
        nearestGate = gd;
      }
    }
    if (night !== pendingNight) {
      pendingNight = night;
      pendingNightAt = performance.now();
    }
    if (pendingNight !== curNight && (pendingNight < 0 || performance.now() - pendingNightAt > 90)) {
      curNight = pendingNight;
      window.dispatchEvent(new CustomEvent("castle-night", { detail: curNight }));
    }
    // gate plaques sway a hair
    plaques.forEach(({ gate, materials }, i) => {
      gate.rotation.z = Math.sin(t * 0.9 + i * 2) * 0.008;
      const opacity = smoothstep(camera.position.distanceTo(gate.position), 6, 9);
      gate.visible = opacity > 0;
      materials.forEach((material) => { material.opacity = opacity; });
    });

    // doors
    const open = smoothstep(p, 0.88, 0.985);
    doorL.position.x = -1.6 - open * 3.4;
    doorR.position.x = 1.6 + open * 3.4;
    scene.fog.density = 0.026 - open * 0.012;

    bloom.strength = 0.55 + lv * 0.6 + shiftKick * 0.3 + open * 0.35;
    renderer.toneMappingExposure = 1 + shiftKick * 0.1;
    composer.render();
  };
  rafId = requestAnimationFrame(frame);

  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    demons.forEach((d) => {
      clearTimeout(d.artTimer);
      gsap.killTweensOf(d);
    });
    sizes.disconnect();
    removeEventListener("pointermove", onPointer);
    io.disconnect();
    state.visible = false;
    state.info = undefined;
    const resources = new Set();
    scene.traverse((object) => {
      if (!object.geometry) return;
      resources.add(object.geometry);
      if (object.isInstancedMesh) object.dispose();
      resources.add(object.material);
      if (object.material.map) resources.add(object.material.map);
    });
    resources.forEach((resource) => resource.dispose());
    composer.passes.forEach((pass) => pass.dispose());
    composer.dispose();
    renderer.dispose();
  };
}

