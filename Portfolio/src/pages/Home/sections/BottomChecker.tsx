import React from "react";
import "../bottomChecker.css";

export default function BottomChecker({ label }: { label: string }) {
  return (
    <div className="bottomChecker">
      <div className="bottomCheckerLabel">{label}</div>

      <div className="bottomCheckerGrid" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className={`bottomCheckerCell ${i % 2 === 0 ? "isBright" : "isDim"}`}
          />
        ))}
      </div>

      <div className="bottomCheckerHint">Next Section ↓</div>
    </div>
  );
}