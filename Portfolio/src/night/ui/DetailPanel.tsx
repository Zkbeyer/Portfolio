import { useEffect, useRef, type ComponentType } from "react";
import { closePanel, usePanel, type PanelId } from "./panelStore";
import { WorkSection } from "../sections/WorkSection";
import { ProjectsSection } from "../sections/ProjectsSection";
import { HomelabSection } from "../sections/HomelabSection";
import { AboutSection } from "../sections/AboutSection";

/** Kicker + title per panel. Track numbers follow the P6 "tracks". */
const PANELS: Record<PanelId, { kicker: string; title: string; Body: ComponentType }> = {
  work: { kicker: "Track 01 · Work", title: "The day job", Body: WorkSection },
  projects: { kicker: "Track 02 · Projects", title: "Projects", Body: ProjectsSection },
  homelab: { kicker: "Track 03 · Homelab", title: "The homelab", Body: HomelabSection },
  about: { kicker: "Track 04 · About", title: "About me", Body: AboutSection },
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The zoomed-in page behind an object's second click: a full-screen dialog over the room.
 * Focus moves in and is trapped; Esc, the Back button or a click on the backdrop closes it and returns
 * to the focused shot in the room (focus goes back to whatever opened it). Deep-linkable via #work etc.
 */
export function DetailPanel() {
  const panel = usePanel();
  if (!panel) return null;
  return <PanelDialog key={panel} id={panel} />;
}

function PanelDialog({ id }: { id: PanelId }) {
  const { kicker, title, Body } = PANELS[id];
  const dialog = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    back.current?.focus({ preventScroll: true });
    document.documentElement.classList.add("night-panel-open");

    // Capture phase on window: runs before the camera rig's Esc handler and stops it (Esc closes the panel only).
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        closePanel();
        return;
      }
      if (e.key !== "Tab" || !dialog.current) return;
      const items = [...dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && dialog.current.contains(active);
      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.documentElement.classList.remove("night-panel-open");
      if (opener && opener !== document.body && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div
      className="night-panel"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closePanel(); // backdrop
      }}
    >
      <div
        ref={dialog}
        className={`night-panel__sheet night-panel__sheet--${id}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`panel-${id}-title`}
      >
        <header className="night-panel__head">
          <button ref={back} type="button" className="night-panel__back" onClick={closePanel}>
            ← Back to the room <kbd>Esc</kbd>
          </button>
          <p className="night-panel__kicker">{kicker}</p>
          <h2 id={`panel-${id}-title`} className="night-panel__title">
            {title}
          </h2>
        </header>
        <div className="night-panel__body">
          <Body />
        </div>
      </div>
    </div>
  );
}
