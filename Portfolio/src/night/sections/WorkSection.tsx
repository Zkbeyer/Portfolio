import { experience, person, type Experience } from "../../content/site";

/**
 * Track 01 — work, as boarding passes (the model plane's panel). "Next stop" first, then each role
 * with every highlight from the resume. Route stubs use the real locations; the barcode is decoration.
 */
export function WorkSection() {
  return (
    <div className="ns-work">
      <NextStop />
      {experience.map((job) => (
        <Pass key={job.id} job={job} />
      ))}
    </div>
  );
}

function NextStop() {
  return (
    <article className="ns-pass ns-pass--next" aria-labelledby="pass-next">
      <div className="ns-pass__main">
        <p className="ns-pass__band">
          <span>Boarding pass</span>
          <span className="ns-pass__status">Next stop · {person.next.when}</span>
        </p>
        <h3 id="pass-next" className="ns-pass__route">
          <span>Mizzou</span>
          <Plane />
          <span>{person.next.org}</span>
        </h3>
        <dl className="ns-pass__fields">
          <Field label="Passenger" value={person.name} />
          <Field label="Role" value={person.next.role} />
          <Field label="Graduates" value={person.education.graduation} />
          <Field label="Starts" value={person.next.when} />
        </dl>
      </div>
      <Stub code={person.next.when} label="Full time" />
    </article>
  );
}

function Pass({ job }: { job: Experience }) {
  const returnOffer = /return offer/i.test(job.summary);
  return (
    <article className="ns-pass" aria-labelledby={`pass-${job.id}`}>
      <div className="ns-pass__main">
        <p className="ns-pass__band">
          <span>{job.period}</span>
          {returnOffer && <span className="ns-pass__status">Return offer</span>}
        </p>
        <h3 id={`pass-${job.id}`} className="ns-pass__org">
          {job.org}
        </h3>
        <p className="ns-pass__role">
          {job.role}
          {job.team && <span> · {job.team}</span>}
        </p>
        <dl className="ns-pass__fields">
          <Field label="From" value={person.location} />
          <Field label="To" value={job.location} />
          <Field label="When" value={job.period} />
        </dl>
        <p className="ns-pass__summary">{job.summary}</p>
        <ul className="ns-pass__list">
          {job.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
      <Stub code={job.org.split(" ")[0]} label={job.role.split(" ").pop() ?? ""} />
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/** Bar widths for a decorative barcode, seeded from the text so it's stable. */
function barcode(code: string, n = 28) {
  const out: number[] = [];
  let seed = [...code].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  for (let i = 0; i < n; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    out.push(1 + (seed % 3));
  }
  return out;
}

/** Tear-off stub: big code + a decorative barcode. */
function Stub({ code, label }: { code: string; label: string }) {
  const bars = barcode(code);
  return (
    <div className="ns-pass__stub" aria-hidden="true">
      <span className="ns-pass__stub-label">{label}</span>
      <span className="ns-pass__stub-code">{code}</span>
      <span className="ns-pass__barcode">
        {bars.map((w, i) => (
          <i key={i} style={{ width: w }} />
        ))}
      </span>
    </div>
  );
}

function Plane() {
  return (
    <svg className="ns-pass__plane" viewBox="0 0 24 24" aria-label="to" role="img">
      <path
        fill="currentColor"
        d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"
        transform="rotate(90 12 12)"
      />
    </svg>
  );
}
