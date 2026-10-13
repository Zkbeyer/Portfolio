import { CanvasTexture, SRGBColorSpace } from "three";
import { PALETTE } from "../../palette";
import { person } from "../../../content/site";

/**
 * Sticker wrap for the telescope tube (its "look closer" step): a HELLO-my-name-is tag plus one die-cut
 * sticker per interest in `content/site.ts`. The canvas wraps around the tube — x = around the
 * circumference, printed twice (see BANDS), y = along the tube (top = objective end) —
 * so each sticker is drawn turned 90° to read along the tube. Transparent everywhere else.
 */
export const STICKER_CANVAS = { w: 768, h: 1536 } as const;

const HAND = '"Caveat", "Segoe Print", cursive';
const SANS = '"DM Sans Variable", system-ui, sans-serif';
const MONO = '"DM Mono", ui-monospace, Menlo, monospace';
const INK = "#2A2622";
const WHITE = "#FBF7EF";

type Ctx = CanvasRenderingContext2D;

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Die-cut look: white border + soft shadow, then the face. */
function dieCut(ctx: Ctx, w: number, h: number, r: number, face: string) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = WHITE;
  roundRect(ctx, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, r + 10);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = face;
  roundRect(ctx, -w / 2, -h / 2, w, h, r);
  ctx.fill();
}

function nameTag(ctx: Ctx) {
  const w = 300;
  const h = 200;
  dieCut(ctx, w, h, 18, WHITE);
  ctx.save();
  roundRect(ctx, -w / 2, -h / 2, w, h, 18);
  ctx.clip();
  ctx.fillStyle = PALETTE.accent;
  ctx.fillRect(-w / 2, -h / 2, w, 78);
  ctx.fillRect(-w / 2, h / 2 - 16, w, 16);
  ctx.restore();
  ctx.fillStyle = WHITE;
  ctx.textAlign = "center";
  ctx.font = `800 40px ${SANS}`;
  ctx.fillText("HELLO", 0, -h / 2 + 44);
  ctx.font = `500 20px ${SANS}`;
  ctx.fillText("my name is", 0, -h / 2 + 68);
  ctx.fillStyle = INK;
  ctx.font = `600 78px ${HAND}`;
  ctx.fillText(person.shortName.split(" ")[0], 0, h / 2 - 34);
}

// Simple glyphs (no logos) for each interest.
const GLYPHS: Record<string, (ctx: Ctx) => void> = {
  gym: (ctx) => {
    ctx.fillRect(-46, -5, 92, 10);
    for (const s of [-1, 1]) {
      ctx.fillRect(s * 40 - 7, -24, 14, 48);
      ctx.fillRect(s * 54 - 6, -16, 12, 32);
    }
  },
  gaming: (ctx) => {
    roundRect(ctx, -52, -26, 104, 52, 26);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillRect(-36, -4, 24, 8);
    ctx.fillRect(-28, -12, 8, 24);
    for (const [x, y] of [
      [26, -8],
      [38, 4],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },
  outdoors: (ctx) => {
    ctx.beginPath();
    ctx.moveTo(-56, 26);
    ctx.lineTo(-14, -28);
    ctx.lineTo(8, 0);
    ctx.lineTo(22, -16);
    ctx.lineTo(56, 26);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(34, -28, 9, 0, Math.PI * 2);
    ctx.fill();
  },
  technology: (ctx) => {
    ctx.font = `500 52px ${MONO}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("</>", 0, 2);
  },
};

const STYLES: Record<string, { face: string; ink: string; shape: "round" | "pill" | "tag" }> = {
  gym: { face: PALETTE.mustard, ink: INK, shape: "round" },
  gaming: { face: "#2F5D62", ink: WHITE, shape: "pill" }, // deep teal
  outdoors: { face: PALETTE.olive, ink: WHITE, shape: "tag" },
  technology: { face: "#1E1D22", ink: PALETTE.led, shape: "pill" },
};

function interestSticker(ctx: Ctx, name: string) {
  const st = STYLES[name] ?? { face: PALETTE.cream, ink: INK, shape: "pill" as const };
  if (st.shape === "round") {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(0, 0, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = st.face;
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.fill();
  } else {
    dieCut(ctx, 250, 150, st.shape === "pill" ? 75 : 16, st.face);
  }
  ctx.fillStyle = st.ink;
  ctx.save();
  ctx.translate(0, -18);
  (GLYPHS[name] ?? (() => {}))(ctx);
  ctx.restore();
  ctx.fillStyle = st.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `800 30px ${SANS}`;
  ctx.fillText(name === "technology" ? "TECH" : name.toUpperCase(), 0, 54);
}

/** Positions along the tube (y), a little scatter around the up-facing band (x), and tilt. */
const LAYOUT = [
  { y: 0.12, x: 0.0, r: -0.05 },
  { y: 0.31, x: -0.03, r: 0.1 },
  { y: 0.5, x: 0.03, r: -0.08 },
  { y: 0.69, x: -0.02, r: 0.07 },
  { y: 0.87, x: 0.02, r: -0.1 },
];
/** The band is printed on two opposite sides of the tube so one always faces the room. */
const BANDS = [0.37, 0.87];

export function stickerTexture() {
  const { w, h } = STICKER_CANVAS;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  const draw = () => {
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    const items: ((ctx: Ctx) => void)[] = [nameTag, ...person.interests.map((n) => (ctx: Ctx) => interestSticker(ctx, n))];
    for (const band of BANDS) items.forEach((paint, i) => {
      const at = LAYOUT[i % LAYOUT.length];
      ctx.save();
      ctx.translate((band + at.x) * w, at.y * h);
      ctx.rotate(Math.PI / 2 + at.r); // read along the tube, from the objective end down
      ctx.scale(0.92, 0.92);
      paint(ctx);
      ctx.restore();
    });
    tex.needsUpdate = true;
  };
  draw();
  document.fonts
    ?.load(`600 60px ${HAND}`)
    .then(() => Promise.all([document.fonts.load(`800 30px ${SANS}`), document.fonts.load(`500 40px ${MONO}`)]))
    .then(draw)
    .catch(() => {});
  return tex;
}
