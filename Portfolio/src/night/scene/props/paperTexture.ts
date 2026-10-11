import { CanvasTexture, SRGBColorSpace } from "three";
import { PALETTE } from "../../palette";
import { seeded } from "./seeded";

/**
 * Ruled notebook paper drawn on a canvas so the page is lit by the scene like everything else.
 * `ink` 0 → blank ruled page; otherwise rows of loose handwriting-like strokes.
 */
export function paperTexture(seed: number, ink: number) {
  const W = 256;
  const H = 352;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const rand = seeded(seed);

  ctx.fillStyle = PALETTE.paper;
  ctx.fillRect(0, 0, W, H);
  // faint paper grain
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(120, 100, 80, ${rand() * 0.05})`;
    ctx.fillRect(rand() * W, rand() * H, 1.5, 1.5);
  }

  const top = 40;
  const gap = 19;
  ctx.strokeStyle = "rgba(110, 140, 200, 0.45)";
  ctx.lineWidth = 1.2;
  for (let y = top; y < H - 12; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(196, 80, 94, 0.55)";
  ctx.beginPath();
  ctx.moveTo(34, 0);
  ctx.lineTo(34, H);
  ctx.stroke();

  if (ink > 0) {
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineCap = "round";
    ctx.lineWidth = 1.8;
    for (let y = top + gap; y < H - 30; y += gap) {
      if (rand() > ink) continue;
      let x = 42 + (rand() < 0.25 ? 14 : 0);
      const end = x + 60 + rand() * 140;
      ctx.beginPath();
      ctx.moveTo(x, y - 4);
      // words: runs of small loops with gaps between them
      while (x < end) {
        const word = 12 + rand() * 30;
        for (let wx = 0; wx < word; wx += 4) {
          const h = 3 + rand() * (rand() < 0.2 ? 8 : 4);
          ctx.quadraticCurveTo(x + wx + 1, y - 2 - h, x + wx + 3, y - 3 + rand() * 1.5);
        }
        x += word + 6 + rand() * 4;
        ctx.moveTo(x, y - 4);
      }
      ctx.stroke();
    }
    // a doodled box + check mark, like a to-do
    ctx.strokeRect(42, H - 46, 9, 9);
    ctx.beginPath();
    ctx.moveTo(43, H - 41);
    ctx.lineTo(46, H - 38);
    ctx.lineTo(53, H - 49);
    ctx.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
