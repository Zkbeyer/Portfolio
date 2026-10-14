import { CanvasTexture, SRGBColorSpace } from "three";
import { interests } from "../../../content/site";
import {
  renderSticker,
  setStickerArtListener,
  STICKER_SIZE,
  whenStickerFontsReady,
  type StickerKey,
} from "./stickerArt";

/**
 * Sticker-bombed telescope tube + the same collage in the About panel. Art lives in `stickerArt.ts`.
 *
 * Tube canvas: x = around the circumference, y = along the tube (top = objective end). The side that
 * faces the close-up camera is around x ≈ FRONT; the name tag and the first interests land there, on top.
 * The whole tube is covered (overlapping, jittered, mostly reading along the tube) and wraps seamlessly.
 */
export { whenStickerFontsReady };

export const STICKER_CANVAS = { w: 1024, h: 2048 } as const;
const FRONT = 0.42; // fraction of the circumference that faces the telescope close-up

/** Name tag first, then one sticker per picked interest, in a mixed order so neighbours differ. */
export const STICKER_ORDER: StickerKey[] = (() => {
  const groups = interests.map((g) =>
    g.items.filter((i) => i.sticker).map((i) => i.sticker!),
  );
  const out: StickerKey[] = ["hello"];
  for (let round = 0; groups.some((g) => g.length > round); round++)
    for (const g of groups) if (g[round]) out.push(g[round]);
  return out;
})();

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Placement = {
  id: StickerKey;
  x: number;
  y: number;
  size: number;
  rot: number;
};

function tubeLayout(w: number, h: number): Placement[] {
  const rand = rng(26);
  const lanes = 5;
  const rowStep = 170;
  const slots: { x: number; y: number; d: number }[] = [];
  for (let l = 0; l < lanes; l++) {
    const x = ((FRONT + l / lanes) % 1) * w;
    for (let y = 60 + (l % 2) * (rowStep / 2); y < h * 0.92; y += rowStep) {
      const dx =
        Math.min(Math.abs(x - FRONT * w), w - Math.abs(x - FRONT * w)) / w; // around-the-tube distance
      slots.push({ x, y, d: dx * 4 + Math.abs(y / h - 0.42) });
    }
  }
  slots.sort((a, b) => a.d - b.d); // nearest the front first
  const placed = slots.map((s, i) => ({
    id:
      i === 0
        ? STICKER_ORDER[0]
        : STICKER_ORDER[1 + ((i - 1) % (STICKER_ORDER.length - 1))], // one name tag
    x: s.x + (rand() - 0.5) * 50,
    y: s.y + (rand() - 0.5) * 40,
    size: 285 + rand() * 50,
    rot: Math.PI / 2 + (rand() - 0.5) * 0.7,
  }));
  return placed.reverse(); // paint far ones first so the front stickers sit on top
}

/** Collage for a box (About panel): every sticker once, overlapping, tilted. */
export function panelLayout(w: number, h: number): Placement[] {
  const rand = rng(7);
  const ids = STICKER_ORDER;
  const n = ids.length;
  const inset = Math.min(w, h) * 0.12; // keep the stickers (and their tilt) inside the box
  w -= inset * 2;
  h -= inset * 2;
  const cols = Math.max(3, Math.round(Math.sqrt((n * w) / h)));
  const rows = Math.ceil(n / cols);
  // spread the stickers evenly over the rows (no half-empty last row)
  const perRow = Array.from(
    { length: rows },
    (_, r) => Math.floor(n / rows) + (r < n % rows ? 1 : 0),
  );
  const ch = h / rows;
  const size = Math.min(w / cols, ch) * 1.5;
  const out: Placement[] = [];
  let i = 0;
  perRow.forEach((count, r) => {
    const cw = w / count;
    for (let c = 0; c < count; c++, i++)
      out.push({
        id: ids[i],
        x:
          inset +
          (c + 0.5 + (r % 2 ? 0.12 : -0.12)) * cw +
          (rand() - 0.5) * cw * 0.25,
        y: inset + (r + 0.5) * ch + (rand() - 0.5) * ch * 0.3,
        size: size * (0.88 + rand() * 0.27),
        rot: (rand() - 0.5) * 0.7,
      });
  });
  // shuffle paint order so overlaps feel random, but keep the name tag on top
  for (let i = out.length - 1; i > 1; i--) {
    const j = 1 + Math.floor(rand() * i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return [...out.slice(1), out[0]];
}

export function drawCollage(
  ctx: CanvasRenderingContext2D,
  layout: Placement[],
  res: number,
  wrapW = 0,
) {
  for (const p of layout) {
    const img = renderSticker(p.id, res);
    const xs = wrapW
      ? [p.x - wrapW, p.x, p.x + wrapW].filter(
          (x) => x > -p.size && x < wrapW + p.size,
        )
      : [p.x];
    for (const x of xs) {
      ctx.save();
      ctx.translate(x, p.y);
      ctx.rotate(p.rot);
      ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
  }
}

export function stickerTexture() {
  const { w, h } = STICKER_CANVAS;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  const layout = tubeLayout(w, h);
  const res = 310 / STICKER_SIZE; // stickers are drawn ≈ 310px, so render them at that resolution
  const draw = () => {
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    drawCollage(ctx, layout, Math.max(0.6, res), w);
    tex.needsUpdate = true;
  };
  draw();
  whenStickerFontsReady(draw);
  setStickerArtListener(draw);
  return tex;
}
