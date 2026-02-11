import React, { useState } from "react";
import BottomChecker from "./BottomChecker";
import "../sections.css";

export default function PageContact() {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <div className="sectionKicker sectionKickerContact">About ↑</div>

      <div
        className={`sectionPanel ${hovered ? "isHovered" : ""}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Contact section"
      >
        <div className="panelHeaderRow">
          <div className="panelTitle">CONTACT</div>
        </div>

        <div className="panelLead">
          Lets connect! I’m always open to chatting about new opportunities, collaborations, or just random tech talk.
        </div>

        <div className="spacer22" />

        <div className="contactCard">
          <div className="sectionH2">LINKS</div>
          <div className="mutedLine">Click to open.</div>

          <div className="linkGrid">
            <a
              href="https://github.com/Zkbeyer"
              target="_blank"
              rel="noreferrer"
              className={`linkButton ${hovered ? "isHovered" : ""}`}
            >
              <span>GitHub</span>
              <span className="linkSub">github.com/Zkbeyer →</span>
            </a>

            <a
              href="https://www.linkedin.com/in/zackery-beyer/"
              target="_blank"
              rel="noreferrer"
              className={`linkButton ${hovered ? "isHovered" : ""}`}
            >
              <span>LinkedIn</span>
              <span className="linkSub">linkedin.com/in/zackery-beyer →</span>
            </a>

            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              title="Place your resume at public/resume.pdf"
              className={`linkButton ${hovered ? "isHovered" : ""}`}
            >
              <span>Resume</span>
              <span className="linkSub">open PDF →</span>
            </a>
          </div>
        </div>

        <div className="spacer16" />

        <BottomChecker label="END OF CONTACT" />
      </div>

      <div className="pageBottomPad" />
    </>
  );
}