import { projects } from "../../content/site";
import { Tags } from "./Tags";

const lab = projects.find((p) => p.id === "homelab")!;

/** What runs on the cluster — every box is from the homelab description in `content/site.ts`. */
const WORKLOADS = [
  { name: "Self-heal service", detail: "Go · health checks, backups, automated recovery" },
  { name: "Prometheus + Grafana", detail: "Monitoring and alerting" },
  { name: "Access", detail: "Automated TLS, Tailscale, key-only SSH" },
  { name: "Minecraft", detail: "A server for friends" },
] as const;

/**
 * Track 03 — homelab: what it is, a small architecture diagram (Pi 5 → k3s → workloads), stack and link.
 * Static — no live status endpoint (Zack, 2026-10-12).
 */
export function HomelabSection() {
  return (
    <div className="ns-lab">
      <div className="ns-prose">
        <p className="ns-lede">{lab.tagline}.</p>
        <p>{lab.description}</p>
      </div>
      <figure className="ns-arch" aria-labelledby="arch-caption">
        <div className="ns-arch__node ns-arch__node--host">
          <span className="ns-meta">Hardware</span>
          <strong>Raspberry Pi 5</strong>
        </div>
        <div className="ns-arch__node ns-arch__node--k3s">
          <span className="ns-meta">Orchestration</span>
          <strong>k3s (Kubernetes)</strong>
          <span>Declarative, migrated from Docker Compose</span>
        </div>
        <ul className="ns-arch__workloads">
          {WORKLOADS.map((w) => (
            <li key={w.name} className="ns-arch__node">
              <strong>{w.name}</strong>
              <span>{w.detail}</span>
            </li>
          ))}
        </ul>
        <figcaption id="arch-caption" className="sr-only">
          Architecture: a Raspberry Pi 5 runs k3s, which runs a Go self-heal service, Prometheus and Grafana, secured access, and a
          Minecraft server.
        </figcaption>
      </figure>
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
