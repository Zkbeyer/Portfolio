import { CanvasTexture, SRGBColorSpace } from "three";
import { PALETTE } from "../../palette";

/** Abstract mid-century print: sun, arches and a hill line on cream paper. */
export function mcmPrintTexture() {
  const W = 360;
  const H = 450;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#EFE6D6";
  ctx.fillRect(0, 0, W, H);
  // sun
  ctx.fillStyle = PALETTE.mustard;
  ctx.beginPath();
  ctx.arc(W * 0.66, H * 0.3, 62, 0, Math.PI * 2);
  ctx.fill();
  // nested arches
  const arch = (cx: number, base: number, r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - r, base);
    ctx.arc(cx, base, r, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
  };
  arch(W * 0.36, H * 0.82, 120, PALETTE.terracotta);
  arch(W * 0.36, H * 0.82, 84, "#EFE6D6");
  arch(W * 0.36, H * 0.82, 48, PALETTE.teal);
  // olive hill
  ctx.fillStyle = PALETTE.olive;
  ctx.beginPath();
  ctx.moveTo(0, H * 0.82);
  ctx.quadraticCurveTo(W * 0.7, H * 0.6, W, H * 0.78);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();
  // ground band
  ctx.fillStyle = PALETTE.charcoal;
  ctx.fillRect(0, H * 0.94, W, H * 0.06);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
