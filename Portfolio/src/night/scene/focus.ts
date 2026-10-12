import { useSyncExternalStore } from "react";
import { ANCHORS, WINDOW_CENTER, type Vec3 } from "./layout";
import { prefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export type FocusId = "monitor" | "pi" | "plane" | "telescope" | "notebook" | "cassette";

export type CameraShot = { position: Vec3; target: Vec3 };

/** Default framing: facing the desk and window, like the mockup. */
export const BASE_SHOT: CameraShot = { position: [0, 1.45, 2.6], target: [0.15, 1.3, -1.6] };

/** Close-up for each interactive object; `section` is the HTML section it scrolls to. */
export const SHOTS: Record<FocusId, CameraShot & { section?: string }> = {
  monitor: { position: [-0.22, 1.28, 0.5], target: ANCHORS.monitorsCenter, section: "projects" },
  pi: { position: [-0.95, 1.95, -0.25], target: ANCHORS.pi, section: "homelab" },
  plane: { position: [1.1, 1.75, 0.7], target: [WINDOW_CENTER[0] + 0.2, WINDOW_CENTER[1] + 0.1, -3], section: "work" },
  telescope: { position: [1.7, 1.3, 0.55], target: [ANCHORS.telescope[0], 1.0, ANCHORS.telescope[2]], section: "about" },
  notebook: { position: [1.25, 1.55, 0.15], target: ANCHORS.notebook },
  cassette: { position: [1.8, 1.3, 0.2], target: ANCHORS.cassette },
};

let current: FocusId | null = null;
const listeners = new Set<() => void>();
let scrollTimer: number | undefined;

function emit() {
  listeners.forEach((l) => l());
}

export function getFocus() {
  return current;
}

/**
 * Ease the camera to an object. With `scroll`, follow up by scrolling to its section
 * (immediately when the user prefers reduced motion).
 */
export function focusOn(id: FocusId | null, opts: { scroll?: boolean } = {}) {
  current = id;
  emit();
  window.clearTimeout(scrollTimer);
  const section = id ? SHOTS[id].section : undefined;
  if (!opts.scroll || !section) return;
  const reduced = prefersReducedMotion();
  scrollTimer = window.setTimeout(() => {
    document.getElementById(section)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, reduced ? 0 : 650);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useFocus() {
  return useSyncExternalStore(subscribe, getFocus, () => null);
}
