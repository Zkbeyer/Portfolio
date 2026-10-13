import { CanvasTexture, SRGBColorSpace } from "three";
import { PALETTE } from "../../palette";
import { projects } from "../../../content/site";
import { STATUS_LABEL } from "../../ui/projectCursor";

/**
 * Canvas screens for the "look closer" step on the monitors: the project playlist (landscape),
 * the highlighted project's details (portrait) and the homelab terminal (landscape, Pi focus).
 * Facts only from `content/site.ts`. Each texture is redrawn on demand (`draw(...)`), and once more
 * when the web fonts finish loading.
 */
const MONO = '"DM Mono", ui-monospace, Menlo, monospace';
const DISPLAY = '"Fraunces Variable", Georgia, serif';
const SANS = '"DM Sans Variable", system-ui, sans-serif';

const BG = "#16161C";
const INK = "#EDE6DA";
const MUTED = "#8E877C";
const DIM = "#4E4A45";
const ACCENT = PALETTE.accent;
const LAMP = PALETTE.lamp;

export type CanvasScreen<T> = { texture: CanvasTexture; draw: (arg: T) => void; dispose: () => void };

function makeScreen<T>(w: number, h: number, paint: (ctx: CanvasRenderingContext2D, arg: T) => void, initial: T): CanvasScreen<T> {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const texture = new CanvasTexture(c);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  let last = initial;
  const draw = (arg: T) => {
    last = arg;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    paint(ctx, arg);
    texture.needsUpdate = true;
  };
  draw(initial);
  document.fonts
    ?.load(`400 20px ${MONO}`)
    .then(() => Promise.all([document.fonts.load(`600 40px ${DISPLAY}`), document.fonts.load(`500 20px ${SANS}`)]))
    .then(() => draw(last))
    .catch(() => {});
  return { texture, draw, dispose: () => texture.dispose() };
}

/** Clip text to `max` px with an ellipsis. */
function fit(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1);
  return `${t}…`;
}

/** Word-wrap into lines no wider than `max`. */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

// ── landscape: the playlist ─────────────────────────────────────────────────
export const PLAYLIST_SIZE = { w: 1100, h: 650 } as const;
export const PLAYLIST_ROWS = { top: 150, height: 72 } as const;

/** Row index under a screen UV (v = 1 at the top), or null outside the list. */
export function playlistRowAt(u: number, v: number) {
  const y = (1 - v) * PLAYLIST_SIZE.h;
  const i = Math.floor((y - PLAYLIST_ROWS.top) / PLAYLIST_ROWS.height);
  return u > 0.03 && u < 0.97 && i >= 0 && i < projects.length ? i : null;
}

export function playlistScreen(cursor: number) {
  const { w, h } = PLAYLIST_SIZE;
  return makeScreen(w, h, (ctx, sel: number) => {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);
    const M = 46;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = MUTED;
    ctx.font = `400 22px ${MONO}`;
    ctx.fillText("PLAYLIST", M, 64);
    ctx.textAlign = "right";
    ctx.fillText(`${projects.length} TRACKS`, w - M, 64);
    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.font = `600 44px ${DISPLAY}`;
    ctx.fillText("Projects", M, 118);
    ctx.fillStyle = DIM;
    ctx.fillRect(M, 134, w - 2 * M, 2);

    projects.forEach((p, i) => {
      const y = PLAYLIST_ROWS.top + i * PLAYLIST_ROWS.height;
      const on = i === sel;
      if (on) {
        ctx.fillStyle = "rgba(209,73,42,0.22)";
        ctx.fillRect(M - 16, y + 6, w - 2 * M + 32, PLAYLIST_ROWS.height - 10);
        ctx.fillStyle = ACCENT;
        ctx.fillRect(M - 16, y + 6, 6, PLAYLIST_ROWS.height - 10);
      }
      const mid = y + PLAYLIST_ROWS.height / 2 + 9;
      ctx.font = `400 22px ${MONO}`;
      ctx.fillStyle = on ? LAMP : MUTED;
      ctx.fillText(on ? "▶" : String(i + 1).padStart(2, "0"), M + 4, mid);
      ctx.font = `600 30px ${SANS}`;
      ctx.fillStyle = INK;
      ctx.fillText(fit(ctx, p.name, 300), M + 64, mid);
      ctx.font = `400 22px ${SANS}`;
      ctx.fillStyle = on ? INK : MUTED;
      ctx.fillText(fit(ctx, p.tagline, 470), M + 380, mid);
      ctx.font = `400 18px ${MONO}`;
      ctx.fillStyle = p.status === "running" || p.status === "live" ? PALETTE.led : MUTED;
      ctx.textAlign = "right";
      ctx.fillText((STATUS_LABEL[p.status] ?? p.status).toUpperCase(), w - M, mid);
      ctx.textAlign = "left";
    });

    ctx.font = `400 18px ${MONO}`;
    ctx.fillStyle = MUTED;
    ctx.fillText("↑ ↓ CHOOSE  ·  CLICK OR ENTER TO OPEN", M, h - 30);
  }, cursor);
}

// ── portrait: the highlighted project ───────────────────────────────────────
export const DETAIL_SIZE = { w: 560, h: 955 } as const;

export function detailScreen(cursor: number) {
  const { w, h } = DETAIL_SIZE;
  return makeScreen(w, h, (ctx, sel: number) => {
    const p = projects[sel];
    ctx.fillStyle = "#121614";
    ctx.fillRect(0, 0, w, h);
    const M = 38;
    let y = 70;
    ctx.font = `400 20px ${MONO}`;
    ctx.fillStyle = MUTED;
    ctx.fillText(`TRACK ${String(sel + 1).padStart(2, "0")} · ${(STATUS_LABEL[p.status] ?? p.status).toUpperCase()}`, M, y);
    y += 62;
    ctx.fillStyle = INK;
    ctx.font = `600 46px ${DISPLAY}`;
    for (const l of wrap(ctx, p.name, w - 2 * M)) {
      ctx.fillText(l, M, y);
      y += 52;
    }
    ctx.font = `400 24px ${SANS}`;
    ctx.fillStyle = "#C9C1B4";
    for (const l of wrap(ctx, p.tagline, w - 2 * M)) {
      ctx.fillText(l, M, y);
      y += 32;
    }
    if (p.metric) {
      y += 10;
      ctx.fillStyle = LAMP;
      ctx.font = `400 22px ${MONO}`;
      ctx.fillText(p.metric.toUpperCase(), M, y);
      y += 16;
    }
    y += 40;
    ctx.fillStyle = PALETTE.led;
    ctx.font = `400 22px ${MONO}`;
    ctx.fillText("$ cat stack", M, y);
    y += 42;
    ctx.font = `400 24px ${MONO}`;
    for (const s of p.stack) {
      ctx.fillStyle = MUTED;
      ctx.fillText("–", M, y);
      ctx.fillStyle = INK;
      ctx.fillText(fit(ctx, s, w - 2 * M - 34), M + 34, y);
      y += 38;
    }
    if (p.links.length) {
      y += 24;
      ctx.fillStyle = PALETTE.led;
      ctx.font = `400 22px ${MONO}`;
      ctx.fillText("$ ls links", M, y);
      y += 40;
      ctx.fillStyle = LAMP;
      ctx.font = `400 24px ${MONO}`;
      ctx.fillText(p.links.map((l) => l.label).join("   "), M, y);
    }
    ctx.fillStyle = MUTED;
    ctx.font = `400 18px ${MONO}`;
    ctx.fillText("click to open the project", M, h - 34);
  }, cursor);
}

// ── landscape (Pi focus): the homelab terminal ──────────────────────────────
/** Workloads on the cluster, from the homelab description in `content/site.ts`. No fake numbers. */
export const HOMELAB_PODS = [
  { name: "self-heal", note: "Go · checks, backups, recovery" },
  { name: "prometheus", note: "metrics + alerting" },
  { name: "grafana", note: "dashboards" },
  { name: "tailscale", note: "private access" },
  { name: "minecraft", note: "server for friends" },
] as const;

/** `lines` = how many pod rows have "printed" (the Pi LED pulses with each one). */
export function homelabScreen(lines: number) {
  const { w, h } = PLAYLIST_SIZE;
  return makeScreen(w, h, (ctx, shown: number) => {
    ctx.fillStyle = "#101311";
    ctx.fillRect(0, 0, w, h);
    const M = 46;
    let y = 72;
    ctx.font = `400 34px ${MONO}`;
    ctx.fillStyle = PALETTE.led;
    ctx.fillText("$", M, y);
    ctx.fillStyle = INK;
    ctx.fillText("kubectl get pods", M + 40, y);
    y += 58;
    ctx.fillStyle = MUTED;
    ctx.font = `400 24px ${MONO}`;
    ctx.fillText("NAME", M, y);
    ctx.fillText("STATUS", M + 280, y);
    ctx.fillText("WHAT IT DOES", M + 470, y);
    y += 60;
    HOMELAB_PODS.slice(0, shown).forEach((p) => {
      ctx.font = `400 32px ${MONO}`;
      ctx.fillStyle = INK;
      ctx.fillText(p.name, M, y);
      ctx.fillStyle = PALETTE.led;
      ctx.fillText("Running", M + 280, y);
      ctx.fillStyle = "#C9C1B4";
      ctx.font = `400 28px ${SANS}`;
      ctx.fillText(fit(ctx, p.note, w - M - (M + 470)), M + 470, y);
      y += 64;
    });
    if (shown >= HOMELAB_PODS.length) {
      y += 14;
      ctx.font = `400 24px ${MONO}`;
      ctx.fillStyle = MUTED;
      ctx.fillText("# k3s on a Raspberry Pi 5 · TLS + Tailscale + key-only SSH", M, y);
      y += 60;
      ctx.font = `400 32px ${MONO}`;
      ctx.fillStyle = PALETTE.led;
      ctx.fillText("$ █", M, y);
    }
  }, lines);
}
