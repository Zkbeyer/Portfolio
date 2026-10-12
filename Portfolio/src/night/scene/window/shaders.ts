// GLSL for the view through the window (sky, skyline) and the rain-streaked glass.
// All procedural: no textures are loaded.

/** Small hash helpers shared by the shaders ("hash without sine" style, stable on mobile GPUs). */
export const HASH_GLSL = /* glsl */ `
float hash21(vec2 p) {
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}
vec3 hash31(float p) {
  vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.11369, 0.13787));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
}
float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}
`;

export const UV_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Night sky: three-stop gradient over the part of the plane visible through the window,
 * twinkling stars that thin out toward the city glow, and a moon with a soft halo.
 * The moon core is pushed above 1.0 so the selective Bloom pass picks it up.
 */
export const SKY_FRAG = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uMid;
uniform vec3 uLow;
uniform vec3 uMoon;
uniform vec2 uMoonPos;
uniform float uMoonR;
uniform float uAspect;
uniform vec2 uBand; // v range that is actually visible through the window
uniform float uTime;
varying vec2 vUv;
${HASH_GLSL}
void main() {
  float t = clamp((vUv.y - uBand.x) / (uBand.y - uBand.x), 0.0, 1.0);
  vec3 col = t < 0.45
    ? mix(uLow, uMid, smoothstep(0.0, 0.45, t))
    : mix(uMid, uTop, smoothstep(0.45, 1.0, t));

  // stars: one candidate per cell, most cells empty
  vec2 g = vUv * vec2(uAspect, 1.0) * 110.0;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash21(id);
  vec2 o = (vec2(hash21(id + 1.7), hash21(id + 3.1)) - 0.5) * 0.6;
  float size = mix(0.05, 0.11, hash21(id + 5.3));
  float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + 2.2 * hash21(id + 9.1)) + h * 40.0);
  float star = smoothstep(size, 0.0, length(f - o)) * step(0.94, h) * twinkle;
  col += vec3(1.0, 0.92, 0.82) * star * smoothstep(0.3, 0.75, t) * 1.3;

  // moon + halo
  vec2 mp = (vUv - uMoonPos) * vec2(uAspect, 1.0);
  float md = length(mp);
  float halo = exp(-md * 16.0) * 0.12 + exp(-md * 55.0) * 0.4;
  col += uMoon * halo;
  float disc = smoothstep(uMoonR, uMoonR * 0.94, md);
  float maria = 1.0 - 0.14 * smoothstep(0.45, 0.75, valueNoise(mp / uMoonR * 2.2 + 3.0));
  col = mix(col, uMoon * 1.6 * maria, disc);

  gl_FragColor = vec4(col, 1.0);
}
`;

export const SKYLINE_VERT = /* glsl */ `
attribute vec2 aSize;
attribute float aSeed;
varying vec2 vLocal;
varying vec2 vSize;
varying float vSeed;
void main() {
  vLocal = uv * aSize;
  vSize = aSize;
  vSeed = aSeed;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Building faces with a grid of windows. A seeded fraction are lit (warm, a few cool TV-blue),
 * and a handful slowly switch on and off so the city feels inhabited at 2am.
 */
export const SKYLINE_FRAG = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uFog;
uniform float uFogAmt;
uniform vec3 uLit;
uniform vec3 uCool;
uniform float uLitAmt;
uniform float uBright;
uniform vec2 uCell;
uniform float uTime;
varying vec2 vLocal;
varying vec2 vSize;
varying float vSeed;
${HASH_GLSL}
void main() {
  vec3 col = mix(uBase, uFog, uFogAmt);
  // faint lighter cap so stacked silhouettes separate
  col += 0.025 * smoothstep(vSize.y - 0.03, vSize.y, vLocal.y);

  const float MARGIN = 0.06;
  vec2 g = (vLocal - vec2(MARGIN, 0.0)) / uCell;
  vec2 id = floor(g);
  vec2 f = fract(g);
  float fits = step(MARGIN, vLocal.x)
    * step((id.x + 1.0) * uCell.x + MARGIN, vSize.x - MARGIN * 0.5)
    * step((id.y + 1.0) * uCell.y, vSize.y - 0.08);
  float pane = step(0.22, f.x) * step(f.x, 0.78) * step(0.28, f.y) * step(f.y, 0.8);

  vec2 key = id + vSeed * 17.31;
  float h = hash21(key);
  float lit = step(1.0 - uLitAmt, h);
  float sometimes = step(0.965, hash21(key * 1.37 + 4.2));
  lit = mix(lit, step(0.55, fract(uTime * 0.035 + h * 7.0)), sometimes);

  vec3 warm = uLit * (0.65 + 0.5 * hash21(key + 3.3));
  vec3 lamp = mix(warm, uCool, step(0.88, hash21(key + 8.8)));
  col = mix(col, lamp * uBright, pane * lit * fits);

  gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * Rain on the window pane. The outside world is rendered to a mip-mapped texture each frame;
 * the glass samples it in screen space. Fogged glass reads a blurrier mip level, while drops and
 * the clear trails behind running drops read the sharp level, offset by a lens-like normal so
 * each drop refracts the city behind it. Two layers of running drops + a field of static beads.
 */
export const RAIN_FRAG = /* glsl */ `
uniform sampler2D uScene;
uniform vec2 uResolution;
uniform vec2 uGlass;   // pane size in metres
uniform float uTime;
uniform float uBlur;   // mip level for fogged glass
uniform vec3 uTint;
varying vec2 vUv;
${HASH_GLSL}

// One layer of drops running down the pane in staggered columns.
// xy: refraction offset, z: how "clear" the glass is here (drop or trail).
vec3 runningDrops(vec2 p, float t, float scale) {
  vec2 cell = vec2(0.09, 0.36) * scale;
  float column = floor(p.x / cell.x);
  float ch = hash21(vec2(column, scale * 13.0));
  // gravity with a little stick-slip: speed pulses so drops hesitate, then run
  float run = t * (0.045 + 0.05 * ch) + 0.012 * sin(t * (1.3 + ch) + ch * 6.28);
  p.y += run + ch * 3.0;

  vec2 id = vec2(column, floor(p.y / cell.y));
  vec2 st = (p - id * cell) / cell;            // 0..1 inside the cell
  vec3 n = hash31(id.x * 35.2 + id.y * 2376.1 + scale * 7.0);
  float present = step(0.3, n.z);

  float wobble = sin(p.y * 16.0 + n.x * 6.28) * 0.07 + (n.x - 0.5) * 0.3;
  const float DROP_Y = 0.22;
  vec2 d = (st - vec2(0.5 + wobble, DROP_Y)) * cell;  // metres from the drop centre
  float r = (0.009 + 0.007 * n.y) * scale;
  float drop = smoothstep(r, r * 0.7, length(d * vec2(1.0, 0.8))) * present;

  // trail it leaves above itself, fading with distance
  float above = smoothstep(DROP_Y - 0.01, DROP_Y + 0.06, st.y);
  float fade = 1.0 - smoothstep(DROP_Y, 1.0, st.y);
  float trail = smoothstep(r * 0.6, r * 0.25, abs(d.x)) * above * fade * present;

  // tiny beads left behind inside the trail
  float beadStep = cell.y / 7.0;
  vec2 bd = vec2(d.x, (fract(st.y * 7.0 + n.y) - 0.5) * beadStep);
  float bead = smoothstep(r * 0.42, r * 0.22, length(bd)) * above * fade * present * step(0.35, hash21(id + floor(st.y * 7.0)));

  vec2 offset = d / r * drop * 0.9 + bd / (r * 0.42) * bead * 0.35;
  return vec3(offset * 0.011, max(max(drop, bead), trail * 0.75));
}

// Static beads of condensation that slowly appear and evaporate.
vec3 staticDrops(vec2 p, float t) {
  vec2 g = p * 30.0;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  vec3 n = hash31(id.x * 107.45 + id.y * 3543.654);
  vec2 d = f - (n.xy - 0.5) * 0.6;
  float life = fract(t * 0.04 + n.z);
  float alive = smoothstep(0.0, 0.04, life) * (1.0 - smoothstep(0.55, 1.0, life));
  float r = 0.05 + 0.13 * n.y * n.y;
  float drop = smoothstep(r, r * 0.6, length(d)) * alive * step(0.25, n.x);
  return vec3(d / r * drop * 0.006, drop);
}

void main() {
  vec2 p = vUv * uGlass;
  vec3 s = staticDrops(p, uTime);
  vec3 a = runningDrops(p, uTime, 1.0);
  vec3 b = runningDrops(p + vec2(0.37, 0.11), uTime * 1.12, 0.7);

  vec2 offset = s.xy + a.xy + b.xy;
  float clear = clamp(s.z + a.z + b.z, 0.0, 1.0);

  // condensation is a little heavier toward the bottom of the pane
  float fog = (1.0 - clear) * mix(1.0, 0.75, vUv.y);
  vec2 suv = gl_FragCoord.xy / uResolution + offset;
  vec3 col = textureLod(uScene, suv, uBlur * fog).rgb;

  // fogged glass scatters a little room light and loses some contrast
  col = mix(col, col * 0.82 + uTint * 0.035, fog * 0.7);
  // a faint specular rim on the drops
  col += uTint * 0.05 * smoothstep(0.4, 1.0, length(offset) * 90.0) * clear;

  gl_FragColor = vec4(col, 1.0);
}
`;
