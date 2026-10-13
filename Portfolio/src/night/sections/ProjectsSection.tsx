import { projects } from "../../content/site";
import { Tags } from "./Tags";

const STATUS: Record<string, string> = {
  running: "Running",
  live: "Live",
  active: "Active",
  "in-progress": "In progress",
  "in-development": "In development",
  demo: "Demo",
};

/**
 * Track 02 — projects. Interim body (P4.7 shared plumbing): a plain list from `content/site.ts`.
 * The monitor item replaces it with the playlist + detail layout.
 */
export function ProjectsSection() {
  return (
    <ol className="ns-list">
      {projects.map((p, i) => (
        <li key={p.id} className="ns-list__item">
          <p className="ns-meta">
            {String(i + 1).padStart(2, "0")} · {STATUS[p.status] ?? p.status}
            {p.metric && <> · {p.metric}</>}
          </p>
          <h3>{p.name}</h3>
          <p className="ns-lede">{p.tagline}</p>
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
        </li>
      ))}
    </ol>
  );
}
