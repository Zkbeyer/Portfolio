import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { PALETTE } from "../palette";
import { seeded } from "./props/seeded";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext("2d")! };
}

function finish(c: HTMLCanvasElement, repeat: [number, number] = [1, 1]) {
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 4;
  return t;
}

/** Limewash plaster: soft cloudy variation in the wall colour, no visible pattern. */
export function plasterTexture(seed = 7) {
  const { c, ctx } = canvas(256, 256);
  const rnd = seeded(seed);
  ctx.fillStyle = PALETTE.plaster;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 140; i++) {
    const x = rnd() * 256;
    const y = rnd() * 256;
    const r = 18 + rnd() * 60;
    const light = rnd() > 0.5;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, light ? "rgba(245,236,222,0.10)" : "rgba(120,104,84,0.08)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    // draw wrapped so the texture tiles seamlessly
    for (const dx of [-256, 0, 256]) for (const dy of [-256, 0, 256]) {
      ctx.save();
      ctx.translate(dx, dy);
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.restore();
    }
  }
  return finish(c, [3, 1.5]);
}

/** Wide walnut floor planks with staggered joints and a little grain. */
export function floorTexture(seed = 11) {
  const W = 512;
  const H = 512;
  const { c, ctx } = canvas(W, H);
  const rnd = seeded(seed);
  const rows = 6;
  const rowH = H / rows;
  const tones = ["#4A3223", "#523827", "#45301F", "#573B29"];
  for (let r = 0; r < rows; r++) {
    let x = -rnd() * W * 0.6;
    while (x < W) {
      const len = W * (0.45 + rnd() * 0.5);
      ctx.fillStyle = tones[Math.floor(rnd() * tones.length)];
      ctx.fillRect(x, r * rowH, len, rowH);
      // grain
      ctx.strokeStyle = "rgba(30,18,10,0.18)";
      ctx.lineWidth = 1;
      for (let g = 0; g < 7; g++) {
        const gy = r * rowH + 4 + rnd() * (rowH - 8);
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.bezierCurveTo(x + len * 0.3, gy + (rnd() - 0.5) * 6, x + len * 0.7, gy + (rnd() - 0.5) * 6, x + len, gy);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(18,10,6,0.55)";
      ctx.fillRect(x, r * rowH, 2, rowH); // butt joint
      x += len;
    }
    ctx.fillStyle = "rgba(18,10,6,0.6)";
    ctx.fillRect(0, r * rowH, W, 2); // long seam
  }
  return finish(c, [3, 2]);
}

/** Vintage checker rug: rust and cream squares inside a dark border (Zack's Pinterest board). */
export function rugTexture(seed = 5) {
  const W = 480;
  const H = 320;
  const { c, ctx } = canvas(W, H);
  const rnd = seeded(seed);
  const border = 18;
  ctx.fillStyle = "#3A2A20";
  ctx.fillRect(0, 0, W, H);
  const cols = 9;
  const rows = 6;
  const cw = (W - border * 2) / cols;
  const ch = (H - border * 2) / rows;
  for (let r = 0; r < rows; r++)
    for (let q = 0; q < cols; q++) {
      ctx.fillStyle = (r + q) % 2 === 0 ? "#B5502F" : PALETTE.linen;
      ctx.fillRect(border + q * cw, border + r * ch, cw + 0.5, ch + 0.5);
    }
  // wool flecks + slightly wobbly hand-tufted look
  for (let i = 0; i < 3200; i++) {
    ctx.fillStyle = rnd() > 0.5 ? "rgba(60,40,30,0.12)" : "rgba(255,248,236,0.12)";
    ctx.fillRect(rnd() * W, rnd() * H, 2, 1 + rnd() * 2);
  }
  return finish(c);
}
