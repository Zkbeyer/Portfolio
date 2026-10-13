import { focusOn, useFocus } from "../scene/focus";
import { HOTSPOTS, openFocused, useHovered } from "../scene/hotspots";
import { useAudioPlaying } from "../audio/audioStore";
import { usePanel } from "./panelStore";
import { INTRO_LINES, STILL_INTRO_LINES } from "./copy";
import { useCallback, useState } from "react";
import { RoomSheet } from "./RoomSheet";

/**
 * Film-style subtitles at the bottom of the hero. Idle: the intro lines, one after the other.
 * Hovering or focusing an object swaps in its line. While an object is focused, "Back to the desk"
 * and a visible "Open ↗" (the second step, for keyboard/touch) sit under the line.
 * Decorative text is aria-hidden: the intro is also real text in the hero, and every destination is in the nav.
 */
export function Subtitles({ still = false }: { still?: boolean }) {
  const hovered = useHovered();
  const focus = useFocus();
  const panel = usePanel();
  const playing = useAudioPlaying();
  const id = hovered ?? focus;
  const [sheet, setSheet] = useState(false);
  const [coarse] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.("(pointer: coarse)").matches);
  const closeSheet = useCallback(() => setSheet(false), []);

  if (panel) return null; // the detail panel covers the room

  let lines: readonly string[] = still ? STILL_INTRO_LINES : INTRO_LINES;
  if (id) {
    const info = HOTSPOTS[id];
    const focused = focus === id;
    const focusHint = (coarse && info.touchHint) || info.focusHint;
    lines = [id === "cassette" && playing ? "Press stop for quiet." : focused && focusHint ? focusHint : info.hint];
  }
  const openLabel = focus ? HOTSPOTS[focus].openLabel : undefined;

  return (
    <div className="night-subs">
      {/* key re-mounts the block so each new caption fades in like a new subtitle */}
      <div className={`night-subs__lines${id ? "" : " is-intro"}`} key={id ?? "intro"} aria-hidden="true">
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
      {!focus && (
        <button type="button" className="night-subs__back night-subs__explore" onClick={() => setSheet(true)}>
          Look around <span aria-hidden="true">↑</span>
        </button>
      )}
      <RoomSheet open={sheet} onClose={closeSheet} still={still} />
      {focus && (
        <div className="night-subs__actions">
          <button type="button" className="night-subs__back" onClick={() => focusOn(null)}>
            ← Back to the desk <kbd>Esc</kbd>
          </button>
          {openLabel && (
            <button type="button" className="night-subs__back night-subs__open" onClick={() => openFocused(focus)}>
              {openLabel} <span aria-hidden="true">↗</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
