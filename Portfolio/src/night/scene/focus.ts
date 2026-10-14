import { useSyncExternalStore } from "react";
import { ANCHORS, type Vec3 } from "./layout";

export type FocusId = "monitor" | "pi" | "plane" | "telescope" | "notebook" | "cassette";

export type CameraShot = { position: Vec3; target: Vec3 };

/** Default framing: facing the desk and window, like the mockup. */
export const BASE_SHOT: CameraShot = { position: [0.05, 1.42, 3.2], target: [0.05, 1.22, -1.6] }; // pulled back for the round-3 layout

/** Close-up for each interactive object (the "look closer" step; a second click opens its detail panel). */
export const SHOTS: Record<FocusId, CameraShot> = {
  monitor: { position: [-0.3, 1.2, -0.15], target: [-0.3, 1.17, -1.34] }, // close enough to read the playlist
  pi: { position: [-1.4, 2.0, -1.0], target: [-1.4, 1.95, -1.42] }, // the Pi, its status display and the sticky note
  plane: { position: [1.74, 1.2, -0.88], target: [1.77, 1.1, -1.52] }, // plane + boarding pass on the sill
  telescope: { position: [2.22, 1.3, -0.42], target: [2.52, 1.1, -1.0] }, // telescope close-up
  notebook: { position: [0.2, 1.28, -0.58], target: ANCHORS.notebook }, // close enough to read the resume
  cassette: { position: [1.35, 1.25, 0.1], target: ANCHORS.cassette },
};

let current: FocusId | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getFocus() {
  return current;
}

/** Ease the camera to an object's close-up (or back to the base shot with `null`). No page scroll. */
export function focusOn(id: FocusId | null) {
  if (current === id) return;
  current = id;
  emit();
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
