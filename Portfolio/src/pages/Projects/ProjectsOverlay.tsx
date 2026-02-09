import React from "react";
import { motion } from "framer-motion";
import { PROJECTS } from "./projectsData";
import "./projects.css";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function ProjectsOverlay() {
  return (
    <div className="projects-overlay">
      {/* Header block matching your INDEX vibe */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ letterSpacing: "0.18em", fontSize: 12, opacity: 0.7 }}>
          V-001 • INDEX • PROJECTS
        </div>
        <div style={{ fontSize: 44, letterSpacing: "0.06em", marginTop: 10 }}>
          PROJECTS
        </div>
        <div style={{ opacity: 0.7, marginTop: 8, maxWidth: 780 }}>
          Scroll to shift perspective. Hover cards for details. Click repo to view source.
        </div>
      </motion.div>

      <div style={{ display: "grid", gap: 18, maxWidth: 980 }}>
        {PROJECTS.map((p, idx) => (
          <motion.div
            key={p.id}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.45, delay: idx * 0.04 }}
            style={{
              borderRadius: 16,
              padding: 18,
              background: "rgba(10,12,16,0.55)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 18, letterSpacing: "0.12em" }}>{p.title.toUpperCase()}</div>
                <div style={{ opacity: 0.65, marginTop: 6 }}>{p.tagline}</div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <a
                  href={p.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    opacity: 0.85,
                    textDecoration: "none",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.16)",
                    padding: "10px 12px",
                    borderRadius: 12,
                  }}
                >
                  Repo →
                </a>
                {p.liveUrl && (
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 12,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      opacity: 0.85,
                      textDecoration: "none",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.16)",
                      padding: "10px 12px",
                      borderRadius: 12,
                    }}
                  >
                    Live →
                  </a>
                )}
              </div>
            </div>

            <div style={{ marginTop: 12, opacity: 0.78, lineHeight: 1.55 }}>
              {p.description}
            </div>

            {/* tech pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {p.tech.map((t) => (
                <div
                  key={t}
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.08em",
                    opacity: 0.85,
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>

            {/* images */}
            {p.images.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 14 }}>
                {p.images.slice(0, 2).map((src) => (
                  <div
                    key={src}
                    style={{
                      borderRadius: 14,
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(0,0,0,0.35)",
                    }}
                  >
                    <img src={src} alt="" style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* subtle "idle" vibe line */}
      <div style={{ marginTop: 34, opacity: 0.55, letterSpacing: "0.16em", fontSize: 12 }}>
        END OF INDEX • SCROLL UP TO REFOCUS
      </div>
    </div>
  );
}