/** Stack tags in mono (shared by every panel). */
export function Tags({ items, label = "Stack" }: { items: readonly string[]; label?: string }) {
  return (
    <ul className="ns-tags" aria-label={label}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}
