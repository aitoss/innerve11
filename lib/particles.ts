import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  MathUtils,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";

const DESKTOP_COUNT = 420;
const PHONE_COUNT = 120;
const FRAME_INTERVAL = 1000 / 30 - 1;

const MODES = {
  light: { speed: -0.035, size: 5.2, petal: 1, a: new Color("#c9b2f0"), b: new Color("#ffc1d9"), alpha: 0.9 },
  dark: { speed: 0.035, size: 3.2, petal: 0, a: new Color("#efe8dc"), b: new Color("#7d6f7b"), alpha: 0.4 },
  red: { speed: 0.11, size: 4.2, petal: 0, a: new Color("#ffd23a"), b: new Color("#ff6a00"), alpha: 0.85 },
};

function drawPetalTexture() {
  const source = document.createElement("canvas");
  source.width = source.height = 128;
  const brush = source.getContext("2d");
  if (!brush) return;

  brush.translate(64, 64);
  // The small V in the broad end gives the petal its notch.
  const shape = new Path2D("M0 56 C-30 40 -40 6 -30 -22 C-22 -44 -10 -54 -4 -56 L0 -44 L4 -56 C10 -54 22 -44 30 -22 C40 6 30 40 0 56 Z");
  const fill = brush.createLinearGradient(0, 56, 0, -56);
  fill.addColorStop(0, "#c2185b");
  fill.addColorStop(0.18, "#f48fb1");
  fill.addColorStop(0.6, "#ffd1e3");
  fill.addColorStop(1, "#fff4f8");
  brush.fillStyle = fill;
  brush.fill(shape);

  brush.globalCompositeOperation = "source-atop";
  const shade = brush.createRadialGradient(-12, -6, 4, 0, 0, 70);
  shade.addColorStop(0, "rgb(255 255 255 / 45%)");
  shade.addColorStop(1, "rgb(120 0 40 / 25%)");
  brush.fillStyle = shade;
  brush.fillRect(-64, -64, 128, 128);
  brush.strokeStyle = "rgb(170 20 80 / 35%)";
  brush.lineWidth = 2;
  brush.beginPath();
  brush.moveTo(0, 52);
  brush.quadraticCurveTo(-2, 0, 0, -40);
  brush.stroke();

  const texture = new CanvasTexture(source);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

const vertexShader = /* glsl */ `
  attribute vec4 seed;
  uniform float uTime, uTravel, uAspect, uSize, uPetal, uPulse;
  uniform vec2 uPointer;
  varying float vTint, vSpin, vFlip, vFade;

  void main() {
    // Wrap beyond the edges while fully transparent and vary the speed by seed.
    float y = fract(seed.y + uTravel * (0.45 + seed.z)) * 2.4 - 1.2;
    float sway = sin(uTime * (0.3 + seed.w) + seed.z * 6.28);
    vec2 p = vec2((seed.x * 2.0 - 1.0) * 1.1 + sway * (0.04 + 0.08 * uPetal), y);

    vec2 aspect = vec2(uAspect, 1.0);
    vec2 away = (p - uPointer) * aspect;
    float distance = length(away);
    p += (away / max(distance, 0.001)) * (1.0 - smoothstep(0.0, 0.28, distance)) * 0.12 / aspect;

    gl_Position = vec4(p, 0.0, 1.0);
    gl_PointSize = uSize * (0.5 + seed.w * 1.6) * (1.0 + uPetal * 1.6) * (1.0 + uPulse);
    float petalDensity = step(0.45, fract(seed.w * 7.31 + seed.z * 3.7));
    float edgeFade = 1.0 - smoothstep(0.73, 1.02, abs(y));
    vFade = edgeFade * mix(1.0, petalDensity, uPetal);
    vTint = seed.z;
    vSpin = uTime * (seed.x - 0.5) * 3.0 + seed.y * 6.28;
    vFlip = cos(uTime * (1.2 + seed.w * 2.5) + seed.x * 6.28);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA, uColorB;
  uniform float uAlpha, uPetal;
  uniform sampler2D uPetalTexture;
  varying float vTint, vSpin, vFlip, vFade;

  void main() {
    if (vFade < 0.001) discard;
    vec2 uv = gl_PointCoord - 0.5;
    float c = cos(vSpin), s = sin(vSpin);
    uv = mat2(c, -s, s, c) * uv;

    vec3 tint = mix(uColorA, uColorB, vTint);
    float disc = 1.0 - smoothstep(0.0, 0.5, length(uv));
    vec4 particle = vec4(tint, disc * disc);

    // Narrow the drawn petal and darken its reverse side during a flip.
    float flip = max(abs(vFlip), 0.12);
    vec2 petalUV = vec2(uv.x / flip, uv.y) + 0.5;
    vec4 blossom = texture2D(uPetalTexture, petalUV);
    blossom.rgb *= mix(vec3(1.0), tint, 0.52) * mix(0.77, 1.0, vFlip * 0.5 + 0.5);
    blossom.a *= step(0.0, petalUV.x) * step(petalUV.x, 1.0);

    vec4 color = mix(particle, blossom, uPetal);
    gl_FragColor = vec4(color.rgb, color.a * uAlpha * vFade);
    #include <colorspace_fragment>
  }
`;

function currentMode() {
  if (document.documentElement.classList.contains("hinokami")) return MODES.red;
  const tone = document.body.dataset.tone ?? document.elementFromPoint(1, 32)?.closest<HTMLElement>("[data-tone]")?.dataset.tone;
  return tone === "red" ? MODES.red : tone === "dark" ? MODES.dark : MODES.light;
}

export function startParticles(canvas: HTMLCanvasElement, startSection: HTMLElement) {
  const attributes: WebGLContextAttributes = { alpha: true, antialias: false, powerPreference: "low-power" };
  const context = canvas.getContext("webgl2", attributes) ?? canvas.getContext("webgl", attributes);
  if (!context) return;
  const texture = drawPetalTexture();
  if (!texture) return;

  const renderer = new WebGLRenderer({ canvas, context, ...attributes });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1);
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(DESKTOP_COUNT * 3), 3));
  geometry.setAttribute("seed", new BufferAttribute(Float32Array.from({ length: DESKTOP_COUNT * 4 }, Math.random), 4));

  const initialMode = currentMode();
  const uniforms = {
    uTime: { value: 0 },
    uTravel: { value: 0 },
    uAspect: { value: 1 },
    uSize: { value: initialMode.size },
    uPetal: { value: initialMode.petal },
    uPulse: { value: 0 },
    uAlpha: { value: initialMode.alpha },
    uPointer: { value: new Vector2(9, 9) },
    uColorA: { value: initialMode.a.clone() },
    uColorB: { value: initialMode.b.clone() },
    uPetalTexture: { value: texture },
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false; // the shader positions the particles on screen
  scene.add(points);

  let sizeScale = 1;
  function resize() {
    const width = Math.max(canvas.clientWidth, 1);
    const height = Math.max(canvas.clientHeight, 1);
    const phone = width < 700;
    sizeScale = phone ? 0.5 : 1;
    uniforms.uAspect.value = width / height;
    geometry.setDrawRange(0, phone ? PHONE_COUNT : DESKTOP_COUNT);
    renderer.setSize(width, height, false);
  }

  function movePointer(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    uniforms.uPointer.value.set(
      (event.clientX / canvas.clientWidth) * 2 - 1,
      1 - (event.clientY / canvas.clientHeight) * 2,
    );
  }

  function clearPointer() {
    uniforms.uPointer.value.set(9, 9);
  }

  let frame = 0;
  let lastTime = performance.now();
  let lastScroll = window.scrollY;
  let scrollDrift = 0;
  let speed = initialMode.speed;
  let cleared = false;
  let clipTop = -1;

  function animate(now: number) {
    frame = requestAnimationFrame(animate);
    if (now - lastTime < FRAME_INTERVAL) return;

    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const scroll = window.scrollY;
    const scrollChange = MathUtils.clamp((scroll - lastScroll) * 0.002, -0.2, 0.2);
    lastScroll = scroll;

    // When the landing and Tracks share the viewport, draw only below their boundary.
    const height = canvas.clientHeight;
    const startTop = MathUtils.clamp(Math.ceil(startSection.getBoundingClientRect().top), 0, height);
    if (startTop !== clipTop) {
      canvas.style.clipPath = startTop ? `inset(${startTop}px 0 0)` : "";
      clipTop = startTop;
    }

    if (startTop === height || document.hidden || window.CASTLE?.visible || document.documentElement.classList.contains("is-slaying")) {
      if (!cleared) renderer.clear();
      cleared = true;
      return;
    }

    const mode = currentMode();
    const blend = 1 - Math.exp(-3 * delta);
    const level = window.SFX?.level() ?? 0;
    scrollDrift = MathUtils.lerp(scrollDrift, scrollChange, blend);
    speed = MathUtils.lerp(speed, mode.speed, blend);
    uniforms.uTime.value += delta * (1 + level * 2.5);
    // Accumulate travel so changing the fall direction never resets a particle.
    uniforms.uTravel.value += delta * (speed - scrollDrift);
    uniforms.uSize.value = MathUtils.lerp(uniforms.uSize.value, mode.size * sizeScale, blend);
    uniforms.uPetal.value = MathUtils.lerp(uniforms.uPetal.value, mode.petal, blend);
    uniforms.uAlpha.value = MathUtils.lerp(uniforms.uAlpha.value, mode.alpha, blend);
    uniforms.uPulse.value = MathUtils.lerp(uniforms.uPulse.value, level * 1.6, blend);
    uniforms.uColorA.value.lerp(mode.a, blend);
    uniforms.uColorB.value.lerp(mode.b, blend);
    cleared = false;
    renderer.render(scene, camera);
  }

  resize();
  uniforms.uSize.value *= sizeScale;
  const sizes = new ResizeObserver(resize);
  sizes.observe(canvas);
  window.addEventListener("pointermove", movePointer, { passive: true });
  document.documentElement.addEventListener("pointerleave", clearPointer);
  frame = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(frame);
    sizes.disconnect();
    window.removeEventListener("pointermove", movePointer);
    document.documentElement.removeEventListener("pointerleave", clearPointer);
    canvas.style.removeProperty("clip-path");
    geometry.dispose();
    material.dispose();
    texture.dispose();
    renderer.dispose();
  };
}
