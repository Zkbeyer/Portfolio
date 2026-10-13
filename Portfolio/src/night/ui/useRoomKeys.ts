import { useEffect } from "react";
import { getFocus } from "../scene/focus";
import { openFocused } from "../scene/hotspots";
import { getPanel } from "./panelStore";
import { moveProjectCursor } from "./projectCursor";

/**
 * Keyboard for the focused monitor: ↑/↓ move the playlist highlight, Enter opens the Projects panel
 * on it (unless a button has focus — then Enter is that button's).
 */
export function useRoomKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
