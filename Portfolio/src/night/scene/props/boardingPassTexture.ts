import { CanvasTexture, SRGBColorSpace } from "three";
import { PALETTE } from "../../palette";
import { experience, person } from "../../../content/site";

export const PASS_W = 1024;
export const PASS_H = 440;
const INK = "#2A2622";
const MUTED = "#6F655A";
const DISPLAY = '"Fraunces Variable", Georgia, serif';
const MONO = '"DM Mono", ui-monospace, Menlo, monospace';

/**
 * The boarding pass on the window sill (the model plane's "look closer" step): Mizzou → Garmin 2027,
 * plus the internship line. Facts from `content/site.ts`. Drawn once with fallback fonts, then again
 * when the web fonts are ready.
 */
export function boardingPassTexture() {
  const c = document.createElement("canvas");
  c.width = PASS_W;
  c.height = PASS_H;
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  draw(c);
  if (typeof document !== "undefined" && document.fonts) {
    Promise.all([document.fonts.load(`600 80px ${DISPLAY}`), document.fonts.load(`400 24px ${MONO}`)])
      .then(() => {
        draw(c);
        tex.needsUpdate = true;
      })
      .catch(() => {});
  }
  return tex;
}

function draw(c: HTMLCanvasElement) {
  const ctx = c.getContext("2d")!;
  const W = PASS_W;
  const H = PASS_H;
  const STUB = 780; // perforation x

  // paper + accent band
  ctx.fillStyle = "#F4EEE3";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#EBE2D3";
  ctx.fillRect(STUB, 0, W - STUB, H);
  ctx.fillStyle = PALETTE.accent;
  ctx.fillRect(0, 0, W, 64);

  // perforation
  ctx.fillStyle = "rgba(42,38,34,0.35)";
  for (let y = 80; y < H - 8; y += 18) ctx.fillRect(STUB - 1, y, 3, 9);

  // header band
  ctx.fillStyle = "#FFF6EA";
  ctx.font = `400 26px ${MONO}`;
  ctx.textBaseline = "middle";
  ctx.fillText("BOARDING PASS", 40, 33);
  ctx.textAlign = "right";
  ctx.fillText(`NEXT STOP · ${person.next.when}`, W - 36, 33);
  ctx.textAlign = "left";

  // route
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = INK;
  ctx.font = `600 84px ${DISPLAY}`;
  const from = "Mizzou";
  ctx.fillText(from, 40, 178);
  const fw = ctx.measureText(from).width;
  drawPlane(ctx, 40 + fw + 50, 150, 30);
  ctx.fillText(person.next.org, 40 + fw + 100, 178);

  // role
  ctx.fillStyle = MUTED;
  ctx.font = `400 22px ${MONO}`;
  ctx.fillText("ROLE", 40, 236);
  ctx.fillStyle = INK;
  ctx.font = `600 34px ${DISPLAY}`;
  ctx.fillText(person.next.role, 40, 278);

  // previously (the internship)
  const intern = experience.find((e) => e.id === "garmin");
  if (intern) {
    ctx.fillStyle = "rgba(42,38,34,0.25)";
    ctx.fillRect(40, 314, STUB - 80, 2);
    ctx.fillStyle = MUTED;
    ctx.font = `400 22px ${MONO}`;
    ctx.fillText("PREVIOUSLY", 40, 352);
    ctx.fillStyle = INK;
    ctx.font = `400 24px ${MONO}`;
    const team = intern.team?.match(/\(([^)]+)\)/)?.[1] ?? "";
    ctx.fillText(`${intern.org.split(" ")[0]} ${team} intern · ${intern.period}`.toUpperCase(), 40, 392);
    if (/return offer/i.test(intern.summary)) {
      ctx.fillStyle = PALETTE.accentDeep;
      ctx.fillText("RETURN OFFER ✓", 40, 424);
    }
  }

  // stub: year + barcode
  const sx = STUB + (W - STUB) / 2;
  ctx.textAlign = "center";
  ctx.fillStyle = MUTED;
  ctx.font = `400 22px ${MONO}`;
  ctx.fillText("FULL TIME", sx, 118);
  ctx.fillStyle = PALETTE.accentDeep;
  ctx.font = `600 76px ${DISPLAY}`;
  ctx.fillText(person.next.when, sx, 200);
  ctx.textAlign = "left";
  let seed = 2027;
  let x = STUB + 34;
  ctx.fillStyle = INK;
  while (x < W - 34) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const w = 2 + (seed % 4) * 2;
    ctx.fillRect(x, 268, w, 120);
    x += w + 4 + ((seed >> 8) % 3) * 2;
  }
}

/** Small plane glyph pointing right, centred at (x, y). */
function drawPlane(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = PALETTE.accent;
  ctx.beginPath();
  ctx.moveTo(s, 0);
  ctx.lineTo(s * 0.55, -s * 0.12);
  ctx.lineTo(-s * 0.05, -s * 0.95);
  ctx.lineTo(-s * 0.3, -s * 0.95);
  ctx.lineTo(0, -s * 0.12);
  ctx.lineTo(-s * 0.6, -s * 0.12);
  ctx.lineTo(-s * 0.8, -s * 0.42);
  ctx.lineTo(-s, -s * 0.42);
  ctx.lineTo(-s * 0.85, 0);
  ctx.lineTo(-s, s * 0.42);
  ctx.lineTo(-s * 0.8, s * 0.42);
  ctx.lineTo(-s * 0.6, s * 0.12);
  ctx.lineTo(0, s * 0.12);
  ctx.lineTo(-s * 0.3, s * 0.95);
  ctx.lineTo(-s * 0.05, s * 0.95);
  ctx.lineTo(s * 0.55, s * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
