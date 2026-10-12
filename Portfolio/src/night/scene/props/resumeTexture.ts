import { CanvasTexture, SRGBColorSpace } from "three";
import { PALETTE } from "../../palette";
import { person } from "../../../content/site";
import { seeded } from "./seeded";

const W = 384;
const H = 532;
const INK = "#2A2622";

/**
 * A printed resume page for the notebook: real section headings and Zack's name so it reads as a resume
 * at a glance, with greeked (bar) body text — like the code on the monitors. Page 0 = header,
 * experience, education; page 1 = projects, skills.
 */
export function resumeTexture(page: 0 | 1) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const rnd = seeded(page === 0 ? 101 : 202);

  ctx.fillStyle = "#F4EEE3";
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = `rgba(120,100,80,${rnd() * 0.03})`;
    ctx.fillRect(rnd() * W, rnd() * H, 1.5, 1.5);
  }

  const M = 30; // margin
  let y = M;
  const bar = (x: number, yy: number, w: number, h = 5, color = INK, alpha = 0.9) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x, yy, w, h);
    ctx.globalAlpha = 1;
  };
  const heading = (text: string) => {
    y += 14;
    ctx.fillStyle = PALETTE.accentDeep;
    ctx.font = "700 15px Georgia, 'Times New Roman', serif";
    ctx.fillText(text, M, y);
    bar(M, y + 5, W - M * 2, 1.5, PALETTE.accent, 0.9);
    y += 18;
  };
  const line = (indent: number, w: number) => {
    bar(M + indent, y, w);
    y += 11;
  };
  const entry = (bullets: number) => {
    bar(M, y, 110 + rnd() * 60, 7, INK, 0.92); // org / project name
    bar(W - M - 64, y + 1, 64, 5, INK, 0.7); // dates
    y += 13;
    bar(M, y, 90 + rnd() * 70, 4, INK, 0.65); // role
    y += 12;
    for (let b = 0; b < bullets; b++) {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(M + 5, y + 2.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      const lines = rnd() < 0.45 ? 2 : 1;
      for (let l = 0; l < lines; l++) line(13, (l === lines - 1 ? 150 : 270) + rnd() * 50);
    }
    y += 8;
  };

  if (page === 0) {
    ctx.fillStyle = INK;
    ctx.font = "700 29px Georgia, 'Times New Roman', serif";
    ctx.fillText(person.name, M, y + 22);
    y += 34;
    ctx.font = "italic 12px Georgia, serif";
    ctx.fillStyle = "#5A524A";
    ctx.fillText(person.title.toLowerCase(), M, y + 6);
    // contact line: greeked
    bar(M + 130, y, 70, 4, INK, 0.45);
    bar(M + 210, y, 60, 4, INK, 0.45);
    bar(M + 280, y, 44, 4, INK, 0.45);
    y += 12;
    heading("EXPERIENCE");
    entry(4);
    entry(2);
    heading("EDUCATION");
    entry(1);
  } else {
    heading("PROJECTS");
    for (let i = 0; i < 4; i++) entry(i === 0 ? 2 : 1);
    heading("SKILLS");
    for (let r = 0; r < 4; r++) {
      bar(M, y, 62, 5, INK, 0.85);
      let x = M + 76;
      while (x < W - M - 30) {
        const w = 22 + rnd() * 40;
        bar(x, y, Math.min(w, W - M - x), 4, INK, 0.55);
        x += w + 8;
      }
      y += 14;
    }
  }

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
