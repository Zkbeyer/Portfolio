import type { StickerId } from "../../../content/site";

/**
 * Sticker art for the telescope tube + the About panel collage. Every design is an original drawing —
 * no official logos, characters or wordmarks; the real names live in the interests list next to them.
 * Painters draw the face only, centred on the origin inside a ±150 box. `renderSticker` turns a face
 * into a real-looking sticker: die-cut white border that follows the silhouette, gloss sheen, optional
 * holo foil and a soft drop shadow — cached per id + resolution.
 */
export type StickerKey = StickerId | "hello";

const DISPLAY = '"Fraunces Variable", Georgia, serif';
const SANS = '"DM Sans Variable", system-ui, sans-serif';
const MONO = '"DM Mono", ui-monospace, Menlo, monospace';
const HAND = '"Caveat", "Segoe Print", cursive';

const INK = "#1C1A18";
const CREAM = "#FBF5E9";
const RED = "#E0412B";
const ORANGE = "#F2762E";
const MUSTARD = "#F2B632";
const TEAL = "#1E8C93";
const PURPLE = "#5B2A86";
const PINK = "#E7559B";
const BLUE = "#1D5BD8";

type Ctx = CanvasRenderingContext2D;
type TextOpts = {
  size: number;
  font?: string;
  weight?: number | string;
  fill?: string;
  stroke?: string;
  lw?: number;
  italic?: boolean;
  align?: CanvasTextAlign;
  maxW?: number;
};

// ---------- helpers ----------
function rr(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | number[],
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
function circle(ctx: Ctx, x: number, y: number, r: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
function starPath(
  ctx: Ctx,
  n: number,
  r1: number,
  r2: number,
  rot = -Math.PI / 2,
) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1;
    const a = rot + (i * Math.PI) / n;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
}
function font(o: TextOpts) {
  return `${o.italic ? "italic " : ""}${o.weight ?? 900} ${o.size}px ${o.font ?? SANS}`;
}
function text(ctx: Ctx, s: string, x: number, y: number, o: TextOpts) {
  ctx.save();
  ctx.font = font(o);
  ctx.textAlign = o.align ?? "center";
  ctx.textBaseline = "middle";
  if (o.maxW) {
    const w = ctx.measureText(s).width;
    if (w > o.maxW) {
      ctx.translate(x, y);
      ctx.scale(o.maxW / w, 1);
      x = 0;
      y = 0;
    }
  }
  if (o.stroke) {
    ctx.lineJoin = "round";
    ctx.strokeStyle = o.stroke;
    ctx.lineWidth = o.lw ?? 6;
    ctx.strokeText(s, x, y);
  }
  ctx.fillStyle = o.fill ?? INK;
  ctx.fillText(s, x, y);
  ctx.restore();
}
/** Text around a circle: centred at the top (top = true) or the bottom, reading left to right. */
function arcText(
  ctx: Ctx,
  s: string,
  r: number,
  o: TextOpts & { top?: boolean; spread?: number },
) {
  ctx.save();
  ctx.font = font(o);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = o.fill ?? INK;
  const top = o.top ?? true;
  const chars = [...s];
  const widths = chars.map(
    (c) => ctx.measureText(c).width * (o.spread ?? 1.08),
  );
  const total = widths.reduce((a, b) => a + b, 0);
  let a = (top ? -Math.PI / 2 : Math.PI / 2) + ((top ? -1 : 1) * total) / r / 2;
  chars.forEach((c, i) => {
    const step = widths[i] / r;
    a += ((top ? 1 : -1) * step) / 2;
    ctx.save();
    ctx.translate(Math.cos(a) * r, Math.sin(a) * r);
    ctx.rotate(a + (top ? Math.PI / 2 : -Math.PI / 2));
    ctx.fillText(c, 0, 0);
    ctx.restore();
    a += ((top ? 1 : -1) * step) / 2;
  });
  ctx.restore();
}
function hazard(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  a = MUSTARD,
  b = INK,
  step = 18,
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = a;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = b;
  for (let i = -h; i < w + h; i += step * 2) {
    ctx.beginPath();
    ctx.moveTo(x + i, y + h);
    ctx.lineTo(x + i + step, y + h);
    ctx.lineTo(x + i + step + h, y);
    ctx.lineTo(x + i + h, y);
    ctx.fill();
  }
  ctx.restore();
}
function ribbon(
  ctx: Ctx,
  y: number,
  w: number,
  h: number,
  fill: string,
  label: string,
  color = INK,
  size = 22,
) {
  ctx.fillStyle = fill;
  const n = 14;
  ctx.beginPath();
  ctx.moveTo(-w / 2 - n, y - h / 2);
  ctx.lineTo(w / 2 + n, y - h / 2);
  ctx.lineTo(w / 2, y);
  ctx.lineTo(w / 2 + n, y + h / 2);
  ctx.lineTo(-w / 2 - n, y + h / 2);
  ctx.lineTo(-w / 2, y);
  ctx.closePath();
  ctx.fill();
  text(ctx, label, 0, y + 1, { size, fill: color, maxW: w - 8 });
}
function linear(
  ctx: Ctx,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: string[],
) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  return g;
}

// ---------- painters ----------
function hello(ctx: Ctx) {
  rr(ctx, -130, -85, 260, 170, 18);
  ctx.fillStyle = CREAM;
  ctx.fill();
  ctx.save();
  rr(ctx, -130, -85, 260, 170, 18);
  ctx.clip();
  ctx.fillStyle = RED;
  ctx.fillRect(-130, -85, 260, 66);
  ctx.fillRect(-130, 70, 260, 15);
  ctx.restore();
  text(ctx, "HELLO", 0, -60, { size: 38, fill: CREAM });
  text(ctx, "my name is", 0, -31, { size: 16, weight: 600, fill: CREAM });
  text(ctx, "Zack", 0, 22, { size: 84, font: HAND, weight: 700, fill: INK });
}

function gc(ctx: Ctx) {
  const hex = (r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + (i * Math.PI) / 3;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 1.02);
    }
    ctx.closePath();
  };
  hex(122);
  ctx.fillStyle = linear(ctx, -100, -120, 100, 120, ["#2A1153", PURPLE, PINK]);
  ctx.fill();
  hex(104);
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 4;
  ctx.stroke();
  // crown
  ctx.fillStyle = linear(ctx, 0, -92, 0, -42, ["#FFE48A", MUSTARD, "#C98714"]);
  ctx.beginPath();
  ctx.moveTo(-46, -40);
  ctx.lineTo(-52, -88);
  ctx.lineTo(-24, -62);
  ctx.lineTo(0, -98);
  ctx.lineTo(24, -62);
  ctx.lineTo(52, -88);
  ctx.lineTo(46, -40);
  ctx.closePath();
  ctx.fill();
  for (const x of [-52, 0, 52])
    circle(ctx, x, x === 0 ? -100 : -90, 7, "#FFE48A");
  circle(ctx, 0, -55, 6, PINK);
  text(ctx, "GC", 0, 8, {
    size: 86,
    font: DISPLAY,
    fill: CREAM,
    stroke: "#1A0B33",
    lw: 10,
  });
  ribbon(ctx, 74, 168, 34, MUSTARD, "GRAND CHAMP", INK, 22);
}

function grounded(ctx: Ctx) {
  circle(ctx, 0, 0, 132, "#1F4D22");
  const g = ctx.createRadialGradient(0, -20, 10, 0, 0, 100);
  g.addColorStop(0, "#D8F08A");
  g.addColorStop(1, "#7DBE4B");
  circle(ctx, 0, 0, 100, g as unknown as string);
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, 100, 0, Math.PI * 2);
  ctx.clip();
  // giant grass blades
  const blades: [number, number, number, string][] = [
    [-80, 150, -30, "#2E7A2E"],
    [-40, 175, 18, "#3F8A3A"],
    [55, 160, 34, "#2E7A2E"],
    [85, 120, -14, "#4FA046"],
    [10, 110, -40, "#58AE4C"],
  ];
  for (const [x, h, lean, c] of blades) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x - 16, 110);
    ctx.quadraticCurveTo(x - 4, 110 - h / 2, x + lean, 110 - h);
    ctx.quadraticCurveTo(x + 8, 110 - h / 2, x + 16, 110);
    ctx.fill();
  }
  // ant
  ctx.save();
  ctx.translate(-4, 22);
  ctx.rotate(-0.12);
  ctx.strokeStyle = "#5A1E12";
  ctx.lineCap = "round";
  ctx.lineWidth = 5;
  for (const dx of [-14, 0, 14])
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(dx, 0);
      ctx.lineTo(dx + s * 10, -12 * s + 14);
      ctx.lineTo(dx + s * 22, 22);
      ctx.stroke();
    }
  for (const [x, rx, ry] of [
    [-38, 17, 14],
    [-6, 15, 11],
    [36, 27, 19],
  ] as const) {
    ctx.fillStyle = "#8E2F1C";
    ctx.beginPath();
    ctx.ellipse(x, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.ellipse(
      x - rx * 0.3,
      -ry * 0.4,
      rx * 0.35,
      ry * 0.25,
      -0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  circle(ctx, -44, -4, 4.5, CREAM);
  circle(ctx, -44, -4, 2.2, INK);
  ctx.beginPath();
  ctx.moveTo(-46, -12);
  ctx.quadraticCurveTo(-56, -38, -72, -40);
  ctx.moveTo(-38, -13);
  ctx.quadraticCurveTo(-42, -40, -54, -50);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
  arcText(ctx, "BACKYARD", 116, { size: 24, fill: "#D8F08A", top: true });
  arcText(ctx, "SURVIVOR", 116, { size: 24, fill: "#D8F08A", top: false });
}

function minecraft(ctx: Ctx) {
  rr(ctx, -120, -120, 240, 240, 14);
  ctx.fillStyle = "#3B3A3F";
  ctx.fill();
  // pixel stone noise
  const P = 20;
  for (let i = -6; i < 6; i++)
    for (let j = -6; j < 6; j++) {
      const n = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1;
      if (n > 0.55) {
        ctx.fillStyle = n > 0.8 ? "#4C4B52" : "#2F2E33";
        ctx.fillRect(i * P, j * P, P, P);
      }
    }
  // pixel pickaxe (16x16 grid, 8px cells)
  const C = 9;
  const head = [
    "....XXXXX.......",
    "..XXCCCCCXX.....",
    ".XCCWWCCCCCX....",
    "XCCW.....XCCX...",
    "XC........XCX...",
    "...........XCX..",
    "............XX..",
  ];
  const colors: Record<string, string> = {
    X: "#0E3B3A",
    C: "#3FE0D0",
    W: "#C9FFF8",
  };
  ctx.save();
  ctx.translate(-72, -96);
  head.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (colors[ch]) {
        ctx.fillStyle = colors[ch];
        ctx.fillRect(x * C, y * C, C, C);
      }
    }),
  );
  // handle: diagonal
  for (let k = 0; k < 11; k++) {
    ctx.fillStyle = "#3A2414";
    ctx.fillRect((5 + k) * C - C, (3 + k) * C + C, C * 2, C * 2);
    ctx.fillStyle = k % 2 ? "#8A5A2E" : "#A8733E";
    ctx.fillRect((5 + k) * C - C / 2, (3 + k) * C + C * 1.5, C, C);
  }
  ctx.restore();
  text(ctx, "KEEP", -6, 52, {
    size: 36,
    font: MONO,
    weight: 500,
    fill: CREAM,
    stroke: INK,
    lw: 8,
    align: "center",
  });
  text(ctx, "DIGGING", 0, 88, {
    size: 36,
    font: MONO,
    weight: 500,
    fill: "#3FE0D0",
    stroke: INK,
    lw: 8,
  });
}

function subnautica(ctx: Ctx) {
  const g = ctx.createLinearGradient(0, -130, 0, 130);
  g.addColorStop(0, "#41D1D6");
  g.addColorStop(0.45, "#0F5E8C");
  g.addColorStop(1, "#06142E");
  circle(ctx, 0, 0, 128, g as unknown as string);
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, 128, 0, Math.PI * 2);
  ctx.clip();
  // light rays
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (const x of [-70, -20, 40]) {
    ctx.beginPath();
    ctx.moveTo(x, -130);
    ctx.lineTo(x + 26, -130);
    ctx.lineTo(x + 70, 130);
    ctx.lineTo(x + 20, 130);
    ctx.fill();
  }
  // bubbles
  ctx.strokeStyle = "rgba(220,255,255,0.8)";
  ctx.lineWidth = 2.5;
  for (const [x, y, r] of [
    [70, -60, 8],
    [84, -88, 5],
    [62, -104, 4],
    [-80, 10, 6],
    [-92, -14, 4],
  ]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // glowing jellyfish
  ctx.save();
  ctx.translate(-6, -18);
  ctx.shadowColor = "#7CFFF2";
  ctx.shadowBlur = 28;
  ctx.fillStyle = "rgba(160,255,240,0.92)";
  ctx.beginPath();
  ctx.moveTo(-46, 6);
  ctx.bezierCurveTo(-46, -58, 46, -58, 46, 6);
  ctx.quadraticCurveTo(34, 0, 23, 8);
  ctx.quadraticCurveTo(12, 0, 0, 8);
  ctx.quadraticCurveTo(-12, 0, -23, 8);
  ctx.quadraticCurveTo(-34, 0, -46, 6);
  ctx.fill();
  ctx.shadowBlur = 14;
  ctx.strokeStyle = "rgba(160,255,240,0.85)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  for (const x of [-30, -12, 8, 28]) {
    ctx.beginPath();
    ctx.moveTo(x, 8);
    ctx.bezierCurveTo(x - 12, 30, x + 12, 46, x - 4, 70);
    ctx.stroke();
  }
  ctx.restore();
  circle(ctx, -18, -24, 5, "#06142E");
  circle(ctx, 12, -24, 5, "#06142E");
  ctx.restore();
  text(ctx, "DIVE", 0, 74, { size: 30, fill: CREAM, stroke: "#06142E", lw: 6 });
  text(ctx, "DEEPER", 0, 102, {
    size: 30,
    fill: "#7CFFF2",
    stroke: "#06142E",
    lw: 6,
  });
}

function arc(ctx: Ctx) {
  // ticket with side notches
  ctx.beginPath();
  ctx.moveTo(-135, -82);
  ctx.lineTo(135, -82);
  ctx.lineTo(135, -18);
  ctx.arc(135, 0, 18, -Math.PI / 2, Math.PI / 2, true);
  ctx.lineTo(135, 82);
  ctx.lineTo(-135, 82);
  ctx.lineTo(-135, 18);
  ctx.arc(-135, 0, 18, Math.PI / 2, -Math.PI / 2, true);
  ctx.closePath();
  ctx.fillStyle = ORANGE;
  ctx.fill();
  ctx.save();
  ctx.clip();
  hazard(ctx, -140, -82, 280, 18);
  hazard(ctx, -140, 64, 280, 18);
  ctx.restore();
  // drone
  ctx.save();
  ctx.translate(-72, -6);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-34, -24);
  ctx.lineTo(34, 24);
  ctx.moveTo(34, -24);
  ctx.lineTo(-34, 24);
  ctx.stroke();
  for (const [x, y] of [
    [-34, -24],
    [34, -24],
    [-34, 24],
    [34, 24],
  ]) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(x, y, 20, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  circle(ctx, 0, 0, 16, INK);
  circle(ctx, 0, 0, 7, "#FF3B2F");
  circle(ctx, -2, -2, 2.5, CREAM);
  ctx.restore();
  text(ctx, "LOOT.", 52, -36, { size: 32, fill: INK, align: "center" });
  text(ctx, "EXTRACT.", 52, 0, { size: 32, fill: CREAM, stroke: INK, lw: 6 });
  text(ctx, "REPEAT.", 52, 36, { size: 32, fill: INK });
}

function siege(ctx: Ctx) {
  starPath(ctx, 14, 136, 104, 0.1);
  ctx.fillStyle = MUSTARD;
  ctx.fill();
  starPath(ctx, 14, 114, 88, 0.33);
  ctx.fillStyle = ORANGE;
  ctx.fill();
  // door being breached
  ctx.save();
  ctx.rotate(-0.08);
  rr(ctx, -54, -86, 108, 120, 8);
  ctx.fillStyle = "#5B3A22";
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.strokeStyle = "#3D2615";
  ctx.lineWidth = 4;
  for (const x of [-26, 0, 26]) {
    ctx.beginPath();
    ctx.moveTo(x, -78);
    ctx.lineTo(x, 26);
    ctx.stroke();
  }
  // charge with blinking light + cracks
  hazard(ctx, -40, -30, 80, 26, MUSTARD, INK, 10);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(-40, -30, 80, 26);
  circle(ctx, 30, -40, 6, "#FF2A1A");
  ctx.restore();
  rr(ctx, -112, 34, 224, 64, 10);
  ctx.fillStyle = INK;
  ctx.fill();
  text(ctx, "BREACH", 0, 58, {
    size: 40,
    italic: true,
    fill: CREAM,
    maxW: 200,
  });
  text(ctx, "& CLEAR", 0, 86, {
    size: 18,
    font: MONO,
    weight: 500,
    fill: MUSTARD,
  });
}

function apex(ctx: Ctx) {
  // pennant/shield
  ctx.beginPath();
  ctx.moveTo(-110, -125);
  ctx.lineTo(110, -125);
  ctx.lineTo(110, 50);
  ctx.lineTo(0, 132);
  ctx.lineTo(-110, 50);
  ctx.closePath();
  ctx.fillStyle = linear(ctx, 0, -125, 0, 130, ["#F24A3A", "#B3121F"]);
  ctx.fill();
  ctx.save();
  ctx.clip();
  // speed lines
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 4;
  for (let i = -5; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 26 - 30, -130);
    ctx.lineTo(i * 26 + 10, 0);
    ctx.stroke();
  }
  // falling drop pod + flame
  ctx.save();
  ctx.translate(30, -50);
  ctx.rotate(0.35);
  ctx.fillStyle = MUSTARD;
  ctx.beginPath();
  ctx.moveTo(-14, -70);
  ctx.quadraticCurveTo(0, -20, 14, -70);
  ctx.lineTo(10, -20);
  ctx.lineTo(-10, -20);
  ctx.fill();
  ctx.fillStyle = "#FFE48A";
  ctx.beginPath();
  ctx.moveTo(-8, -60);
  ctx.quadraticCurveTo(0, -30, 8, -60);
  ctx.lineTo(5, -22);
  ctx.lineTo(-5, -22);
  ctx.fill();
  ctx.fillStyle = "#2A2D33";
  ctx.beginPath();
  ctx.moveTo(-18, -22);
  ctx.lineTo(18, -22);
  ctx.lineTo(12, 30);
  ctx.quadraticCurveTo(0, 42, -12, 30);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#7CE0FF";
  rr(ctx, -6, -12, 12, 18, 5);
  ctx.fill();
  ctx.restore();
  ctx.restore();
  text(ctx, "DROP", 0, 36, {
    size: 54,
    italic: true,
    fill: CREAM,
    stroke: "#5C0810",
    lw: 8,
  });
  text(ctx, "HOT", 0, 82, {
    size: 54,
    italic: true,
    fill: MUSTARD,
    stroke: "#5C0810",
    lw: 8,
  });
}

function keeper(ctx: Ctx) {
  circle(ctx, 0, 0, 128, INK);
  circle(ctx, 0, 0, 98, MUSTARD);
  // glove
  ctx.save();
  ctx.translate(0, 4);
  ctx.rotate(-0.15);
  ctx.fillStyle = CREAM;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  const fingers: [number, number][] = [
    [-30, 58],
    [-10, 68],
    [10, 66],
    [30, 54],
  ];
  for (const [x, h] of fingers) {
    rr(ctx, x - 10, -h + 2, 20, h, 10);
    ctx.fill();
    ctx.stroke();
  }
  rr(ctx, -42, -14, 84, 64, 20);
  ctx.fill();
  ctx.stroke();
  ctx.save();
  ctx.translate(-44, 12);
  ctx.rotate(-0.8);
  rr(ctx, -11, -36, 22, 46, 11);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = TEAL;
  rr(ctx, -40, 44, 80, 22, 6);
  ctx.fill();
  ctx.stroke();
  // grip lines
  ctx.strokeStyle = "rgba(28,26,24,0.35)";
  ctx.lineWidth = 3;
  for (const y of [-2, 12, 26]) {
    ctx.beginPath();
    ctx.moveTo(-30, y);
    ctx.lineTo(30, y);
    ctx.stroke();
  }
  ctx.restore();
  arcText(ctx, "SAFE HANDS", 113, { size: 22, fill: MUSTARD, top: true });
  arcText(ctx, "NO. 1 · KEEPER", 113, {
    size: 16,
    font: MONO,
    weight: 500,
    fill: CREAM,
    top: false,
  });
}

function volleyball(ctx: Ctx) {
  rr(ctx, -135, -95, 270, 190, 22);
  ctx.fillStyle = TEAL;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // net
  ctx.fillStyle = CREAM;
  ctx.fillRect(-140, -2, 280, 8);
  ctx.strokeStyle = "rgba(251,245,233,0.55)";
  ctx.lineWidth = 2;
  for (let x = -140; x < 140; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 6);
    ctx.lineTo(x, 60);
    ctx.stroke();
  }
  for (let y = 22; y < 60; y += 16) {
    ctx.beginPath();
    ctx.moveTo(-140, y);
    ctx.lineTo(140, y);
    ctx.stroke();
  }
  ctx.fillStyle = INK;
  ctx.fillRect(-140, 54, 280, 6);
  ctx.restore();
  // two blocking hands over the net
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.translate(s * 30 - 40, -26);
    ctx.rotate(s * 0.12);
    ctx.fillStyle = "#F1C9A0";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    rr(ctx, -16, -40, 32, 58, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(-10, 14, 20, 20);
    ctx.strokeRect(-10, 14, 20, 20);
    ctx.restore();
  }
  // ball bouncing back
  ctx.save();
  ctx.translate(-40, -78);
  circle(ctx, 0, 0, 20, CREAM);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.moveTo(-20, 0);
  ctx.quadraticCurveTo(0, -12, 20, 0);
  ctx.moveTo(0, -20);
  ctx.quadraticCurveTo(-10, 0, 4, 20);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = MUSTARD;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  for (const a of [-2.6, -2.2, -1.9]) {
    ctx.beginPath();
    ctx.moveTo(-40 + Math.cos(a) * 28, -78 + Math.sin(a) * 28);
    ctx.lineTo(-40 + Math.cos(a) * 40, -78 + Math.sin(a) * 40);
    ctx.stroke();
  }
  text(ctx, "MIDDLE", 66, -56, { size: 34, fill: CREAM, stroke: INK, lw: 7 });
  text(ctx, "BLOCKER", 66, -22, {
    size: 30,
    fill: MUSTARD,
    stroke: INK,
    lw: 7,
  });
  text(ctx, "STUFFED.", 0, 80, {
    size: 22,
    font: MONO,
    weight: 500,
    fill: CREAM,
  });
}

function pickleball(ctx: Ctx) {
  circle(ctx, 0, 0, 128, "#D9EE5B");
  circle(ctx, 0, 0, 128 - 24, "#F4FBC8");
  ctx.save();
  ctx.translate(-14, 4);
  ctx.rotate(-0.6);
  rr(ctx, -40, -66, 80, 92, 34);
  ctx.fillStyle = TEAL;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.stroke();
  rr(ctx, -11, 24, 22, 46, 6);
  ctx.fillStyle = INK;
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(46, 22);
  circle(ctx, 0, 0, 24, "#F6E73A");
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.stroke();
  for (const [x, y] of [
    [-9, -9],
    [9, -8],
    [0, 4],
    [-12, 9],
    [12, 10],
    [0, -16],
  ])
    circle(ctx, x, y, 3.5, "#B9A90F");
  ctx.restore();
  arcText(ctx, "DINK", 115, { size: 24, fill: INK, top: true, spread: 1.4 });
  arcText(ctx, "RESPONSIBLY", 115, { size: 20, fill: INK, top: false });
}

function gym(ctx: Ctx) {
  rr(ctx, -135, -70, 270, 140, 70);
  ctx.fillStyle = INK;
  ctx.fill();
  // dumbbell
  ctx.fillStyle = "#9AA0A6";
  ctx.fillRect(-100, -6, 200, 12);
  for (const s of [-1, 1]) {
    ctx.fillStyle = RED;
    rr(ctx, s * 88 - 10, -38, 20, 76, 5);
    ctx.fill();
    ctx.fillStyle = "#B8291A";
    rr(ctx, s * 106 - 8, -28, 16, 56, 4);
    ctx.fill();
  }
  text(ctx, "PR DAY", 0, 2, {
    size: 52,
    italic: true,
    font: DISPLAY,
    fill: CREAM,
    stroke: INK,
    lw: 10,
  });
}

function bluelock(ctx: Ctx) {
  // the silhouette is the padlock
  ctx.lineWidth = 26;
  ctx.strokeStyle = "#0B2C7A";
  ctx.beginPath();
  ctx.arc(0, -40, 58, Math.PI, 0);
  ctx.lineTo(58, 0);
  ctx.moveTo(-58, -40);
  ctx.lineTo(-58, 0);
  ctx.stroke();
  rr(ctx, -100, -10, 200, 140, 22);
  ctx.fillStyle = linear(ctx, -100, -10, 100, 130, [
    "#3B8CFF",
    BLUE,
    "#0B2C7A",
  ]);
  ctx.fill();
  // lightning
  ctx.fillStyle = MUSTARD;
  ctx.beginPath();
  ctx.moveTo(52, 0);
  ctx.lineTo(20, 56);
  ctx.lineTo(42, 56);
  ctx.lineTo(24, 112);
  ctx.lineTo(76, 44);
  ctx.lineTo(52, 44);
  ctx.lineTo(70, 0);
  ctx.closePath();
  ctx.fill();
  text(ctx, "EGO", -22, 62, {
    size: 66,
    font: DISPLAY,
    fill: CREAM,
    stroke: "#06184A",
    lw: 8,
  });
}

function catan(ctx: Ctx) {
  const hex = (x: number, y: number, r: number, c: string) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + (i * Math.PI) / 3;
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
    ctx.strokeStyle = "#F3E3B5";
    ctx.lineWidth = 6;
    ctx.stroke();
  };
  const r = 52;
  const dx = r * Math.sqrt(3);
  hex(-dx / 2, -36, r, "#2F6B35"); // forest
  hex(dx / 2, -36, r, "#C2552F"); // brick
  hex(0, -36 + r * 1.5, r, "#E7B53C"); // wheat
  // tiny trees, bricks, wheat
  for (const [x, y] of [
    [-dx / 2 - 14, -40],
    [-dx / 2 + 12, -30],
  ]) {
    ctx.fillStyle = "#173E1C";
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x + 12, y + 6);
    ctx.lineTo(x - 12, y + 6);
    ctx.fill();
  }
  ctx.fillStyle = "#8E3418";
  for (let i = 0; i < 3; i++)
    ctx.fillRect(dx / 2 - 22 + (i % 2) * 8, -46 + i * 10, 28, 8);
  ctx.strokeStyle = "#8C5E10";
  ctx.lineWidth = 3;
  for (const x of [-10, 0, 10]) {
    ctx.beginPath();
    ctx.moveTo(x, 58);
    ctx.lineTo(x * 1.4, 30);
    ctx.stroke();
  }
  // number tokens
  for (const [x, y, n] of [
    [-dx / 2 + 22, -6, "6"],
    [dx / 2 + 22, -6, "8"],
  ] as const) {
    circle(ctx, x, y, 15, "#F3E3B5");
    text(ctx, n, x, y + 1, { size: 20, font: DISPLAY, fill: "#B3121F" });
  }
  ribbon(ctx, 104, 190, 34, CREAM, "WOOD FOR SHEEP?", INK, 21);
}

function bohnanza(ctx: Ctx) {
  // bean buddy
  ctx.beginPath();
  ctx.moveTo(-92, -10);
  ctx.bezierCurveTo(-110, -100, 40, -110, 90, -60);
  ctx.bezierCurveTo(130, -20, 110, 70, 30, 70);
  ctx.bezierCurveTo(-10, 70, -10, 30, -40, 40);
  ctx.bezierCurveTo(-80, 54, -84, 30, -92, -10);
  ctx.closePath();
  ctx.fillStyle = linear(ctx, -90, -90, 100, 70, ["#F07A8A", "#C8384E"]);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.ellipse(-40, -60, 30, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // face
  for (const x of [-4, 44]) {
    circle(ctx, x, -24, 11, INK);
    circle(ctx, x + 3, -28, 4, CREAM);
  }
  circle(ctx, -26, -2, 9, "rgba(255,170,190,0.9)");
  circle(ctx, 70, -2, 9, "rgba(255,170,190,0.9)");
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(20, -8, 14, 0.2, Math.PI - 0.2);
  ctx.stroke();
  // banner
  rr(ctx, -128, 64, 256, 66, 12);
  ctx.fillStyle = INK;
  ctx.fill();
  text(ctx, "BEAN THERE,", 0, 84, { size: 24, fill: CREAM, maxW: 236 });
  text(ctx, "TRADED THAT", 0, 112, { size: 24, fill: "#F07A8A", maxW: 236 });
}

function hike(ctx: Ctx) {
  // classic trail-patch pentagon
  ctx.beginPath();
  ctx.moveTo(0, -132);
  ctx.lineTo(120, -50);
  ctx.lineTo(100, 110);
  ctx.lineTo(-100, 110);
  ctx.lineTo(-120, -50);
  ctx.closePath();
  ctx.fillStyle = "#1F4A3A";
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = linear(ctx, 0, -130, 0, 40, ["#F6B26B", "#F7D9A6"]);
  ctx.fillRect(-130, -130, 260, 170);
  circle(ctx, 40, -50, 24, "#FFF1D0");
  // mountains
  ctx.fillStyle = "#4C6E8C";
  ctx.beginPath();
  ctx.moveTo(-130, 40);
  ctx.lineTo(-50, -60);
  ctx.lineTo(10, 10);
  ctx.lineTo(60, -30);
  ctx.lineTo(130, 40);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.moveTo(-50, -60);
  ctx.lineTo(-30, -36);
  ctx.lineTo(-42, -40);
  ctx.lineTo(-54, -30);
  ctx.lineTo(-68, -38);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2E5A3C";
  ctx.fillRect(-130, 30, 260, 90);
  // trail
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = MUSTARD;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-20, 110);
  ctx.bezierCurveTo(40, 80, -40, 60, 10, 30);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  ctx.lineWidth = 6;
  ctx.strokeStyle = MUSTARD;
  ctx.beginPath();
  ctx.moveTo(0, -132);
  ctx.lineTo(120, -50);
  ctx.lineTo(100, 110);
  ctx.lineTo(-100, 110);
  ctx.lineTo(-120, -50);
  ctx.closePath();
  ctx.stroke();
  text(ctx, "HIKE MORE", 0, 78, {
    size: 34,
    fill: CREAM,
    stroke: "#1F4A3A",
    lw: 6,
  });
}

function travel(ctx: Ctx) {
  circle(ctx, 0, 0, 128, "#F6EEDC");
  ctx.strokeStyle = "#2F57B5";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 112, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 76, 0, Math.PI * 2);
  ctx.stroke();
  arcText(ctx, "PASSPORT READY", 94, { size: 22, fill: "#2F57B5", top: true });
  arcText(ctx, "★ ANYWHERE ★", 94, { size: 18, fill: "#2F57B5", top: false });
  // plane
  ctx.save();
  ctx.rotate(-0.5);
  ctx.fillStyle = "#2F57B5";
  ctx.beginPath();
  ctx.ellipse(0, 0, 50, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-6, -4);
  ctx.lineTo(-24, -46);
  ctx.lineTo(-10, -46);
  ctx.lineTo(18, -4);
  ctx.moveTo(-6, 4);
  ctx.lineTo(-24, 46);
  ctx.lineTo(-10, 46);
  ctx.lineTo(18, 4);
  ctx.moveTo(-40, -2);
  ctx.lineTo(-52, -20);
  ctx.lineTo(-44, -20);
  ctx.lineTo(-30, -2);
  ctx.moveTo(-40, 2);
  ctx.lineTo(-52, 20);
  ctx.lineTo(-44, 20);
  ctx.lineTo(-30, 2);
  ctx.fill();
  ctx.restore();
  // rubber-stamp roughness: knock a few specks out
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 70; i++) {
    const a = (i * 2.399) % (Math.PI * 2);
    const r = 20 + ((i * 37) % 100);
    circle(ctx, Math.cos(a) * r, Math.sin(a) * r, 1 + (i % 3), "#000");
  }
  ctx.restore();
}

function camp(ctx: Ctx) {
  rr(ctx, -130, -100, 260, 200, 26);
  ctx.fillStyle = linear(ctx, 0, -100, 0, 100, ["#0E1B3D", "#27407A"]);
  ctx.fill();
  ctx.save();
  ctx.clip();
  for (let i = 0; i < 26; i++)
    circle(
      ctx,
      ((i * 97) % 250) - 125,
      ((i * 53) % 110) - 96,
      i % 4 === 0 ? 2.6 : 1.4,
      CREAM,
    );
  circle(ctx, 86, -62, 18, "#FFF1D0");
  circle(ctx, 94, -68, 16, "#14244E");
  ctx.fillStyle = "#1B2F28";
  ctx.beginPath();
  ctx.moveTo(-140, 60);
  ctx.lineTo(-100, 0);
  ctx.lineTo(-70, 40);
  ctx.lineTo(-30, -10);
  ctx.lineTo(20, 50);
  ctx.lineTo(140, 50);
  ctx.lineTo(140, 110);
  ctx.lineTo(-140, 110);
  ctx.fill();
  // tent
  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.moveTo(-10, 64);
  ctx.lineTo(44, -14);
  ctx.lineTo(98, 64);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3B1A0C";
  ctx.beginPath();
  ctx.moveTo(30, 64);
  ctx.lineTo(44, 16);
  ctx.lineTo(58, 64);
  ctx.fill();
  // fire glow
  const g = ctx.createRadialGradient(-50, 60, 2, -50, 60, 50);
  g.addColorStop(0, "rgba(255,190,90,0.9)");
  g.addColorStop(1, "rgba(255,120,40,0)");
  ctx.fillStyle = g;
  ctx.fillRect(-110, 0, 120, 110);
  ctx.fillStyle = MUSTARD;
  ctx.beginPath();
  ctx.moveTo(-62, 66);
  ctx.quadraticCurveTo(-60, 36, -50, 30);
  ctx.quadraticCurveTo(-44, 46, -38, 66);
  ctx.fill();
  ctx.restore();
  text(ctx, "CAMP SOON", 0, -66, {
    size: 34,
    fill: CREAM,
    stroke: "#0E1B3D",
    lw: 6,
    align: "center",
    maxW: 150,
  });
  text(ctx, "( next on the list )", -24, 84, {
    size: 22,
    font: HAND,
    weight: 700,
    fill: "#FFE2A8",
  });
}

function homelab(ctx: Ctx) {
  rr(ctx, -135, -95, 270, 190, 18);
  ctx.fillStyle = "#15171B";
  ctx.fill();
  // little house with a server inside
  ctx.save();
  ctx.translate(0, -40);
  ctx.strokeStyle = "#5CF08A";
  ctx.lineWidth = 5;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-40, -4);
  ctx.lineTo(0, -38);
  ctx.lineTo(40, -4);
  ctx.moveTo(-30, -12);
  ctx.lineTo(-30, 34);
  ctx.lineTo(30, 34);
  ctx.lineTo(30, -12);
  ctx.stroke();
  for (const y of [-2, 10, 22]) {
    ctx.fillStyle = "#2A2E35";
    ctx.fillRect(-20, y - 4, 40, 9);
    circle(ctx, 14, y, 2.4, y === 10 ? MUSTARD : "#5CF08A");
  }
  ctx.restore();
  text(ctx, "THERE'S NO PLACE LIKE", 0, 22, {
    size: 17,
    font: MONO,
    weight: 500,
    fill: "#A8B0BA",
  });
  text(ctx, "127.0.0.1", 0, 62, {
    size: 46,
    font: MONO,
    weight: 500,
    fill: "#5CF08A",
    maxW: 240,
  });
}

function llm(ctx: Ctx) {
  rr(ctx, -135, -90, 270, 180, 22);
  ctx.fillStyle = "#EDE7F7";
  ctx.fill();
  // robot
  ctx.save();
  ctx.translate(-66, 10);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -52);
  ctx.lineTo(0, -70);
  ctx.stroke();
  circle(ctx, 0, -74, 8, RED);
  rr(ctx, -46, -52, 92, 80, 20);
  ctx.fillStyle = "#9AA4B2";
  ctx.fill();
  ctx.stroke();
  rr(ctx, -34, -40, 68, 44, 10);
  ctx.fillStyle = "#1D2230";
  ctx.fill();
  // nervous eyes
  text(ctx, "> <", 0, -20, {
    size: 24,
    font: MONO,
    weight: 500,
    fill: "#7CFFF2",
  });
  ctx.fillStyle = INK;
  ctx.fillRect(-14, 12, 28, 5);
  ctx.restore();
  // speech bubble
  rr(ctx, -6, -74, 132, 64, 16);
  ctx.fillStyle = CREAM;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(4, -20);
  ctx.lineTo(-18, -4);
  ctx.lineTo(22, -12);
  ctx.fillStyle = CREAM;
  ctx.fill();
  text(ctx, "LGTM?", 60, -42, { size: 30, font: MONO, weight: 500, fill: INK });
  // stamp
  ctx.save();
  ctx.translate(60, 38);
  ctx.rotate(-0.16);
  ctx.strokeStyle = RED;
  ctx.lineWidth = 5;
  rr(ctx, -64, -26, 128, 52, 8);
  ctx.stroke();
  text(ctx, "NOT YET", 0, 2, { size: 30, fill: RED });
  ctx.restore();
  text(ctx, "— reviewed by a human", 0, 76, {
    size: 20,
    font: HAND,
    weight: 700,
    fill: PURPLE,
  });
}

function distributed(ctx: Ctx) {
  circle(ctx, 0, 0, 130, PURPLE);
  circle(ctx, 0, 0, 104, "#F1E9FB");
  const nodes: [number, number][] = [
    [0, -50],
    [-52, 10],
    [52, 10],
    [0, 52],
  ];
  ctx.strokeStyle = PURPLE;
  ctx.lineWidth = 5;
  for (const [a, b] of [
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 3],
  ]) {
    ctx.beginPath();
    ctx.moveTo(...nodes[a]);
    ctx.lineTo(...nodes[b]);
    ctx.stroke();
  }
  ctx.setLineDash([7, 7]);
  ctx.beginPath();
  ctx.moveTo(...nodes[2]);
  ctx.lineTo(...nodes[3]);
  ctx.stroke();
  ctx.setLineDash([]);
  nodes.forEach(([x, y], i) => {
    circle(ctx, x, y, 18, i === 3 ? MUSTARD : PINK);
    ctx.lineWidth = 4;
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.stroke();
    text(ctx, i === 3 ? "v1" : "v2", x, y + 1, {
      size: 14,
      font: MONO,
      weight: 500,
      fill: INK,
    });
  });
  text(ctx, "...eventually", 66, 74, {
    size: 22,
    font: HAND,
    weight: 700,
    fill: PURPLE,
  });
  arcText(ctx, "EVENTUALLY", 117, { size: 20, fill: CREAM, top: true });
  arcText(ctx, "CONSISTENT", 117, { size: 20, fill: CREAM, top: false });
}

function rice(ctx: Ctx) {
  rr(ctx, -135, -95, 270, 190, 16);
  ctx.fillStyle = linear(ctx, -135, -95, 135, 95, ["#2B1B3F", "#1A2B45"]);
  ctx.fill();
  const pane = (x: number, y: number, w: number, h: number, bar: string) => {
    rr(ctx, x, y, w, h, 8);
    ctx.fillStyle = "#11141A";
    ctx.fill();
    ctx.strokeStyle = bar;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = bar;
    rr(ctx, x, y, w, 12, [8, 8, 0, 0]);
    ctx.fill();
  };
  pane(-122, -84, 130, 132, PINK);
  pane(16, -84, 106, 60, TEAL);
  pane(16, -16, 106, 64, MUSTARD);
  text(ctx, "~ $ rice", -112, -56, {
    size: 17,
    font: MONO,
    weight: 500,
    fill: "#5CF08A",
    align: "left",
  });
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = ["#7C8AA5", "#C792EA", "#7CFFF2", "#7C8AA5"][i];
    ctx.fillRect(-112, -38 + i * 16, 40 + ((i * 37) % 60), 7);
  }
  // bottom bar
  ctx.fillStyle = "#0B0D12";
  rr(ctx, -122, 56, 244, 28, 8);
  ctx.fill();
  text(ctx, "RICE > STOCK", 0, 71, {
    size: 20,
    font: MONO,
    weight: 500,
    fill: CREAM,
  });
}

function optimize(ctx: Ctx) {
  circle(ctx, 0, 0, 128, INK);
  // gauge arc: green → mustard → red
  const seg = [
    ["#5CF08A", Math.PI * 0.85, Math.PI * 1.35],
    [MUSTARD, Math.PI * 1.35, Math.PI * 1.75],
    [RED, Math.PI * 1.75, Math.PI * 2.15],
  ] as const;
  ctx.lineWidth = 22;
  for (const [c, a0, a1] of seg) {
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.arc(0, 10, 88, a0, a1);
    ctx.stroke();
  }
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 3;
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * 0.85 + (i / 10) * Math.PI * 1.3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 66, 10 + Math.sin(a) * 66);
    ctx.lineTo(Math.cos(a) * 74, 10 + Math.sin(a) * 74);
    ctx.stroke();
  }
  const na = Math.PI * 2.05;
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(Math.cos(na) * 70, 10 + Math.sin(na) * 70);
  ctx.stroke();
  circle(ctx, 0, 10, 12, CREAM);
  text(ctx, "MAKE IT", 0, 62, {
    size: 22,
    font: MONO,
    weight: 500,
    fill: CREAM,
  });
  text(ctx, "FASTER", 0, 92, { size: 36, italic: true, fill: RED });
}

const PAINTERS: Record<StickerKey, (ctx: Ctx) => void> = {
  hello,
  gc,
  grounded,
  minecraft,
  subnautica,
  arc,
  siege,
  apex,
  keeper,
  volleyball,
  pickleball,
  gym,
  bluelock,
  catan,
  bohnanza,
  hike,
  travel,
  camp,
  homelab,
  llm,
  distributed,
  rice,
  optimize,
};

/** Foil stickers get a rainbow sheen on top of the gloss. */
const HOLO = new Set<StickerKey>(["gc", "bluelock", "apex", "subnautica"]);

/**
 * Optional: swap any design for your own artwork — put a transparent PNG/SVG in `public/` and map its id
 * here, e.g. `gc: "stickers/gc.png"`. It gets the same die-cut border, gloss and shadow. Empty by default.
 */
export const CUSTOM_ART: Partial<Record<StickerKey, string>> = {};

// ---------- compositing ----------
export const ART = 300; // art space (±150)
const BORDER = 11;
const PAD = BORDER + 14; // border + room for the shadow
export const STICKER_SIZE = ART + PAD * 2;

const cache = new Map<string, HTMLCanvasElement>();
const images = new Map<string, HTMLImageElement>();
let onArtLoaded: (() => void) | null = null;
/** Called when custom art finishes loading so the collages can redraw. */
export function setStickerArtListener(fn: (() => void) | null) {
  onArtLoaded = fn;
}

function canvas(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = Math.ceil(size);
  return c;
}

function paintFace(ctx: Ctx, id: StickerKey) {
  const url = CUSTOM_ART[id];
  if (url) {
    let img = images.get(url);
    if (!img) {
      img = new Image();
      img.onload = () => {
        cache.clear();
        onArtLoaded?.();
      };
      img.src = `${import.meta.env.BASE_URL}${url}`;
      images.set(url, img);
    }
    if (img.complete && img.naturalWidth) {
      const k = Math.min(270 / img.naturalWidth, 270 / img.naturalHeight);
      ctx.drawImage(
        img,
        (-img.naturalWidth * k) / 2,
        (-img.naturalHeight * k) / 2,
        img.naturalWidth * k,
        img.naturalHeight * k,
      );
      return;
    }
  }
  PAINTERS[id](ctx);
}

/** A finished sticker (STICKER_SIZE × res px, centred), cached. */
export function renderSticker(id: StickerKey, res = 1): HTMLCanvasElement {
  const key = `${id}@${res}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const S = STICKER_SIZE * res;

  // 1. face
  const face = canvas(S);
  const f = face.getContext("2d")!;
  f.translate(S / 2, S / 2);
  f.scale(res, res);
  paintFace(f, id);
  // gloss + optional holo, only where the face is
  f.globalCompositeOperation = "source-atop";
  if (HOLO.has(id)) {
    f.globalAlpha = 0.28;
    f.fillStyle = linear(f, -150, -150, 150, 150, [
      "#FF6AD5",
      "#C774E8",
      "#AD8CFF",
      "#8795E8",
      "#94D0FF",
      "#7CFFCB",
      "#FFF59D",
      "#FF6AD5",
    ]);
    f.fillRect(-150, -150, 300, 300);
  }
  f.globalAlpha = 1;
  f.fillStyle = linear(f, -150, -150, 150, 150, [
    "rgba(255,255,255,0)",
    "rgba(255,255,255,0)",
    "rgba(255,255,255,0.28)",
    "rgba(255,255,255,0.05)",
    "rgba(255,255,255,0)",
    "rgba(255,255,255,0)",
  ]);
  f.fillRect(-150, -150, 300, 300);

  // 2. white silhouette
  const sil = canvas(S);
  const s = sil.getContext("2d")!;
  s.drawImage(face, 0, 0);
  s.globalCompositeOperation = "source-in";
  s.fillStyle = "#FFFFFF";
  s.fillRect(0, 0, S, S);

  // 3. dilate the silhouette into the die-cut border
  const border = canvas(S);
  const b = border.getContext("2d")!;
  for (const r of [BORDER, BORDER * 0.55]) {
    const n = r === BORDER ? 24 : 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      b.drawImage(sil, Math.cos(a) * r * res, Math.sin(a) * r * res);
    }
  }
  b.drawImage(sil, 0, 0);
  // vinyl-white with a faint warm edge
  b.globalCompositeOperation = "source-in";
  b.fillStyle = "#FFFDF7";
  b.fillRect(0, 0, S, S);

  // 4. composite: shadow under the border, then the face
  const out = canvas(S);
  const o = out.getContext("2d")!;
  o.save();
  o.shadowColor = "rgba(0,0,0,0.45)";
  o.shadowBlur = 7 * res;
  o.shadowOffsetY = 4 * res;
  o.shadowOffsetX = 1 * res;
  o.drawImage(border, 0, 0);
  o.restore();
  o.drawImage(face, 0, 0);
  cache.set(key, out);
  return out;
}

/** Fonts used on the stickers; canvas text falls back until they're loaded. */
export function whenStickerFontsReady(draw: () => void) {
  if (!document.fonts) return;
  Promise.all([
    document.fonts.load(`700 60px ${HAND}`),
    document.fonts.load(`900 30px ${SANS}`),
    document.fonts.load(`italic 900 30px ${SANS}`),
    document.fonts.load(`900 40px ${DISPLAY}`),
    document.fonts.load(`500 30px ${MONO}`),
  ])
    .then(() => {
      cache.clear();
      draw();
    })
    .catch(() => {});
}
