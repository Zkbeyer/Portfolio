import { useSyncExternalStore } from "react";
import { projects } from "../../content/site";

/**
 * Which project is highlighted on the monitor playlist. Shared by the in-room screen (hover / arrow
 * keys) and the Projects panel, which opens on the highlighted track.
 */
let cursor = 0;
const listeners = new Set<() => void>();

export function setProjectCursor(i: number) {
  const next = ((i % projects.length) + projects.length) % projects.length;
  if (next === cursor) return;
  cursor = next;
  listeners.forEach((l) => l());
}

export const moveProjectCursor = (d: number) => setProjectCursor(cursor + d);

export function getProjectCursor() {
  return cursor;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useProjectCursor() {
  return useSyncExternalStore(subscribe, getProjectCursor, () => 0);
}

export const STATUS_LABEL: Record<string, string> = {
  running: "Running",
  live: "Live",
  active: "Active",
  "in-progress": "In progress",
  "in-development": "In development",
  demo: "Demo",
};
