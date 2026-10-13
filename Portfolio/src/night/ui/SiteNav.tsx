import { person } from "../../content/site";
import { toggleAudio, useAudioPlaying } from "../audio/audioStore";
import { goToPanel } from "../scene/hotspots";
import { PANEL_IDS } from "./panelStore";

// Same destinations as the objects in the room, in reading order. Each opens its detail panel
// (the href keeps them real links: deep-linkable, open-in-new-tab, works before JS).
const SECTION_LINKS = PANEL_IDS.map((id) => ({ id, label: id, href: `#${id}` }));

/**
 * The plain-HTML way around the site (the 3D room is aria-hidden): panel links, resume and the
 * sound toggle. Visible top-right on desktop so nobody has to discover the objects to navigate;
 * on narrow screens the section links collapse to screen-reader/keyboard only (they reappear on
 * focus) and resume + sound stay visible.
 */
export function SiteNav() {
  const playing = useAudioPlaying();
  return (
    <nav className="night-nav" aria-label="Sections">
      <ul>
        {SECTION_LINKS.map((l) => (
          <li key={l.href} className="night-nav__section">
            <a
              href={l.href}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                goToPanel(l.id);
              }}
            >
              {l.label}
            </a>
          </li>
        ))}
        <li>
          <a className="night-nav__cta" href={person.links.resume} target="_blank" rel="noopener">
            Resume <span aria-hidden="true">↗</span>
          </a>
        </li>
        <li>
          <button type="button" className="night-nav__sound" aria-pressed={playing} onClick={toggleAudio}>
            <span className="night-nav__eq" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {playing ? "Sound on" : "Sound off"}
          </button>
        </li>
      </ul>
    </nav>
  );
}
