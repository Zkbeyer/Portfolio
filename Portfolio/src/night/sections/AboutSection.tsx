import { person } from "../../content/site";
import { Tags } from "./Tags";

/**
 * Track 04 — about (the telescope's panel): polaroid, a short first-person intro, education, interests
 * and contact. Facts only from `content/site.ts`.
 */
export function AboutSection() {
  const { education: ed } = person;
  const first = person.shortName.split(" ")[0];
  return (
    <div className="ns-about">
      <figure className="ns-about__polaroid">
        <img className="ns-about__photo" src={person.photo.src} alt={person.photo.alt} width={800} height={1000} decoding="async" />
        <figcaption className="hand">{first} · Mizzou CS ’{ed.graduation.slice(-2)}</figcaption>
      </figure>
      <div className="ns-prose">
        <p className="ns-lede">
          I’m {first}, a {person.focus.toLowerCase()} engineer finishing computer science at Mizzou.
          I’m joining {person.next.org} in {person.next.when} as a {person.next.role.split(",")[0].toLowerCase()} on aviation databases.
        </p>
        <h3>Education</h3>
        <dl className="ns-facts">
          <dt>School</dt>
          <dd>{ed.school}</dd>
          <dt>Degree</dt>
          <dd>{ed.degree}</dd>
          <dt>Certificate</dt>
          <dd>{ed.certificate}</dd>
          <dt>GPA</dt>
          <dd>{ed.gpa}</dd>
          <dt>Graduating</dt>
          <dd>{ed.graduation}</dd>
        </dl>
        <h3>Off the clock</h3>
        <Tags items={person.interests} label="Interests" />
        <h3>Say hi</h3>
        <p className="ns-links">
          <a href={`mailto:${person.email}`}>{person.email}</a>
          <a href={person.links.github} target="_blank" rel="noopener">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a href={person.links.linkedin} target="_blank" rel="noopener">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
          <a href={person.links.resume} target="_blank" rel="noopener">
            Resume (PDF) <span aria-hidden="true">↗</span>
          </a>
        </p>
      </div>
    </div>
  );
}
