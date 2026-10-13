import { useEffect, useRef } from "react";
import { focusOn } from "../scene/focus";
import { HOTSPOTS, activateHotspot, goToPanel, openFocused, type HotspotId } from "../scene/hotspots";
import { useAudioPlaying } from "../audio/audioStore";

/** Reading order for the sheet; what each object is, in plain words. */
const ITEMS: { id: HotspotId; title: string; what: string }[] = [
  { id: "plane", title: "Work", what: "The model plane" },
  { id: "monitor", title: "Projects", what: "The monitors" },
  { id: "pi", title: "Homelab", what: "The Pi on the shelf" },
  { id: "telescope", title: "About", what: "The telescope" },
  { id: "notebook", title: "Resume", what: "The notebook" },
  { id: "cassette", title: "Rain + lo-fi", what: "The turntable" },
];

/**
 * Phones (≤760px): there's no hover and the section links are tucked away, so a "Look around" button
 * opens this bottom sheet listing the objects in the room. Picking one does what a first tap on it does
 * (camera moves in; the subtitles then offer Open ↗), or toggles sound for the turntable. Without the 3D
 * room (`still`), items go straight to their panel / the PDF.
 */
export function RoomSheet({ open, onClose, still = false }: { open: boolean; onClose: () => void; still?: boolean }) {
  const sheet = useRef<HTMLDivElement>(null);
  const playing = useAudioPlaying();

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    sheet.current?.querySelector("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      opener?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) return null;

  const pick = (id: HotspotId) => {
    onClose();
    const panel = HOTSPOTS[id].panel;
    if (id === "cassette") activateHotspot(id);
    else if (!still) focusOn(id);
    else if (panel) goToPanel(panel);
    else openFocused(id);
  };

  return (
    <div className="night-sheet" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={sheet} className="night-sheet__panel" role="dialog" aria-modal="true" aria-label="Things in the room">
        <div className="night-sheet__grip" aria-hidden="true" />
        <p className="night-sheet__title">Look around the room</p>
        <ul>
          {ITEMS.map((it) => (
            <li key={it.id}>
              <button type="button" onClick={() => pick(it.id)}>
                <span className="night-sheet__item">{it.title}</span>
                <span className="night-sheet__what">
                  {it.id === "cassette" ? (playing ? "On — tap to stop" : "Off — tap to play") : it.what}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="night-sheet__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
