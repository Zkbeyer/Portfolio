import { CanvasTexture, SRGBColorSpace } from "three";
import { PALETTE } from "../../palette";
import { person, type StickerId } from "../../../content/site";

/**
 * Sticker wrap for the telescope tube (its "look closer" step): a HELLO-my-name-is tag plus the die-cut
 * stickers picked in `content/site.ts` (`interests[].items[].sticker`). The canvas wraps around the tube —
 * x = around the circumference, y = along the tube (top = objective end) — so each sticker is drawn
 * turned 90° to read along the tube. Two columns × four rows, printed on two opposite sides (BANDS).
 * The same painters draw the sticker sheet in the About panel (`paintSticker`).
 * Glyphs are simple original drawings: no game/show logos, characters or rank art.
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

const BLUE = "#2D4E9E";
const SAGE = "#9DA88C";

function shadowed(ctx: Ctx, fn: () => void) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  fn();
  ctx.restore();
}

function roundSticker(ctx: Ctx, face: string) {
  shadowed(ctx, () => {
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(0, 0, 100, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(0, 0, 90, 0, Math.PI * 2);
  ctx.fill();
}

function label(ctx: Ctx, text: string, y: number, size = 30, color = INK, font = SANS, weight = 800) {
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillText(text, 0, y);
}

function hexPath(ctx: Ctx, w: number, h: number) {
  const k = h / 2;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + k * 0.6, -h / 2);
  ctx.lineTo(w / 2 - k * 0.6, -h / 2);
  ctx.lineTo(w / 2, 0);
  ctx.lineTo(w / 2 - k * 0.6, h / 2);
  ctx.lineTo(-w / 2 + k * 0.6, h / 2);
  ctx.lineTo(-w / 2, 0);
  ctx.closePath();
}

/** Rocket League Grand Champion: a hex badge with a crown and "GC" (no rank art). */
function gc(ctx: Ctx) {
  shadowed(ctx, () => {
    ctx.fillStyle = WHITE;
    hexPath(ctx, 270, 170);
    ctx.fill();
  });
  ctx.fillStyle = "#3A2347"; // deep plum
  hexPath(ctx, 250, 150);
  ctx.fill();
  ctx.strokeStyle = PALETTE.accentSoft;
  ctx.lineWidth = 4;
  hexPath(ctx, 228, 130);
  ctx.stroke();
  // little crown
  ctx.fillStyle = PALETTE.mustard;
  ctx.beginPath();
  ctx.moveTo(-28, -30);
  ctx.lineTo(-28, -52);
  ctx.lineTo(-14, -40);
  ctx.lineTo(0, -58);
  ctx.lineTo(14, -40);
  ctx.lineTo(28, -52);
  ctx.lineTo(28, -30);
  ctx.closePath();
  ctx.fill();
  label(ctx, "GC", 26, 66, WHITE);
  label(ctx, "ROCKET LEAGUE", 52, 17, PALETTE.accentSoft, MONO, 500);
}

/** Grounded: a tiny ant on a blade of grass — shrunk down in the backyard. */
function grounded(ctx: Ctx) {
  dieCut(ctx, 250, 150, 16, PALETTE.olive);
  ctx.save();
  ctx.translate(0, -18);
  // grass blades
  ctx.fillStyle = "#A9B86A";
  for (const [x, hgt, lean] of [[-70, 54, -10], [-52, 40, 6], [62, 50, 12], [78, 34, -4]] as const) {
    ctx.beginPath();
    ctx.moveTo(x - 6, 30);
    ctx.quadraticCurveTo(x, 30 - hgt / 2, x + lean, 30 - hgt);
    ctx.quadraticCurveTo(x + 2, 30 - hgt / 2, x + 6, 30);
    ctx.fill();
  }
  // ant: head, thorax, abdomen, legs, antennae
  ctx.fillStyle = INK;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  for (const [x, rx, ry] of [[-28, 13, 11], [-4, 12, 9], [26, 20, 14]] as const) {
    ctx.beginPath();
    ctx.ellipse(x, 6, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const dx of [-14, -4, 6]) {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(dx, 8);
      ctx.lineTo(dx + s * 8, 22);
      ctx.lineTo(dx + s * 12, 30);
      ctx.stroke();
    }
  }
  ctx.beginPath();
  ctx.moveTo(-34, -2);
  ctx.quadraticCurveTo(-44, -22, -56, -24);
  ctx.moveTo(-28, -4);
  ctx.quadraticCurveTo(-30, -24, -40, -30);
  ctx.stroke();
  ctx.restore();
  label(ctx, "GROUNDED", 54, 30, WHITE);
}

/** Minecraft: a generic pixel grass block, drawn isometric. */
function minecraft(ctx: Ctx) {
  dieCut(ctx, 250, 150, 16, PALETTE.cream);
  const px = 7; // one "pixel"
  const n = 6;
  const ox = 0;
  const oy = -30;
  // iso helpers: grid (i, j) on a face → screen
  const top = (i: number, j: number): [number, number] => [ox + (i - j) * px, oy - 21 + (i + j) * px * 0.5];
  const left = (i: number, k: number): [number, number] => [ox - n * px + i * px, oy - 21 + n * px * 0.5 + i * px * 0.5 + k * px];
  const right = (j: number, k: number): [number, number] => [ox + j * px, oy - 21 + n * px - j * px * 0.5 + k * px];
  const quad = (pts: [number, number][], color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(...pts[0]);
    pts.slice(1).forEach((p) => ctx.lineTo(...p));
    ctx.closePath();
    ctx.fill();
  };
  const noise = (a: number, b: number) => ((a * 73 + b * 151 + 17) % 7) / 7;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const g = noise(i, j) > 0.6 ? "#6FA03F" : noise(i, j) > 0.3 ? "#7DB04A" : "#5E8E35";
      quad([top(i, j), top(i + 1, j), top(i + 1, j + 1), top(i, j + 1)], g);
    }
  for (let i = 0; i < n; i++)
    for (let k = 0; k < n; k++) {
      const grass = k === 0 || (k === 1 && noise(i, k) > 0.5);
      const c = grass ? "#5E8E35" : noise(i, k) > 0.55 ? "#7A5236" : "#8C6440";
      quad([left(i, k), left(i + 1, k), left(i + 1, k + 1), left(i, k + 1)], c);
      const c2 = grass ? "#4E7A2C" : noise(k, i) > 0.55 ? "#5E3F2B" : "#6B4A30";
      quad([right(i, k), right(i + 1, k), right(i + 1, k + 1), right(i, k + 1)], c2);
    }
  label(ctx, "MINECRAFT", 56, 28, INK);
}

/** Soccer goalkeeper: a keeper glove. */
function keeper(ctx: Ctx) {
  roundSticker(ctx, PALETTE.mustard);
  ctx.save();
  ctx.translate(0, -18);
  ctx.fillStyle = INK;
  // fingers
  for (const [x, h] of [[-21, 40], [-7, 46], [7, 44], [21, 36]] as const) {
    roundRect(ctx, x - 6.5, -h + 6, 13, h, 6.5);
    ctx.fill();
  }
  // palm + thumb
  roundRect(ctx, -28, -6, 56, 40, 12);
  ctx.fill();
  ctx.save();
  ctx.translate(-30, 6);
  ctx.rotate(-0.7);
  roundRect(ctx, -7, -22, 14, 30, 7);
  ctx.fill();
  ctx.restore();
  // wrist strap
  ctx.fillStyle = PALETTE.accent;
  ctx.fillRect(-26, 30, 52, 12);
  ctx.restore();
  label(ctx, "KEEPER", 56, 28, INK);
}

/** Volleyball: ball with three curved panels. */
function volleyball(ctx: Ctx) {
  roundSticker(ctx, "#2F5D62");
  ctx.save();
  ctx.translate(0, -16);
  const r = 34;
  ctx.fillStyle = WHITE;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = PALETTE.mustard;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(20, -30, 4, -r - 4);
  ctx.lineTo(r + 4, -r);
  ctx.lineTo(r + 4, 6);
  ctx.quadraticCurveTo(20, 4, 0, 0);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  for (let k = 0; k < 3; k++) {
    const a = (k * Math.PI * 2) / 3 - Math.PI / 2;
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.cos(a + 0.9) * r * 0.7, Math.sin(a + 0.9) * r * 0.7, Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.stroke();
  ctx.restore();
  label(ctx, "VOLLEYBALL", 52, 22, WHITE);
}

/** Pickleball: paddle + holey ball. */
function pickleball(ctx: Ctx) {
  dieCut(ctx, 250, 150, 75, SAGE);
  ctx.save();
  ctx.translate(-14, -18);
  ctx.rotate(-0.5);
  ctx.fillStyle = INK;
  roundRect(ctx, -24, -36, 48, 54, 18);
  ctx.fill();
  roundRect(ctx, -6, 14, 12, 30, 4);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(36, -6);
  ctx.fillStyle = "#E9E36A";
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = SAGE;
  for (const [x, y] of [[-6, -6], [6, -5], [0, 5], [-8, 6], [9, 7]] as const) {
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  label(ctx, "PICKLEBALL", 54, 28, INK);
}

/** Blue Lock: a plain padlock in blue — the title, not the show's art. */
function bluelock(ctx: Ctx) {
  dieCut(ctx, 250, 150, 75, BLUE);
  ctx.save();
  ctx.translate(0, -16);
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, -10, 17, Math.PI, 0);
  ctx.lineTo(17, 2);
  ctx.moveTo(-17, -10);
  ctx.lineTo(-17, 2);
  ctx.stroke();
  ctx.fillStyle = WHITE;
  roundRect(ctx, -28, 0, 56, 38, 7);
  ctx.fill();
  ctx.fillStyle = BLUE;
  ctx.beginPath();
  ctx.arc(0, 15, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-2.5, 17, 5, 12);
  ctx.restore();
  label(ctx, "BLUE LOCK", 54, 30, WHITE);
}

const PAINTERS: Record<StickerId | "hello", (ctx: Ctx) => void> = {
  hello: nameTag,
  gc,
  grounded,
  minecraft,
  keeper,
  volleyball,
  pickleball,
  bluelock,
};

/** Draws one sticker centred on the origin (≈ 250×150, round ones r 100, the name tag 300×200). */
export function paintSticker(ctx: Ctx, id: StickerId | "hello") {
  PAINTERS[id](ctx);
}

/** Tube layout: two columns either side of each band, four rows along the tube (row 1 = objective end). */
const SLOTS: { id: StickerId | "hello"; col: -1 | 1; row: number; r: number }[] = [
  { id: "hello", col: -1, row: 0, r: -0.04 },
  { id: "gc", col: 1, row: 0, r: 0.06 },
  { id: "minecraft", col: -1, row: 1, r: 0.07 },
  { id: "grounded", col: 1, row: 1, r: -0.06 },
  { id: "keeper", col: -1, row: 2, r: -0.08 },
  { id: "bluelock", col: 1, row: 2, r: 0.05 },
  { id: "volleyball", col: -1, row: 3, r: 0.06 },
  { id: "pickleball", col: 1, row: 3, r: -0.07 },
];
const COL_OFFSET = 0.09; // of the circumference (≈ ±36°), so both columns face the viewer
const ROWS = [0.12, 0.35, 0.58, 0.79]; // the last row stays clear of the brass ring near the eyepiece end
/** Printed on two opposite sides of the tube so one set always faces the room. */
const BANDS = [0.42, 0.92]; // nudged so both columns sit on the side that faces the close-up camera

/** Fires `draw` again once the sticker fonts are ready (canvas text uses fallbacks until then). */
export function whenStickerFontsReady(draw: () => void) {
  document.fonts
    ?.load(`600 60px ${HAND}`)
    .then(() => Promise.all([document.fonts.load(`800 30px ${SANS}`), document.fonts.load(`500 40px ${MONO}`)]))
    .then(draw)
    .catch(() => {});
}

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
    for (const band of BANDS)
      for (const s of SLOTS) {
        ctx.save();
        ctx.translate((band + s.col * COL_OFFSET) * w, ROWS[s.row] * h);
        ctx.rotate(Math.PI / 2 + s.r); // read along the tube, from the objective end down
        ctx.scale(0.8, 0.8);
        paintSticker(ctx, s.id);
        ctx.restore();
      }
    tex.needsUpdate = true;
  };
  draw();
  whenStickerFontsReady(draw);
  return tex;
}
