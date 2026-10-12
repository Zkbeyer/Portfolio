// GLSL for the desk props: the monitor's code editor and the mug's steam.
// Procedural like the window shaders — no textures are loaded.
import { HASH_GLSL } from "../window/shaders";

/**
 * A code editor that types itself: gutter with line numbers, indented lines of syntax-coloured
 * "glyph" blocks, the current line typed character by character with a blinking caret, and the
 * buffer scrolling up a line at a time. Text sits just above 1.0 so Bloom gives it a soft glow.
 */
export const CODE_FRAG = /* glsl */ `
uniform float uTime;
uniform float uSpeed; // lines per LINE_SECONDS (the terminal scrolls faster than the editor)
uniform vec2 uGrid; // (columns, rows) of character cells
uniform float uGain; // overall brightness (hover raises it)
uniform vec3 uBg;
uniform vec3 uLineHi;
uniform vec3 uGutter;
uniform vec3 uIdent;
uniform vec3 uKey;
uniform vec3 uStr;
uniform vec3 uNum;
uniform vec3 uComment;
varying vec2 vUv;
${HASH_GLSL}
const float LINE_SECONDS = 1.7;
const float GUTTER = 4.0;

void main() {
  float cols = uGrid.x;
  float rows = uGrid.y;
  float t = uTime * uSpeed / LINE_SECONDS;
  float cur = floor(t);
  float prog = fract(t);

  float rowF = (1.0 - vUv.y) * rows;
  float r = floor(rowF);
  float fy = fract(rowF);
  // the line being typed sits two rows from the bottom
  float n = cur - (rows - 3.0) + r;
  float nn = mod(n, 89.0);

  vec3 col = uBg * (0.8 + 0.35 * vUv.y);
  if (n == cur) col += uLineHi;

  float xc = vUv.x * cols;
  float cx = floor(xc);
  float fx = fract(xc);
  float glyphX = smoothstep(0.06, 0.16, fx) * smoothstep(0.94, 0.84, fx);

  if (n <= cur) {
    if (cx >= 1.0 && cx < GUTTER - 1.0) {
      // line numbers: two short dim digits
      float g = glyphX * smoothstep(0.3, 0.36, fy) * smoothstep(0.72, 0.66, fy);
      col = mix(col, uGutter, g * (n == cur ? 1.0 : 0.6));
    } else if (cx >= GUTTER) {
      float h0 = hash21(vec2(nn, 1.5));
      bool blank = h0 < 0.12;
      bool comment = h0 >= 0.12 && h0 < 0.24;
      float indent = floor(hash21(vec2(nn, 2.5)) * 4.0) * 2.0;
      float x = cx - GUTTER - indent;
      float nTok = 2.0 + floor(hash21(vec2(nn, 3.5)) * 4.0);

      float pos = 0.0;
      float tok = -1.0;
      for (int k = 0; k < 6; k++) {
        float fk = float(k);
        if (fk >= nTok) break;
        float len = 2.0 + floor(hash21(vec2(nn, 4.5 + fk)) * 7.0);
        if (x >= pos && x < pos + len) tok = fk;
        pos += len + 1.0;
      }
      float lineLen = pos - 1.0;
      // the current line finishes typing a little before the next one starts
      float typed = n < cur ? 1e3 : floor(prog * 1.3 * (lineLen + 1.0));

      if (!blank && tok >= 0.0 && x < typed) {
        float th = hash21(vec2(nn, 12.5 + tok));
        vec3 c = uIdent;
        if (comment) c = uComment;
        else if (tok == 0.0 && th < 0.65) c = uKey;
        else if (th < 0.22) c = uStr;
        else if (th < 0.36) c = uNum;
        else if (th < 0.5) c = uKey;
        // a few tall "letters" so the blocks read as text
        float tall = step(0.72, hash21(vec2(cx + 0.5, nn + 30.5)));
        float top = mix(0.34, 0.2, tall);
        float g = glyphX * smoothstep(top, top + 0.06, fy) * smoothstep(0.76, 0.7, fy);
        col = mix(col, c, g);
      }

      // caret
      if (n == cur) {
        float caret = min(typed, lineLen + 1.0);
        float blink = step(0.5, fract(uTime * 1.1));
        if (x == caret && fx < 0.28) col = mix(col, uIdent * 1.3, blink);
      }
    }
  }

  // faint scanlines and a soft edge so the panel doesn't look like a flat sticker
  col *= 0.93 + 0.07 * sin(vUv.y * rows * 6.2831);
  vec2 e = vUv * (1.0 - vUv);
  col *= mix(0.55, 1.0, smoothstep(0.0, 0.035, min(e.x, e.y * 1.7)));
  gl_FragColor = vec4(col * uGain, 1.0);
}
`;

/** Wispy steam rising off the mug: two curling noise-driven ribbons that fade in and out. */
export const STEAM_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
${HASH_GLSL}
float ribbon(vec2 uv, float seed) {
  float sway = (valueNoise(vec2(uv.y * 2.2 - uTime * 0.45, seed)) - 0.5) * 0.5 * uv.y
             + sin(uv.y * 7.0 - uTime * 1.3 + seed * 3.0) * 0.05 * uv.y;
  float x = uv.x - 0.5 - sway;
  float width = mix(0.05, 0.16, uv.y);
  float body = smoothstep(width, 0.0, abs(x));
  float breakup = valueNoise(vec2(uv.x * 5.0 + seed, uv.y * 4.0 - uTime * 0.7));
  return body * smoothstep(0.25, 0.75, breakup);
}
void main() {
  float d = ribbon(vUv, 1.0) + 0.7 * ribbon(vUv + vec2(0.06, 0.0), 7.0);
  float fade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.45, vUv.y);
  float a = clamp(d, 0.0, 1.0) * fade * uOpacity;
  if (a < 0.002) discard;
  gl_FragColor = vec4(uColor, a);
}
`;
