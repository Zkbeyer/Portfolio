import { useSyncExternalStore } from "react";
import { person, projects } from "../../content/site";
import { toggleAudio } from "../audio/audioStore";
import { focusOn, getFocus, useFocus, type FocusId } from "./focus";
import { numberWord } from "../ui/copy";
import { openPanel, type PanelId } from "../ui/panelStore";

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
  /** Touch-screen version of `focusHint` (no hover, no arrow keys). */
  touchHint?: string;
  /** Optional different handwritten label while focused. */
  focusLabel?: string;
  /** Detail panel the second click (or the Open button) opens, if any. */
  panel?: PanelId;
  /** Text for the visible "Open" button while focused. */
  openLabel?: string;
};

export const HOTSPOTS: Record<HotspotId, HotspotInfo> = {
  monitor: {
    id: "monitor",
    label: "projects",
    hint: `On the monitor: ${numberWord(projects.length)} projects, queued up like a playlist.`,
    focusHint: "Pick a track (hover or ↑ ↓), then click it to open.",
    touchHint: "Tap a track on the screen, or Open projects.",
    focusLabel: "open projects ↗",
    panel: "projects",
    openLabel: "Open projects",
  },
  pi: {
    id: "pi",
    label: "homelab",
    hint: "The little red box on the shelf runs my homelab.",
    focusHint: "Click the Pi again to open the homelab.",
    focusLabel: "open homelab ↗",
    panel: "homelab",
    openLabel: "Open homelab",
  },
  plane: {
    id: "plane",
    label: "work",
    hint: `The model plane: where I’ve worked, and ${person.next.org} next.`,
    focusHint: `Boarding pass: Mizzou to ${person.next.org}, ${person.next.when}. Click again for the whole trip.`,
    focusLabel: "open work ↗",
    panel: "work",
    openLabel: "Open work",
  },
  telescope: {
    id: "telescope",
    label: "about",
    hint: "The telescope: a little about me.",
    focusHint: "A few stickers about me. Click the telescope again to read more.",
    focusLabel: "open about ↗",
    panel: "about",
    openLabel: "Open about",
  },
  notebook: {
    id: "notebook",
    label: "resume",
    hint: "My resume is open in the notebook.",
    focusHint: "Click the page to open the PDF.",
    focusLabel: "open the pdf ↗",
    openLabel: "Open the PDF",
  },
  cassette: {
    id: "cassette",
    label: "lofi",
    hint: "Press play for rain and a shuffled lo-fi playlist.",
  },
};

/**
 * What a click (or tap) on an object does. Two steps for every object (Round 6): the first click looks
 * closer (camera focus, the object shows its content in the room); a click on the focused object opens
 * the zoomed-in page — the detail panel, or the PDF for the notebook. Must run inside the user gesture
 * (window.open, audio unlock).
 */
export function activateHotspot(id: HotspotId) {
  if (id === "cassette") {
    toggleAudio();
    return;
  }
  if (getFocus() === id) openFocused(id);
  else focusOn(id);
}

/** The second step for a focused object: its panel, or the resume PDF for the notebook. */
export function openFocused(id: HotspotId) {
  if (id === "notebook") {
    window.open(person.links.resume, "_blank", "noopener");
    return;
  }
  const panel = HOTSPOTS[id].panel;
  if (panel) openPanel(panel);
}

/** The object that leads to a panel (nav links and #hash deep links focus it behind the panel). */
export function hotspotForPanel(panel: PanelId): HotspotId {
  return (Object.keys(HOTSPOTS) as HotspotId[]).find((id) => HOTSPOTS[id].panel === panel) ?? "notebook";
}

/** Jump straight to a panel (nav link, deep link): focus its object in the room, then open the panel. */
export function goToPanel(panel: PanelId) {
  focusOn(hotspotForPanel(panel));
  openPanel(panel);
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
