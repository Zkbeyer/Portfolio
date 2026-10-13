import { useMemo } from "react";
import { person } from "../../content/site";
import { useFocus } from "../scene/focus";
import { openFocused } from "../scene/hotspots";
import { usePanel } from "./panelStore";

type Pt = [number, number];

/**
 * Hand-placed constellations (viewBox 0–1000), one per interest in `content/site.ts`, in order:
 * skiing (a downhill zig-zag), camping (a tent), hiking (two peaks), nature photography (a camera),
 * space weather (a sun with rays).
 */
const SHAPES: { stars: Pt[]; lines: [number, number][]; label: Pt }[] = [
  { stars: [[250, 250], [330, 300], [280, 360], [370, 410], [330, 470]], lines: [[0, 1], [1, 2], [2, 3], [3, 4]], label: [250, 225] },
  { stars: [[640, 230], [580, 340], [700, 340], [640, 340]], lines: [[0, 1], [0, 2], [1, 3], [3, 2], [0, 3]], label: [585, 205] },
  { stars: [[420, 600], [500, 500], [560, 570], [620, 470], [700, 600]], lines: [[0, 1], [1, 2], [2, 3], [3, 4]], label: [470, 450] },
  { stars: [[200, 690], [320, 690], [320, 780], [200, 780], [260, 735]], lines: [[0, 1], [1, 2], [2, 3], [3, 0]], label: [170, 665] },
  { stars: [[740, 700], [700, 650], [790, 655], [690, 740], [795, 745]], lines: [[0, 1], [0, 2], [0, 3], [0, 4]], label: [600, 815] },
];

/** Background stars, seeded so the sky is the same on every visit. */
function field(n: number) {
  let s = 26;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  return Array.from({ length: n }, () => ({ x: r() * 1000, y: r() * 1000, r: 0.8 + r() * 2.2, o: 0.25 + r() * 0.6, d: r() * 4 }));
}

/**
 * The telescope's "look closer" step: the view through the eyepiece — a round window onto the night sky
 * where a few stars are joined into constellations named after what I do off the clock. Clicking the
 * view opens the About panel (the visible Open button does the same). Decorative: the interests are
 * real text in the About panel.
 */
export function Eyepiece() {
  const focus = useFocus();
  const panel = usePanel();
  const stars = useMemo(() => field(140), []);
  if (focus !== "telescope" || panel) return null;
  return (
    <div className="night-eyepiece" aria-hidden="true" onClick={() => openFocused("telescope")}>
      <svg className="night-eyepiece__view" viewBox="0 0 1000 1000">
        <defs>
          <radialGradient id="ep-sky" cx="50%" cy="45%" r="60%">
            <stop offset="0" stopColor="#2b2333" />
            <stop offset="0.7" stopColor="#15121b" />
            <stop offset="1" stopColor="#0b0a0e" />
          </radialGradient>
          <clipPath id="ep-clip">
            <circle cx="500" cy="500" r="496" />
          </clipPath>
        </defs>
        <g clipPath="url(#ep-clip)">
          <rect width="1000" height="1000" fill="url(#ep-sky)" />
          {stars.map((st, i) => (
            <circle key={i} className="night-eyepiece__star" cx={st.x} cy={st.y} r={st.r} opacity={st.o} style={{ animationDelay: `${-st.d}s` }} />
          ))}
          {SHAPES.map((sh, i) => (
            <g key={i} className="night-eyepiece__con" style={{ animationDelay: `${0.5 + i * 0.25}s` }}>
              {sh.lines.map(([a, b]) => (
                <line key={`${a}-${b}`} x1={sh.stars[a][0]} y1={sh.stars[a][1]} x2={sh.stars[b][0]} y2={sh.stars[b][1]} />
              ))}
              {sh.stars.map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5" />
              ))}
              <text x={sh.label[0]} y={sh.label[1]}>
                {person.interests[i]}
              </text>
            </g>
          ))}
          {/* crosshair + reticle ticks */}
          <circle cx="500" cy="500" r="496" className="night-eyepiece__rim" />
          <path className="night-eyepiece__reticle" d="M500 40v60M500 900v60M40 500h60M900 500h60" />
        </g>
      </svg>
    </div>
  );
}
