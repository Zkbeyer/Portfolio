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
          See what I've built, how I build, and what I'm building next. Scroll down to
          see featured projects, or click the headers to jump around.
        </div>

        <div className="spacer50" />

        <div className="subTitle">HIGHLIGHTED PROJECT:</div>

        <div className="card">
          <div className="cardTopRow">
            <div>
              <div className="cardTitle">MU PLANNER</div>
              <div className="cardTagline">
                Mizzou course explorer — browse courses, grade distributions, and professor ratings
              </div>
            </div>
          </div>

          <div className="cardBody">
            A Next.js web app that aggregates Mizzou course catalog data, historical grade
            distributions, and professor ratings into a fast, searchable interface for students
            planning their semester.
          </div>

          <div className="pillRow">
            {["Next.js", "TypeScript", "Tailwind CSS", "Fuse.js"].map((t) => (
              <div key={t} className="pill">
                {t}
              </div>
            ))}
          </div>

          <div className="imageGrid">
            {[`${import.meta.env.BASE_URL}/projects/mu-planner/1.png`, `${import.meta.env.BASE_URL}/projects/mu-planner/2.png`].map((src) => (
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