import { projects } from "../../content/site";
import { Tags } from "./Tags";

const lab = projects.find((p) => p.id === "homelab")!;

/**
 * Track 03 — homelab. Interim body (P4.7 shared plumbing): description, stack and link from
 * `content/site.ts`. The Pi item adds the architecture diagram. No live status (Zack, 2026-10-12).
 */
export function HomelabSection() {
  return (
    <div className="ns-prose">
      <p className="ns-lede">{lab.tagline}.</p>
      <p>{lab.description}</p>
      <Tags items={lab.stack} />
      <p className="ns-links">
        {lab.links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener">
            {l.label} <span aria-hidden="true">↗</span>
          </a>
        ))}
      </p>
    </div>
  );
}
