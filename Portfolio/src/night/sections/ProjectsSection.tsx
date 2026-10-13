import { useRef, type KeyboardEvent } from "react";
import { projects } from "../../content/site";
import { STATUS_LABEL, setProjectCursor, useProjectCursor } from "../ui/projectCursor";
import { Tags } from "./Tags";

const num = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Track 02 — projects as a playlist: tracks on the left, the selected one on the right. The selection is
 * shared with the monitor in the room, so the panel opens on whatever was highlighted there.
 * Keyboard: arrow keys move between tracks (roving tabindex), like a real list box.
 */
export function ProjectsSection() {
  const cursor = useProjectCursor();
  const list = useRef<HTMLOListElement>(null);
  const p = projects[cursor];

  const onKey = (e: KeyboardEvent) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (cursor + d + projects.length) % projects.length;
    setProjectCursor(next);
    list.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };

  return (
    <div className="ns-projects">
      <ol className="ns-playlist" ref={list} aria-label="Projects" onKeyDown={onKey}>
        {projects.map((proj, i) => (
          <li key={proj.id}>
            <button
              type="button"
              className="ns-playlist__track"
              aria-current={i === cursor ? "true" : undefined}
              tabIndex={i === cursor ? 0 : -1}
              onClick={() => setProjectCursor(i)}
            >
              <span className="ns-playlist__num" aria-hidden="true">
                {i === cursor ? "▶" : num(i)}
              </span>
              <span className="ns-playlist__name">{proj.name}</span>
              <span className="ns-playlist__status">{STATUS_LABEL[proj.status] ?? proj.status}</span>
            </button>
          </li>
        ))}
      </ol>
      <article className="ns-track" aria-live="polite" key={p.id}>
        <p className="ns-meta">
          Track {num(cursor)} · {STATUS_LABEL[p.status] ?? p.status}
          {p.metric && <> · {p.metric}</>}
        </p>
        <h3 className="ns-track__name">{p.name}</h3>
        <p className="ns-lede">{p.tagline}</p>
        {p.image && (
          <img className="ns-track__shot" src={p.image} alt={`Screenshot of ${p.name}`} loading="lazy" decoding="async" />
        )}
        <p>{p.description}</p>
        <Tags items={p.stack} />
        {p.links.length > 0 && (
          <p className="ns-links">
            {p.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener">
                {l.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </p>
        )}
      </article>
    </div>
  );
}
