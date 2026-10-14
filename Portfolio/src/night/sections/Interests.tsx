import { useEffect, useRef } from "react";
import { interests } from "../../content/site";
import {
  drawCollage,
  panelLayout,
  whenStickerFontsReady,
} from "../scene/props/stickerTexture";

/** The telescope's stickers as one overlapping collage, sized to its box. Decorative. */
function StickerCollage() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (!w || !h) return;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const layout = panelLayout(w, h);
      const res = Math.min(1, (layout[0].size * dpr) / 320);
      drawCollage(ctx, layout, res);
    };
    draw();
    whenStickerFontsReady(draw);
    const ro = new ResizeObserver(draw);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);
  return <canvas ref={ref} className="ns-collage" aria-hidden="true" />;
}

/**
 * "Off the clock" in the About panel: the sticker collage, then every interest grouped as text
 * (the text carries the content; the stickers are decoration).
 */
export function Interests() {
  return (
    <div className="ns-interests">
      <StickerCollage />
      <dl className="ns-interests__groups">
        {interests.map((g) => (
          <div key={g.id} className="ns-interests__group">
            <dt>{g.label}</dt>
            <dd>
              <ul>
                {g.items.map((it) => (
                  <li key={it.name}>
                    {it.name}
                    {it.note ? (
                      <span className="ns-interests__note"> · {it.note}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
