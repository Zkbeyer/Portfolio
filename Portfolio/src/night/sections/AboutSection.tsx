import { person } from "../../content/site";

/**
 * Track 04 — about. Interim body (P4.7 shared plumbing): photo, education, interests and contact,
 * facts only from `content/site.ts`. The telescope item gives it the polaroid treatment.
 */
export function AboutSection() {
  const { education: ed } = person;
  return (
    <div className="ns-about">
      <img className="ns-about__photo" src={person.photo.src} alt={person.photo.alt} width={800} height={1000} decoding="async" />
      <div className="ns-prose">
        <p className="ns-lede">
          I’m {person.shortName.split(" ")[0]}, a {person.focus.toLowerCase()} engineer finishing computer science at
          Mizzou, then joining {person.next.org} in {person.next.when}.
        </p>
        <h3>Education</h3>
        <p>
          {ed.school} · {ed.degree} · {ed.certificate} certificate · GPA {ed.gpa} · {ed.graduation}
        </p>
        <h3>Off the clock</h3>
        <p>{person.interests.join(", ").replace(/^./, (c) => c.toUpperCase())}.</p>
        <h3>Say hi</h3>
        <p className="ns-links">
          <a href={`mailto:${person.email}`}>{person.email}</a>
          <a href={person.links.github} target="_blank" rel="noopener">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a href={person.links.linkedin} target="_blank" rel="noopener">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </p>
      </div>
    </div>
  );
}
