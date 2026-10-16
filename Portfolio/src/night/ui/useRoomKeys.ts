import { useEffect } from "react";
import { getFocus } from "../scene/focus";
import { openFocused } from "../scene/hotspots";
import { getPanel } from "./panelStore";
import { moveProjectCursor } from "./projectCursor";
import { flipLights } from "./actions";

/**
 * L flips the room lights anywhere in the room. Keyboard for the focused monitor: ↑/↓ move the playlist highlight, Enter opens the Projects panel
 * on it (unless a button has focus — then Enter is that button's).
 */
export function useRoomKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // L: light switch (not while typing or with a panel open)
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === "l" || e.key === "L") && !typing && !getPanel() && !e.metaKey && !e.ctrlKey && !e.altKey) {
        flipLights();
        return;
      }
      if (getPanel() || getFocus() !== "monitor" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        moveProjectCursor(e.key === "ArrowDown" ? 1 : -1);
      } else if (e.key === "Enter" && (document.activeElement === document.body || !document.activeElement)) {
        e.preventDefault();
        openFocused("monitor");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
