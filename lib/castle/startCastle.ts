// @ts-nocheck
/* Innerve 11 — Infinity Castle (無限城) v2.
   Behavior-frozen Three.js flythrough wrapped in a start/dispose lifecycle.
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
import {
  CASTLE_FLOOR_A,
  CASTLE_FLOOR_B,
  CASTLE_SHAFT_Z,
  NIGHT_GATES,
  UPPER_MOONS,
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

export function startCastle(host: HTMLCanvasElement): () => void {
  let disposed = false;
  let rafId = 0;

  const state = (window.CASTLE = window.CASTLE || { progress: 0 });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = innerWidth < 700;
  const level = () => (window.SFX && window.SFX.level ? window.SFX.level() : 0);

  const renderer = new THREE.WebGLRenderer({ canvas: host, antialias: !mobile, powerPreference: "high-performance" });
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
  const shojiTall = canvasTex(256, 384, drawShoji, [3, 14]);
  const woodTex = canvasTex(256, 256, drawWood, [1, 8]);
  const tatamiTex = canvasTex(128, 256, drawTatami);

  /* ---------- materials ---------- */
  // Lambert keeps per-pixel cost low; everything static is merged below into a few draw calls
  const M = {
    shoji: new THREE.MeshLambertMaterial({ map: shojiTex, emissive: new THREE.Color("#ff9d4a"), emissiveMap: shojiTex, emissiveIntensity: 0.45, side: THREE.DoubleSide }),
    shojiTall: new THREE.MeshLambertMaterial({ map: shojiTall, emissive: new THREE.Color("#ff8a3a"), emissiveMap: shojiTall, emissiveIntensity: 0.45, side: THREE.DoubleSide }),
    wood: new THREE.MeshLambertMaterial({ map: woodTex }),
    beam: new THREE.MeshLambertMaterial({ color: "#1d0d08" }),
    red: new THREE.MeshLambertMaterial({ color: "#8e0a1f", emissive: new THREE.Color("#3a0008") }),
    tatami: new THREE.MeshLambertMaterial({ map: tatamiTex }),
    lantern: new THREE.MeshLambertMaterial({ color: "#ffcf8a", emissive: new THREE.Color("#ff7a1a"), emissiveIntensity: 2.4 }),
  };
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
  const corridor = (z0, z1, fy) => {
    const len = z0 - z1;
    const floor = box(6, 0.4, len, M.wood);
    floor.position.set(0, fy, (z0 + z1) / 2);
    world.add(floor);
    for (let z = z0 - 2, i = 0; z > z1; z -= 10, i++) {
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
  };
  corridor(10, -94, CASTLE_FLOOR_A);
  corridor(-112, -222, CASTLE_FLOOR_B);

  // the shaft: four glowing shoji walls you fall between
  const SH = 4.2;
  const wall = (w, h, x, y, z, ry) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.shojiTall);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    world.add(m);
  };
  wall(2 * SH, 82, -SH, -43, CASTLE_SHAFT_Z, Math.PI / 2);
  wall(2 * SH, 82, SH, -43, CASTLE_SHAFT_Z, -Math.PI / 2);
  wall(2 * SH, 76, 0, -46, CASTLE_SHAFT_Z + SH, Math.PI); // near wall starts below corridor A
  wall(2 * SH, 76, 0, -38, CASTLE_SHAFT_Z - SH, 0); // far wall ends above corridor B
  for (let y = -8, k = 0; y > -80; y -= 9, k++) {
    [[0, CASTLE_SHAFT_Z + SH], [0, CASTLE_SHAFT_Z - SH]].forEach(([x, z]) => {
      const b = box(2 * SH + 0.6, 0.4, 0.4, M.beam);
      b.position.set(x, y, z);
      world.add(b);
    });
    [[-SH, CASTLE_SHAFT_Z], [SH, CASTLE_SHAFT_Z]].forEach(([x, z]) => {
      const b = box(0.4, 0.4, 2 * SH + 0.6, M.beam);
      b.position.set(x, y, z);
      world.add(b);
    });
    lantern(k % 2 ? -SH + 0.7 : SH - 0.7, y - 1, CASTLE_SHAFT_Z + (k % 2 ? 1.5 : -1.5), world);
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
  rooms.position.set(0, -40, -105);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const roomMats = [M.shoji, M.wood, M.tatami, M.beam, M.red];
  const perMat = mobile ? 22 : 44;
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const instanced = [];
  const dummy = new THREE.Object3D();
  let tubePts = null; // filled once the camera path exists (below)
  const clearOfTube = (px, py, pz, radius) => {
    if (!tubePts) return true;
    const wx = px + rooms.position.x;
    const wy = py + rooms.position.y;
    const wz = pz + rooms.position.z;
    const need = (radius + 8) * (radius + 8);
    for (let i = 0; i < tubePts.length; i++) {
      const p = tubePts[i];
      const dx = p.x - wx;
      const dy = p.y - wy;
      const dz = p.z - wz;
      if (dx * dx + dy * dy + dz * dz < need) return false;
    }
    return true;
  };
  // per-instance transform: current + target (position, quaternion, scale)
  const makeSlot = (scaled) => {
    const t = { p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(1, 1, 1) };
    for (let tries = 0; tries < 40; tries++) {
      const ang = rnd(0, Math.PI * 2);
      const r = rnd(12, 70);
      t.p.set(Math.cos(ang) * r, rnd(-80, 80), Math.sin(ang) * r * 1.8);
      t.q.setFromEuler(
        new THREE.Euler(
          rnd(-0.6, 0.6) + (Math.random() < 0.25 ? Math.PI / 2 : 0),
          rnd(0, Math.PI),
          rnd(-0.6, 0.6) + (Math.random() < 0.2 ? Math.PI : 0)
        )
      );
      if (scaled) t.s.set(rnd(2, 10), rnd(0.4, 7), rnd(2, 12));
      else t.s.set(1, 1, 1);
      if (clearOfTube(t.p.x, t.p.y, t.p.z, scaled ? t.s.length() * 0.5 : 5)) return t;
    }
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
    instanced.push(inst);
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

  /* ---------- camera path ---------- */
  const path = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 0.4, 9),
      new THREE.Vector3(0, 0.4, -40),
      new THREE.Vector3(0, 0.4, -88),
      new THREE.Vector3(0, -2, -99),
      new THREE.Vector3(0, -14, -104),
      new THREE.Vector3(0, -45, -104),
      new THREE.Vector3(0, -70, -104),
      new THREE.Vector3(0, -78.6, -110),
      new THREE.Vector3(0, -79.6, -124),
      new THREE.Vector3(0, -79.6, -170),
      new THREE.Vector3(0, -79.6, -203),
    ],
    false,
    "centripetal"
  );
  tubePts = path.getSpacedPoints(160);
  // instances were placed before the path existed: re-seat any that sit inside the tube
  instanced.forEach((inst) => {
    for (let i = 0; i < inst.count; i++) {
      const c = inst.userData.cur[i];
      if (!clearOfTube(c.p.x, c.p.y, c.p.z, inst.userData.scaled ? c.s.length() * 0.5 : 5)) {
        const t = makeSlot(inst.userData.scaled);
        inst.userData.cur[i] = t;
        writeSlot(inst, i, t.p, t.q, t.s);
      }
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  /* ---------- Upper Moons — inflated 2.5D figures that turn and lunge ---------- */
  const demons = [];
  const auraTex = createAuraTexture();
  // each demon: the official art as a billboard
  const addDemon = (i, { id, kanji, x, fy, z, height, onPlatform }) => {
    const g = new THREE.Group();
    g.position.set(x, fy + 0.2, z);
    scene.add(g);
    const d = { g, i, h: height, x0: x, y0: g.position.y, side: Math.sign(x) || 1, lunge: 0, lunged: false, turn: 0, flat: null };
    demons.push(d);
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 0.81),
      new THREE.MeshBasicMaterial({ map: plateTex(kanji), transparent: true, depthWrite: false, toneMapped: false, fog: false, opacity: 0 })
    );
    plate.position.y = height + 0.7;
    g.add(plate);
    d.plate = plate;
    const aura = new THREE.Mesh(
      new THREE.PlaneGeometry(height * 1.5, height * 1.5),
      new THREE.MeshBasicMaterial({ map: auraTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, opacity: 0 })
    );
    aura.position.set(0, height * 0.5, -0.6);
    g.add(aura);
    d.aura = aura;
    new THREE.TextureLoader().load(`assets/img/chars/${id}.webp`, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const a = tex.image.width / tex.image.height;
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        color: new THREE.Color(0.8, 0.8, 0.8),
        transparent: true,
        alphaTest: 0.02,
        fog: false,
        depthWrite: false,
        toneMapped: false,
        opacity: 0,
      });
      d.flat = new THREE.Mesh(new THREE.PlaneGeometry(height * a, height), mat);
      d.flat.position.y = height / 2;
      g.add(d.flat);
    });
    if (onPlatform) {
      const p = box(3.2, 0.35, 3.2, M.red);
      p.position.set(x, fy, z);
      scene.add(p);
    }
  };
  UPPER_MOONS.forEach((moon, i) => addDemon(i, moon));

  /* ---------- the final doors ---------- */
  const DOOR_Z = -208;
  const DY = CASTLE_FLOOR_B + 3.2;
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 6.2), new THREE.MeshBasicMaterial({ color: "#ff1030", fog: false, toneMapped: false }));
  glow.position.set(0, DY, DOOR_Z - 0.6);
  scene.add(glow);
  const doorL = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 6), M.shoji);
  doorL.position.set(-1.6, DY, DOOR_Z);
  scene.add(doorL);
  const doorR = doorL.clone();
  doorR.position.x = 1.6;
  scene.add(doorR);
  const df = box(7.4, 0.5, 0.5, M.red);
  df.position.set(0, DY + 3.2, DOOR_Z);
  scene.add(df);

  /* ---------- hanging gate plaques on the way down ---------- */
  const nights = NIGHT_GATES.map((n) => ({ ...n }));
  const plaques = nights.map((n) => {
    const tex = canvasTex(1024, 512, drawPlaque(n));
    tex.anisotropy = 8;
    const mat = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.92, 0.92, 0.92), toneMapped: false, fog: true });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.6), mat);
    const y = n.fy + 4.35;
    m.position.set(0, y, n.z + 0.05);
    scene.add(m);
    [-2.3, 2.3].forEach((x) => {
      const c = box(0.07, 1.1, 0.07, M.beam);
      c.position.set(x, y + 1.85, n.z);
      scene.add(c);
    });
    const rim = box(5.5, 0.14, 0.2, M.red);
    rim.position.set(0, y - 1.35, n.z);
    scene.add(rim);
    const rim2 = box(5.5, 0.14, 0.2, M.red);
    rim2.position.set(0, y + 1.35, n.z);
    scene.add(rim2);
    n.pos = new THREE.Vector3(0, y, n.z);
    n.tex = tex;
    return m;
  });
  // fonts load after the first paint: redraw the plaques once they are in
  if (document.fonts && document.fonts.load) {
    Promise.all(["168px Anton", "64px 'Shippori Mincho B1'", "600 30px Inter"].map((f) => document.fonts.load(f, "壱15 NOVJAN")))
      .then(() =>
        nights.forEach((n) => {
          const c = n.tex.image;
          const g = c.getContext("2d");
          g.clearRect(0, 0, c.width, c.height);
          drawPlaque(n)(g, c.width, c.height);
          n.tex.needsUpdate = true;
        })
      )
      .catch(() => {});
  }
  // where on the scroll (0..1) the camera passes each gate: invert the same easing the camera uses
  const progressAt = (pt) => {
    let bu = 0;
    let bd = 1e9;
    for (let i = 0; i <= 600; i++) {
      const u = i / 600;
      const d = path.getPointAt(u).distanceTo(pt);
      if (d < bd) {
        bd = d;
        bu = u;
      }
    }
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
    n.p = progressAt(n.pos);
  });
  state.nights = nights.map(({ k, n, day, yr, what, at, p }) => ({ k, n, day, yr, what, at, p }));
  window.dispatchEvent(new CustomEvent("castle-gates", { detail: state.nights }));

  /* ---------- dust ---------- */
  const dustN = mobile ? 700 : 1500;
  const dust = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) {
    dust[i * 3] = rnd(-24, 24);
    dust[i * 3 + 1] = rnd(-95, 15);
    dust[i * 3 + 2] = rnd(-225, 12);
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute("position", new THREE.BufferAttribute(dust, 3));
  const dustMat = new THREE.PointsMaterial({ color: "#ffb36b", size: 0.08, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(dg, dustMat));

  /* ---------- biwa shifts: the castle rearranges itself ---------- */
  const SHIFTS = nights.map((n) => ({ at: n.p + 0.01, armed: true }));
  let lastShift = 0;
  let shiftKick = 0;
  let shiftT = 1; // 0..1 while rooms glide to their new places
  const shift = () => {
    window.SFX && window.SFX.play("biwa");
    instanced.forEach((inst) => {
      const u = inst.userData;
      for (let i = 0; i < inst.count; i++) {
        u.from[i] = { p: u.cur[i].p.clone(), q: u.cur[i].q.clone(), s: u.cur[i].s.clone() };
        u.to[i] = Math.random() < 0.3 ? makeSlot(u.scaled) : u.cur[i];
        u.to[i] = { p: u.to[i].p.clone(), q: u.to[i].q.clone(), s: u.to[i].s.clone() };
      }
    });
    shiftT = 0;
    shiftKick = 1;
    window.dispatchEvent(new CustomEvent("castle-shift"));
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
    bloom.resolution.set(w / 2, h / 2);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener("resize", resize);

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
    },
    { rootMargin: "0px" }
  );
  io.observe(host);

  const clock = new THREE.Clock();
  const UP = new THREE.Vector3(0, 1, 0);
  const UP_SHAFT = new THREE.Vector3(0, 0, -1);
  const Z = new THREE.Vector3(0, 0, 1);
  const fwdS = new THREE.Vector3(0, 0, -1);
  const fwd = new THREE.Vector3();
  const up = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  const m4 = new THREE.Matrix4();
  const qRoll = new THREE.Quaternion();
  const qLook = new THREE.Quaternion();
  const smoothstep = THREE.MathUtils.smoothstep;

  const frame = () => {
    if (disposed) return;
    rafId = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible) return;
    const t = clock.elapsedTime;
    const lv = level();
    smooth += (state.progress - smooth) * (reduced ? 1 : 1 - Math.exp(-dt * 8));
    // adaptive resolution: keep the flythrough fluid on any GPU
    ft = ft * 0.95 + dt * 0.05;
    frames++;
    if (frames > 150 && !document.hidden) {
      if (ft > 0.026 && dpr > 0.75) {
        dpr = Math.max(0.75, dpr * 0.9);
        renderer.setPixelRatio(dpr);
        resize();
        frames = 0;
      } else if (ft < 0.012 && dpr < DPR_MAX) {
        dpr = Math.min(DPR_MAX, dpr * 1.05);
        renderer.setPixelRatio(dpr);
        resize();
        frames = 0;
      }
    }
    const p = smooth;

    // biwa shifts when crossing thresholds (either direction)
    // each shift fires once going forward; it re-arms only after you scroll well back before it
    SHIFTS.forEach((s) => {
      if (s.armed && p >= s.at && performance.now() - lastShift > 1500) {
        s.armed = false;
        lastShift = performance.now();
        shift();
      } else if (!s.armed && p < s.at - 0.06) {
        s.armed = true;
      }
    });
    shiftKick *= 0.92;

    // ride the curve
    const u = Math.min(0.999, smoothstep(p, 0, 0.93));
    const pos = path.getPointAt(u);
    const ahead = path.getPointAt(Math.min(u + 0.015, 1));
    fwd.subVectors(ahead, pos).normalize();
    fwdS.lerp(fwd, 1 - Math.exp(-dt * 5)).normalize();
    fwd.copy(fwdS); // low-pass the look direction: no whip at the shaft entry
    const vert = smoothstep(Math.abs(fwd.y), 0.5, 0.95);
    up.copy(UP).lerp(UP_SHAFT, vert).normalize();
    const kM = 1 - Math.exp(-dt * 3);
    mouse.sx += (mouse.x - mouse.sx) * kM;
    mouse.sy += (mouse.y - mouse.sy) * kM;
    camera.position.copy(pos);
    camera.position.x += Math.sin(p * 11) * 0.35 + mouse.sx * 1.2;
    camera.position.y += (Math.sin(p * 15) * 0.2 - mouse.sy * 0.8) * (1 - vert);
    tmp.copy(camera.position).add(fwd);
    m4.lookAt(camera.position, tmp, up);
    qLook.setFromRotationMatrix(m4);
    const roll = Math.sin(p * Math.PI * 2.4) * 0.1 + vert * Math.sin(t * 0.8) * 0.16 + shiftKick * 0.1;
    qRoll.setFromAxisAngle(Z, roll);
    camera.quaternion.copy(qLook).multiply(qRoll);
    camera.rotateY(-mouse.sx * 0.22);
    camera.rotateX(-mouse.sy * 0.12);
    const baseFov = camera.aspect < 0.8 ? 80 : 64;
    camera.fov += (baseFov + vert * 10 + shiftKick * 6 - camera.fov) * (1 - Math.exp(-dt * 6));
    camera.updateProjectionMatrix();
    camLight.position.copy(camera.position).addScaledVector(fwd, 3);

    // world motion
    glideRooms(dt);
    M.lantern.emissiveIntensity = 2 + Math.sin(t * 9) * 0.25 + Math.sin(t * 23) * 0.15 + lv * 1.5;
    M.shoji.emissiveIntensity = M.shojiTall.emissiveIntensity = 0.42 + lv * 0.3 + shiftKick * 0.35;
    dustMat.size = 0.08 + lv * 0.12;

    // demons: billboards that face you, glow and lunge when close
    let near = -1;
    let nd = 1e9;
    demons.forEach((d) => {
      const dist = camera.position.distanceTo(d.g.position);
      if (dist > 80) {
        d.g.visible = false;
        return;
      }
      d.g.visible = true;
      const o = smoothstep(dist, 1.4, 4) * (1 - smoothstep(dist, 36, 64));
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
      tmp.copy(camera.position).sub(d.g.position).normalize();
      d.g.position.set(d.x0, d.y0 + Math.sin(t * 1.4 + d.i) * 0.08, d.g.position.z).addScaledVector(tmp, d.lunge * 1.6);
      d.aura.material.opacity = o * (0.3 + lv * 0.5 + d.lunge * 0.8 + Math.sin(t * 3 + d.i) * 0.08);
      d.aura.scale.setScalar(1 + d.lunge * 0.4 + Math.sin(t * 2 + d.i) * 0.04);
      if (dist < 24 && dist < nd) {
        nd = dist;
        near = d.i;
      }
    });
    if (p > 0.86) near = -1;
    if (near !== pendingMoon) {
      pendingMoon = near;
      pendingAt = performance.now();
    }
    if (pendingMoon !== moon && performance.now() - pendingAt > 350) {
      moon = pendingMoon;
      window.dispatchEvent(new CustomEvent("castle-moon", { detail: moon }));
    }
    if (near >= 0) {
      demonLight.position.copy(demons.find((d) => d.i === near).g.position).add(tmp2.set(0, 1, 2));
      demonLight.intensity += (9 - demonLight.intensity) * 0.1;
    } else {
      demonLight.intensity *= 0.9;
    }

    // which Night gate are we at?
    let night = -1;
    for (let i = 0; i < nights.length; i++) {
      if (camera.position.distanceTo(nights[i].pos) < (i === 0 ? 11 : 13) && p < 0.86) night = i;
    }
    if (night !== pendingNight) {
      pendingNight = night;
      pendingNightAt = performance.now();
    }
    if (pendingNight !== curNight && performance.now() - pendingNightAt > 200) {
      curNight = pendingNight;
      window.dispatchEvent(new CustomEvent("castle-night", { detail: curNight }));
    }
    // gate plaques sway a hair
    plaques.forEach((m, i) => {
      m.rotation.z = Math.sin(t * 0.9 + i * 2) * 0.008;
    });

    // doors
    const open = smoothstep(p, 0.88, 0.985);
    doorL.position.x = -1.6 - open * 3.4;
    doorR.position.x = 1.6 + open * 3.4;
    scene.fog.density = 0.026 - open * 0.012;

    bloom.strength = 0.55 + lv * 0.6 + shiftKick * 0.8 + open * 0.5;
    renderer.toneMappingExposure = 1 + shiftKick * 0.35;
    composer.render();
  };
  rafId = requestAnimationFrame(frame);

  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    removeEventListener("resize", resize);
    removeEventListener("pointermove", onPointer);
    io.disconnect();
    renderer.dispose();
  };
}

