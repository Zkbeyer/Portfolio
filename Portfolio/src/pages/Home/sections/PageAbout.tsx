import React, { useState } from "react";
import { preloadPage, navigateTo } from "../../../app/navBus";
import BottomChecker from "./BottomChecker";
import "../sections.css";


export default function PageAbout() {
  const [hovered, setHovered] = useState(false);
  function preload() {
    setHovered(true);
    preloadPage("ABOUT");
    }

  return (
    <>
      <div className="sectionKicker sectionKickerAbout">Projects ↑</div>

      <div
        className={`sectionPanel ${hovered ? "isHovered" : ""}`}
        onMouseEnter={() => preload()}
        
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
           e.preventDefault();
           navigateTo("ABOUT");
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigateTo("ABOUT");
          }
        }}
        aria-label="Open About page"
      >
        <div className="panelHeaderRow">
          <div className="aboutHeaderLeft">
            <div className="headshotWrap">
              <img
                src="/assets/headshot.JPG"
                alt="Zackery Beyer headshot"
                width={52}
                height={52}
                className="headshotImg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="headshotDot" aria-hidden />
            </div>

            <div className="panelTitle">ABOUT</div>
          </div>

          <div className={`panelCta ${hovered ? "isHovered" : ""}`}>
            Click to open About →
          </div>
        </div>

        <div className="panelLead">A quick snapshot of who I am and how I build.</div>

        <div className="spacer22" />

        <div className="aboutGrid">
          <div className="aboutCard">
            <div className="cardTitle">ZACKERY BEYER</div>
            <div className="cardTagline">
              CS @ Mizzou • software + systems • building useful, fun stuff
            </div>
            <div className="cardBody">
              I love problem solving and building fun stuff with code. I’m aiming to become
              a software engineer post graduation, with a focus on systems and embedded-adjacent work.
            </div>
          </div>

          <div className="statGrid">
            {[
              { k: "FOCUS", v: "SWE + Systems" },
              { k: "BEST", v: "C/C++ • Python • TS" },
              { k: "STYLE", v: "Creative + Intentional" },
            ].map((item) => (
              <div key={item.k} className="statCard">
                <div className="statKey">{item.k}</div>
                <div className="statVal">{item.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="spacer26" />

        <div className="sectionH2">HOW I BUILD</div>
        <div className="sectionBody">
          I love constantly learning and trying new things to find what works. I thrive on
          problem solving and love seeing the final product come to fruition.
        </div>

        <div className="pillRow">
          {["Always Learning", "Coachable", "Efficient", "Collaborative", "Fun"].map((t) => (
            <div key={t} className="pill">
              {t}
            </div>
          ))}
        </div>

        <div className="spacer26" />

        <div className="sectionH2">RIGHT NOW</div>
        <div className="sectionBody">
          Building this interactive portfolio experience, working on personal projects, and
          leveling up in systems + embedded-adjacent work.
        </div>

        <div className="panelTip">
          Tip: click anywhere on this panel to open the full About page
        </div>

        <BottomChecker label="END OF ABOUT" />
      </div>

      <div className="pageBottomPad" />
    </>
  );
}