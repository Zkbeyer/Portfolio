import { useSyncExternalStore } from "react";

/**
 * Room lights (no three.js here, so the HTML shell can use it):
 * - `on`: the light switch — click a lamp, press L, or the Lights button in the nav. Lights off leaves
 *   the screens, accent lamps and the window; turning them back on is always one click/key away.
 * - `intro`: the lamps flicker on once the 3D room is ready ("waiting" while it loads — the dark room
 *   doubles as the loading screen).
 */
let on = true;
const listeners = new Set<() => void>();

export function isLightsOn() {
  return on;
}
export function setLightsOn(next: boolean) {
  if (next === on) return;
  on = next;
  listeners.forEach((l) => l());
}
export function toggleLights() {
  setLightsOn(!on);
}
export function subscribeLights(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
export function useLightsOn() {
  return useSyncExternalStore(subscribeLights, isLightsOn, () => true);
}

export type IntroState = "waiting" | "running" | "done";
let intro: IntroState = "waiting";
const introListeners = new Set<() => void>();
export function setIntroState(next: IntroState) {
  if (next === intro) return;
  intro = next;
  introListeners.forEach((l) => l());
}
export function useIntroState() {
  return useSyncExternalStore(
    (cb) => {
      introListeners.add(cb);
      return () => introListeners.delete(cb);
    },
    () => intro,
    () => "waiting" as IntroState,
  );
}
