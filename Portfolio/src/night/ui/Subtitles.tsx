import { focusOn, useFocus } from "../scene/focus";
import { HOTSPOTS, openFocused, useHovered } from "../scene/hotspots";
import { useAudioPlaying } from "../audio/audioStore";
import { usePanel } from "./panelStore";
import { INTRO_LINES } from "./copy";

/**
 * Film-style subtitles at the bottom of the hero. Idle: the intro lines, one after the other.
 * Hovering or focusing an object swaps in its line. While an object is focused, "Back to the desk"
 * and a visible "Open ↗" (the second step, for keyboard/touch) sit under the line.
 * Decorative text is aria-hidden: the intro is also real text in the hero, and every destination is in the nav.
 */
export function Subtitles() {
  const hovered = useHovered();
  const focus = useFocus();
  const panel = usePanel();
  const playing = useAudioPlaying();
  const id = hovered ?? focus;

  if (panel) return null; // the detail panel covers the room

  let lines: readonly string[] = INTRO_LINES;
  if (id) {
    const info = HOTSPOTS[id];
    const focused = focus === id;
    lines = [id === "cassette" && playing ? "Press stop for quiet." : focused && info.focusHint ? info.focusHint : info.hint];
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
