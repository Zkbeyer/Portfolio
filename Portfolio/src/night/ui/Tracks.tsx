import { person } from "../../content/site";
import { TRACKS } from "../sections";
import { PANEL_IDS } from "./panelStore";
import { toggleAudio, useAudioPlaying } from "../audio/audioStore";
import { useFocus } from "../scene/focus";

/**
 * Below the hero: the same four tracks as plain, scrollable sections (for anyone who'd rather read than
 * explore the room, and for crawlers/no-JS), then the footer. Section ids are `track-<id>` so the
 * `#work`-style hashes stay reserved for the panels.
 */
export function Tracks() {
  return (
    <>
      <div className="night-tracks" id="tracks">
        {PANEL_IDS.map((id) => {
          const { kicker, title, Body } = TRACKS[id];
          return (
            <section key={id} id={`track-${id}`} className="night-track" aria-labelledby={`track-${id}-title`}>
              <p className="night-panel__kicker">{kicker}</p>
              <h2 id={`track-${id}-title`} className="night-panel__title">
                {title}
              </h2>
              <div className="night-panel__body">
                <Body />
              </div>
            </section>
          );
        })}
      </div>
      <Footer />
    </>
  );
}

function Footer() {
  const playing = useAudioPlaying();
  return (
    <footer className="night-footer">
      <div>
        <p className="night-footer__name">{person.name}</p>
        <p className="night-footer__role">
          {person.focus} {person.title.toLowerCase()} · joining {person.next.org} in {person.next.when}
        </p>
      </div>
      <ul className="night-footer__links">
        <li>
          <a href={`mailto:${person.email}`}>{person.email}</a>
        </li>
        <li>
          <a href={person.links.github} target="_blank" rel="noopener">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </li>
        <li>
          <a href={person.links.linkedin} target="_blank" rel="noopener">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </li>
        <li>
          <a href={person.links.resume} target="_blank" rel="noopener">
            Resume <span aria-hidden="true">↗</span>
          </a>
        </li>
        <li>
          <button type="button" className="night-footer__sound" aria-pressed={playing} onClick={toggleAudio}>
            {playing ? "Rain + lo-fi: on" : "Rain + lo-fi: off"}
          </button>
        </li>
      </ul>
      <p className="night-footer__fine">© {new Date().getFullYear()} {person.name}</p>
    </footer>
  );
}

/** "Or just scroll ↓" in the hero corner (hidden while an object is focused — the Back/Open buttons own that moment). */
export function ScrollCue() {
  const focus = useFocus();
  if (focus) return null;
  return (
    <a className="night-scroll" href="#tracks">
      Or just scroll <span aria-hidden="true">↓</span>
    </a>
  );
}
