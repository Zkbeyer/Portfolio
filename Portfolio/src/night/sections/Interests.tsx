import { interests } from "../../content/site";

/** "Off the clock" in the About panel: every interest, grouped. */
export function Interests() {
  return (
    <div className="ns-interests">
      <dl className="ns-interests__groups">
        {interests.map((g) => (
          <div key={g.id} className="ns-interests__group">
            <dt>{g.label}</dt>
            <dd>
              <ul>
                {g.items.map((it) => (
                  <li key={it.name}>
                    {it.name}
                    {it.note ? (
                      <span className="ns-interests__note"> · {it.note}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
