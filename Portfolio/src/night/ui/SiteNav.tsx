import { person } from "../../content/site";
import { toggleAudio, useAudioPlaying } from "../audio/audioStore";
import { goToPanel } from "../scene/hotspots";
import { PANEL_IDS } from "./panelStore";
import { useLightsOn } from "../scene/lights";
import { flipLights } from "./actions";

// Same destinations as the objects in the room, in reading order. Each opens its detail panel
// (the href keeps them real links: deep-linkable, open-in-new-tab, works before JS).
const SECTION_LINKS = PANEL_IDS.map((id) => ({ id, label: id, href: `#${id}` }));

/**
 * The plain-HTML way around the site (the 3D room is aria-hidden): panel links, resume and the
 * sound + light toggles. Visible top-right on desktop so nobody has to discover the objects to navigate;
 * on narrow screens the section links collapse to screen-reader/keyboard only (they reappear on
 * focus) and resume + sound stay visible.
 */
export function SiteNav() {
  const playing = useAudioPlaying();
  const lights = useLightsOn();
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
          <button
            type="button"
            className="night-nav__sound night-nav__lights"
            aria-pressed={lights}
            onClick={flipLights}
            title="Lights (L)"
          >
            <svg className="night-nav__bulb" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <path d="M8 1.5a4.5 4.5 0 0 0-2.6 8.2c.4.3.6.7.6 1.2V12h4v-1.1c0-.5.2-.9.6-1.2A4.5 4.5 0 0 0 8 1.5Z" fill="currentColor" />
              <rect x="6" y="13" width="4" height="1.6" rx=".8" fill="currentColor" />
            </svg>
            {lights ? "Lights on" : "Lights off"}
          </button>
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
