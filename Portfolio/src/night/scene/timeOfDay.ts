import { Color } from "three";
import { PALETTE } from "../palette";

/**
 * The window follows the visitor's clock: dawn, a grey rainy day, dusk, deep night (the original
 * Night Shift look). Keyframes by local hour, blended smoothly. `?hour=6.5` in the URL overrides
 * the clock (for testing or sharing a specific look).
 */
type Phase = {
  top: string;
  mid: string;
  low: string;
  stars: number;
  moon: number;
  /** Village lights on the hills. */
  town: number;
  /** Light coming in through the window. */
  light: string;
  lightI: number;
  /** How much the hills fade toward the horizon colour (more haze in daylight). */
  hillHaze: number;
};

const NIGHT: Phase = { top: PALETTE.skyTop, mid: PALETTE.skyMid, low: PALETTE.skyLow, stars: 1, moon: 1, town: 1, light: "#9FB0E0", lightI: 1, hillHaze: 0 };
const DAWN: Phase = { top: "#26315A", mid: "#7C6A93", low: "#F0A27A", stars: 0.25, moon: 0.45, town: 0.55, light: "#E8B49A", lightI: 1.35, hillHaze: 0.3 };
const DAY: Phase = { top: "#66717F", mid: "#8C949E", low: "#B5B0A7", stars: 0, moon: 0, town: 0.1, light: "#C9D2DE", lightI: 2.1, hillHaze: 0.55 };
const DUSK: Phase = { top: "#1E2048", mid: "#743D63", low: "#EE874A", stars: 0.3, moon: 0.35, town: 0.8, light: "#F0A070", lightI: 1.35, hillHaze: 0.28 };

const KEYS: [number, Phase][] = [
  [0, NIGHT],
  [4.75, NIGHT],
  [6.25, DAWN],
  [8, DAY],
  [16.5, DAY],
  [18.75, DUSK],
  [20.75, NIGHT],
  [24, NIGHT],
];

export type SkyState = {
  top: Color;
  mid: Color;
  low: Color;
  stars: number;
  moon: number;
  town: number;
  light: Color;
  lightI: number;
  hillHaze: number;
};

function hourNow(): number {
  try {
    const q = new URLSearchParams(window.location.search).get("hour");
    if (q !== null && Number.isFinite(Number(q))) return ((Number(q) % 24) + 24) % 24;
  } catch {
    /* no URL access */
  }
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
}

const ease = (t: number) => t * t * (3 - 2 * t);
const a = new Color();
const b = new Color();
function mixColor(out: Color, x: string, y: string, t: number) {
  return out.copy(a.set(x)).lerp(b.set(y), t);
}

const state: SkyState = {
  top: new Color(),
  mid: new Color(),
  low: new Color(),
  stars: 1,
  moon: 1,
  town: 1,
  light: new Color(),
  lightI: 1,
  hillHaze: 0,
};
let computedAt = -Infinity;
let version = 0;

function compute(h: number) {
  let i = 0;
  while (i < KEYS.length - 2 && h >= KEYS[i + 1][0]) i++;
  const [h0, p] = KEYS[i];
  const [h1, q] = KEYS[i + 1];
  const t = ease(Math.min(1, Math.max(0, (h - h0) / (h1 - h0))));
  mixColor(state.top, p.top, q.top, t);
  mixColor(state.mid, p.mid, q.mid, t);
  mixColor(state.low, p.low, q.low, t);
  mixColor(state.light, p.light, q.light, t);
  state.stars = p.stars + (q.stars - p.stars) * t;
  state.moon = p.moon + (q.moon - p.moon) * t;
  state.town = p.town + (q.town - p.town) * t;
  state.lightI = p.lightI + (q.lightI - p.lightI) * t;
  state.hillHaze = p.hillHaze + (q.hillHaze - p.hillHaze) * t;
  version++;
}

/** Current sky (recomputed at most every 30s — the clock moves slowly). `version` changes when it does. */
export function skyNow(): { sky: SkyState; version: number } {
  const now = performance.now();
  if (now - computedAt > 30_000) {
    computedAt = now;
    compute(hourNow());
  }
  return { sky: state, version };
}
