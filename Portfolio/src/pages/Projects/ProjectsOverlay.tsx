import { motion } from "framer-motion";
import { PROJECTS } from "./projectsData";
import "./projectsOverlay.css";
import type { Project } from "./projectsData";
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

function ProjectHeader() {
  return (
    <motion.header
      className="p-header"
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.55 }}
    >
      <div className="p-kicker">V-002</div>
      <div className="p-h1">PROJECTS</div>
      <div className="p-lead">
        Scroll down to see the projects I am most proud of. Each has a link to the repo and live site if it applies.
      </div>
    </motion.header>
  );
}

function MetaRow({ meta }: { meta?: Project["meta"] }) {
  if (!meta) return null;
  const items = [
    meta.role ? { k: "ROLE", v: meta.role } : null,
    meta.timeframe ? { k: "TIME", v: meta.timeframe } : null,
    meta.status ? { k: "STATUS", v: meta.status } : null,
  ].filter(Boolean) as { k: string; v: string }[];

  if (!items.length) return null;

  return (
    <div className="p-highlightGrid" aria-label="Project quick facts">
      {items.map((it) => (
        <div key={it.k} className="p-highlightItem">
          <div className="p-kicker" style={{ opacity: 0.65 }}>{it.k}</div>
          <div style={{ marginTop: 8 }}>{it.v}</div>
        </div>
      ))}
    </div>
  );
}

function Highlights({ highlight }: { highlight?: Project["highlight"] }) {
  if (!highlight?.length) return null;
  return (
    <div className="p-highlightGrid" aria-label="Project highlights">
      {highlight.map((h) => (
        <div key={h.label + h.value} className="p-highlightItem">
          <div className="p-kicker" style={{ opacity: 0.65 }}>{h.label}</div>
          <div style={{ marginTop: 8 }}>{h.value}</div>
        </div>
      ))}
    </div>
  );
}

function ProjectImages({ images }: { images: string[] }) {
  if (!images?.length) return null;
  return (
    <div className="p-images">
      {images.slice(0, 2).map((src) => (
        <div key={src} className="p-imgWrap">
          <img className="p-img" src={src} alt="" loading="lazy" />
        </div>
      ))}
    </div>
  );
}

function ProjectCard({ p, idx }: { p: Project; idx: number }) {
  const hasBullets = !!p.bullets?.length;

  return (
    <motion.article
      className="p-card"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.5, delay: Math.min(idx * 0.05, 0.25) }}
      whileHover={{ y: -2 }}
    >
      <div className="p-cardHead">
        <div>
          <div className="p-title">{p.title.toUpperCase()}</div>
          <div className="p-tagline">{p.tagline}</div>
        </div>

        <div className="p-actions">
          <a className="p-btn" href={p.repoUrl} target="_blank" rel="noreferrer">
            Repo →
          </a>
          {p.liveUrl && (
            <a className="p-btn" href={p.liveUrl} target="_blank" rel="noreferrer">
              Live →
            </a>
          )}
        </div>
      </div>

      <div className="p-body">
        <div style={{ opacity: 0.86, lineHeight: 1.6 }}>{p.description}</div>

        {hasBullets && (
          <>
            <div className="p-subhead">WHAT IT DOES</div>
            <ul className="p-bullets">
              {p.bullets!.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </>
        )}

        <MetaRow meta={p.meta} />
        <Highlights highlight={p.highlight} />

        <div className="p-tech" aria-label="Tech stack">
          {p.tech.map((t) => (
            <span key={t} className="p-pill">
              {t}
            </span>
          ))}
        </div>

        <ProjectImages images={p.images} />
      </div>
    </motion.article>
  );
}

export default function ProjectsOverlay() {
  return (
    <div className="projects-overlay">
      <ProjectHeader />

      <section className="p-list" aria-label="Projects list">
        {PROJECTS.map((p, idx) => (
          <ProjectCard key={p.id} p={p} idx={idx} />
        ))}
      </section>

      <div className="p-end">END OF PROJECTS SECTION</div>
    </div>
  );
}