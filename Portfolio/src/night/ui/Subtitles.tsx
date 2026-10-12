import { focusOn, useFocus } from "../scene/focus";
import { HOTSPOTS, useHovered } from "../scene/hotspots";
import { useAudioPlaying } from "../audio/audioStore";
import { INTRO_LINES } from "./copy";


/**
 * Anime-style subtitles at the bottom of the hero. Idle: the intro lines, one after the other.
 * Hovering or focusing an object swaps in its line. Decorative (aria-hidden): the intro is also
 * real text in the hero header, and every destination is in the hidden nav.
 */
export function Subtitles() {
  const hovered = useHovered();
  const focus = useFocus();
  const playing = useAudioPlaying();
  const id = hovered ?? focus;

  let lines: readonly string[] = INTRO_LINES;
  if (id) {
    const info = HOTSPOTS[id];
    const focused = focus === id;
    lines = [id === "cassette" && playing ? "press stop for quiet." : focused && info.focusHint ? info.focusHint : info.hint];
  }

  return (
    <div className="night-subs">
      {/* key re-mounts the block so each new caption fades in like a new subtitle */}
      <div className={`night-subs__lines${id ? "" : " is-intro"}`} key={id ?? "intro"} aria-hidden="true">
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
      {focus && (
        <button type="button" className="night-subs__back hand" onClick={() => focusOn(null)}>
          ← back to the desk <kbd>esc</kbd>
        </button>
      )}
    </div>
  );
}
