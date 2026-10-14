import { useEffect, useRef } from "react";
import { interests, type StickerId } from "../../content/site";
import { paintSticker, whenStickerFontsReady } from "../scene/props/stickerTexture";

/** One sticker from the telescope, drawn with the same painter into a small canvas. Decorative. */
function Sticker({ id, tilt }: { id: StickerId; tilt: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = 140;
    const H = 110;
    c.width = W * dpr;
    c.height = H * dpr;
    const draw = () => {
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.translate(c.width / 2, c.height / 2);
      ctx.scale(0.5 * dpr, 0.5 * dpr);
      paintSticker(ctx, id);
    };
    draw();
    whenStickerFontsReady(draw);
  }, [id]);
  return <canvas ref={ref} className="ns-sticker" style={{ transform: `rotate(${tilt}deg)` }} aria-hidden="true" />;
}

const TILTS = [-4, 3, -2, 5, -3];

/**
 * "Off the clock" in the About panel: the telescope's stickers as a sticker sheet, then every interest
 * grouped as text (the text carries the content; the stickers are decoration).
 */
export function Interests() {
  const stickers = interests.flatMap((g) => g.items.filter((i) => i.sticker).map((i) => i.sticker!));
  return (
    <div className="ns-interests">
      <div className="ns-sheet" aria-hidden="true">
        {stickers.map((id, i) => (
          <Sticker key={id} id={id} tilt={TILTS[i % TILTS.length]} />
        ))}
      </div>
      <dl className="ns-interests__groups">
        {interests.map((g) => (
          <div key={g.id} className="ns-interests__group">
            <dt>{g.label}</dt>
            <dd>
              <ul>
                {g.items.map((it) => (
                  <li key={it.name}>
                    {it.name}
                    {it.note ? <span className="ns-interests__note"> · {it.note}</span> : null}
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
