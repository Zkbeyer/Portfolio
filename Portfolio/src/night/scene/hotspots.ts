import { useSyncExternalStore } from "react";
import { person, projects } from "../../content/site";
import { toggleAudio } from "../audio/audioStore";
import { focusOn, getFocus, useFocus, type FocusId } from "./focus";
import { numberWord } from "../ui/copy";

/**
 * Every clickable object in the room, shared by the 3D hotspots (scene/Hotspot.tsx), the subtitles
 * and the accessible nav. Kept free of three.js so the HTML shell can import it without the 3D chunk.
 */
export type HotspotId = FocusId;

export type HotspotInfo = {
  id: HotspotId;
  /** Handwritten label next to the object (lowercase, like the mockup). */
  label: string;
  /** Subtitle line shown while the object is hovered or focused. */
  hint: string;
  /** Optional different line once the camera has moved in (focused). */
  focusHint?: string;
  /** Optional different handwritten label while focused. */
  focusLabel?: string;
  /** In-page section the object leads to, if any. */
  section?: string;
};

export const HOTSPOTS: Record<HotspotId, HotspotInfo> = {
  monitor: {
    id: "monitor",
    label: "projects",
    hint: `On the monitor: ${numberWord(projects.length)} projects, queued up like a playlist.`,
    section: "projects",
  },
  pi: {
    id: "pi",
    label: "homelab",
    hint: "The little red box on the shelf runs my homelab.",
    section: "homelab",
  },
  plane: {
    id: "plane",
    label: "work",
    hint: `The model plane: where I’ve worked, and ${person.next.org} next.`,
    section: "work",
  },
  telescope: {
    id: "telescope",
    label: "about",
    hint: "Look through the telescope for a little about me.",
    section: "about",
  },
  notebook: {
    id: "notebook",
    label: "resume",
    hint: "My resume is open in the notebook.",
    focusHint: "Click the page to open the PDF.",
    focusLabel: "open the pdf ↗",
  },
  cassette: {
    id: "cassette",
    label: "lofi",
    hint: "Press play for rain and lo-fi.",
  },
};

/** What a click (or tap) on an object does. Must run inside the user gesture (window.open, audio unlock). */
export function activateHotspot(id: HotspotId) {
  switch (id) {
    case "notebook":
      // first click moves in to read the pages; clicking the open notebook opens the PDF
      if (getFocus() === "notebook") window.open(person.links.resume, "_blank", "noopener");
      else focusOn("notebook");
      return;
    case "cassette":
      toggleAudio();
      return;
    default:
      focusOn(id, { scroll: true });
  }
}

// ── hover store (which object the pointer is over) ─────────────────────────────
let hovered: HotspotId | null = null;
const listeners = new Set<() => void>();

export function setHovered(id: HotspotId | null) {
  if (id === hovered) return;
  hovered = id;
  if (typeof document !== "undefined") document.body.style.cursor = id ? "pointer" : "";
  listeners.forEach((l) => l());
}

/** Clear hover only if `id` is still the hovered object (pointer-out can arrive after the next pointer-over). */
export function clearHovered(id: HotspotId) {
  if (hovered === id) setHovered(null);
}

export function getHovered() {
  return hovered;
}

export function subscribeHovered(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useHovered() {
  return useSyncExternalStore(subscribeHovered, getHovered, () => null);
}

/** Is this object hovered or the current camera focus? Props use it for their `active` animation. */
export function useHotspotActive(id: HotspotId) {
  const h = useHovered();
  const focus = useFocus();
  return h === id || focus === id;
}
