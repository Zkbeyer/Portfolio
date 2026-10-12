import { person } from "../../content/site";
import { toggleAudio, useAudioPlaying } from "../audio/audioStore";
import { HOTSPOTS } from "../scene/hotspots";

// Same destinations as the objects in the room, in reading order.
const SECTION_LINKS = (["plane", "monitor", "pi", "telescope"] as const).map((id) => ({
  label: HOTSPOTS[id].label,
  href: `#${HOTSPOTS[id].section}`,
}));

/**
 * The keyboard / screen-reader equivalent of the 3D room (the canvas itself is aria-hidden).
 * Visually hidden until something inside it takes focus, then it drops in as a row of labels.
 */
export function HiddenNav() {
  const playing = useAudioPlaying();
  return (
    <nav className="night-skipnav" aria-label="Sections">
      <ul>
        {SECTION_LINKS.map((l) => (
          <li key={l.href}>
            <a className="hand" href={l.href}>
              {l.label}
            </a>
          </li>
        ))}
        <li>
          <a className="hand" href={person.links.resume} target="_blank" rel="noopener">
            resume (pdf)
          </a>
        </li>
        <li>
          <button type="button" className="hand" aria-pressed={playing} onClick={toggleAudio}>
            lofi: {playing ? "on" : "off"}
          </button>
        </li>
      </ul>
    </nav>
  );
}
