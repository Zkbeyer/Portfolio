import { useState } from "react";
import { preloadPage, navigateTo } from "../../../app/navBus";
import BottomChecker from "./BottomChecker";
import "../sections.css";

export default function PageProjects() {
  const [hovered, setHovered] = useState(false);
  function preload() {
    setHovered(true);
    preloadPage("PROJECTS");
  }

  return (
    <>
      <div className="sectionKicker sectionKickerProjects">Contact ↑</div>

      <div
        className={`sectionPanel ${hovered ? "isHovered" : ""}`}
        onMouseEnter={() => preload()}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          e.preventDefault();
          navigateTo("PROJECTS");
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigateTo("PROJECTS");
          }
        }}
        aria-label="Open Projects page"
      >
        <div className="panelHeaderRow">
          <div className="panelTitle">PROJECTS</div>

          <div className={`panelCta ${hovered ? "isHovered" : ""}`}>
            Click to open Projects →
          </div>
        </div>

        <div className="panelLead">
          See what I’ve built, how I build, and what I’m building next. Scroll down to
          see featured projects, or click the headers to jump around.
        </div>

        <div className="spacer50" />

        <div className="subTitle">HIGHLIGHTED PROJECT:</div>

        <div className="card">
          <div className="cardTopRow">
            <div>
              <div className="cardTitle">SPOTIFY REWIND</div>
              <div className="cardTagline">
                Your personal music year-in-review with AI-style insights 
              </div>
            </div>
          </div>

          <div className="cardBody">
            A full-stack web app that analyzes listening history to generate a personalized
            “Wrapped”-style report, with shareable insights and clean, fast UX.
            <p>(Your Spotify email has to be regisered with my API key to be able to use this yourself)</p>
          </div>

          <div className="pillRow">
            {["React", "Node", "Express", "TypeScript", "API"].map((t) => (
              <div key={t} className="pill">
                {t}
              </div>
            ))}
          </div>

          <div className="imageGrid">
            {[`${import.meta.env.BASE_URL}/assets/project1.png`, `${import.meta.env.BASE_URL}/assets/project2.png`].map((src) => (
              <div key={src} className="imageFrame">
                <img
                  src={src}
                  alt=""
                  className="image"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="spacer50" />

        <div className="panelTip">
          Tip: click anywhere on this panel to open the full Projects page
        </div>

        <BottomChecker label="END OF PROJECTS" />
      </div>

      <div className="pageBottomPad" />
    </>
  );
}