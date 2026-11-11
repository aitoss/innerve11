import * as THREE from "three";
import type { NightGateSeed } from "@/types/content";

export type CanvasDrawer = (g: CanvasRenderingContext2D, w: number, h: number) => void;

/** Renders a 2D canvas into a Three.js sRGB CanvasTexture. */
export function canvasTex(
  w: number,
  h: number,
  draw: CanvasDrawer,
  repeat?: [number, number]
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (ctx) draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repeat);
  }
  return t;
}

export const drawShoji: CanvasDrawer = (g, w, h) => {
  const grd = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, h * 0.7);
  grd.addColorStop(0, "#ffe9bd");
  grd.addColorStop(1, "#d48f45");
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "#26110a";
  g.lineWidth = 6;
  for (let i = 1; i < 4; i++) {
    g.beginPath();
    g.moveTo((i * w) / 4, 0);
    g.lineTo((i * w) / 4, h);
    g.stroke();
  }
  for (let j = 1; j < 6; j++) {
    g.beginPath();
    g.moveTo(0, (j * h) / 6);
    g.lineTo(w, (j * h) / 6);
    g.stroke();
  }
  g.lineWidth = 18;
  g.strokeRect(0, 0, w, h);
};

export const drawWood: CanvasDrawer = (g, w, h) => {
  const palette = ["#3a1d10", "#43230f", "#331a0e", "#4a2812"];
  for (let i = 0; i < 8; i++) {
    g.fillStyle = palette[i % 4];
    g.fillRect(0, (i * h) / 8, w, h / 8);
    g.strokeStyle = "rgba(0,0,0,.35)";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, (i * h) / 8);
    g.lineTo(w, (i * h) / 8);
    g.stroke();
    g.strokeStyle = "rgba(255,200,140,.07)";
    for (let k = 0; k < 5; k++) {
      g.beginPath();
      const y = (i * h) / 8 + (Math.random() * h) / 8;
      g.moveTo(0, y);
      g.bezierCurveTo(w * 0.3, y + 3, w * 0.6, y - 3, w, y + 1);
      g.stroke();
    }
  }
};

export const drawTatami: CanvasDrawer = (g, w, h) => {
  g.fillStyle = "#6f7a3c";
  g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(0,0,0,.18)";
  for (let y = 0; y < h; y += 3) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke();
  }
  g.fillStyle = "#1c120c";
  g.fillRect(0, 0, 8, h);
  g.fillRect(w - 8, 0, 8, h);
};

export const plateTex = (txt: string): THREE.CanvasTexture =>
  canvasTex(512, 160, (g, w, h) => {
    g.font = "800 112px 'Shippori Mincho B1', serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.shadowColor = "#ff1a3c";
    g.shadowBlur = 28;
    g.fillStyle = "#ff2a48";
    g.fillText(txt, w / 2, h / 2 + 6);
    g.shadowBlur = 0;
    g.fillStyle = "#ffd0d6";
    g.fillText(txt, w / 2, h / 2 + 6);
  });

export const createAuraTexture = (): THREE.CanvasTexture =>
  canvasTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, "rgba(255,30,60,.9)");
    gr.addColorStop(0.4, "rgba(200,0,40,.35)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  });

export const drawPlaque =
  (n: Pick<NightGateSeed, "k" | "n" | "day" | "yr" | "what" | "at">): CanvasDrawer =>
  (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#1a080c");
    bg.addColorStop(1, "#0d0407");
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#c8102e";
    g.lineWidth = 14;
    g.strokeRect(7, 7, w - 14, h - 14);
    g.strokeStyle = "rgba(214,166,64,.8)";
    g.lineWidth = 3;
    g.strokeRect(26, 26, w - 52, h - 52);
    g.textBaseline = "alphabetic";
    g.textAlign = "left";
    g.fillStyle = "#ff3b57";
    g.font = "800 64px 'Shippori Mincho B1', serif";
    g.fillText(n.k, 62, 112);
    g.fillStyle = "#ffb36b";
    g.font = "600 30px Inter, sans-serif";
    g.fillText(("Night " + n.n).toUpperCase().split("").join(" "), 138, 104);
    g.fillStyle = "#efe8dc";
    g.font = "400 168px Anton, Impact, sans-serif";
    g.fillText(n.day, 58, 288);
    const dw = g.measureText(n.day).width;
    g.fillStyle = "#ff6a80";
    g.font = "400 62px Anton, Impact, sans-serif";
    g.fillText(n.yr, 58 + dw + 22, 288);
    g.fillStyle = "#ff2a48";
    g.font = "400 58px Anton, Impact, sans-serif";
    g.fillText(n.what.toUpperCase(), 62, 372);
    if (n.at) {
      g.fillStyle = "rgba(239,232,220,.8)";
      g.font = "600 28px Inter, sans-serif";
      g.fillText(n.at, 62, 428);
    }
  };

