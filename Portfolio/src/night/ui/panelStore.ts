import { useSyncExternalStore } from "react";

/**
 * Which detail panel (the "zoomed-in page" behind an object's second click) is open.
 * Kept free of three.js so the HTML shell owns it; the URL hash mirrors it (#work, #projects…)
 * so panels are deep-linkable.
 */
export type PanelId = "work" | "projects" | "homelab" | "about";

export const PANEL_IDS: readonly PanelId[] = ["work", "projects", "homelab", "about"];

export const isPanelId = (s: string): s is PanelId => (PANEL_IDS as readonly string[]).includes(s);

let current: PanelId | null = null;
const listeners = new Set<() => void>();

function syncHash(id: PanelId | null) {
  try {
    const url = id ? `#${id}` : window.location.pathname + window.location.search;
    if ((id ? `#${id}` : "") !== window.location.hash) window.history.replaceState(window.history.state, "", url);
  } catch {
    // history can throw in sandboxed frames; the panel still works without the hash
  }
}

export function openPanel(id: PanelId) {
  if (current === id) return;
  current = id;
  syncHash(id);
  listeners.forEach((l) => l());
}

export function closePanel() {
  if (!current) return;
  current = null;
  syncHash(null);
  listeners.forEach((l) => l());
}

export function getPanel() {
  return current;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function usePanel() {
  return useSyncExternalStore(subscribe, getPanel, () => null);
}
