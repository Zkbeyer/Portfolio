import React, { useEffect, useRef, useState } from "react";
import "./mouseHUD.css";

export default function MouseHUD() {
  const rafRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const targetRef = useRef({ x: 0.5, y: 0.5 });
  const smoothRef = useRef({ x: 0.5, y: 0.5 });

  const [hud, setHud] = useState({ x: 0.5, y: 0.5, a: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      targetRef.current.x = e.clientX / window.innerWidth;
      targetRef.current.y = e.clientY / window.innerHeight;

      setHud((p) => ({ ...p, a: 1 }));

      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = window.setTimeout(() => {
        setHud((p) => ({ ...p, a: 0 }));
      }, 650);

      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        smoothRef.current.x += (targetRef.current.x - smoothRef.current.x) * 0.18;
        smoothRef.current.y += (targetRef.current.y - smoothRef.current.y) * 0.18;
        setHud((p) => ({ ...p, x: smoothRef.current.x, y: smoothRef.current.y }));
      });
    };

    window.addEventListener("pointermove", onMove);

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  const px = hud.x * window.innerWidth;
  const py = hud.y * window.innerHeight;

  const xPct = Math.round(hud.x * 100);
  const yPct = Math.round(hud.y * 100);

  const coordsAlpha = 0.65 * hud.a;

  return (
    <div className="mouseHudRoot" aria-hidden>
      <div className="mouseGlow" style={{ left: px, top: py }} />
      <div className="mouseCoords" style={{ left: px + 14, top: py + 14, opacity: coordsAlpha }}>
        X {xPct.toString().padStart(2, "0")} • Y {yPct.toString().padStart(2, "0")}
      </div>
    </div>
  );
}