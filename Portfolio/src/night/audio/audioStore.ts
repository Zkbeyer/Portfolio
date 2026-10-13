import { useSyncExternalStore } from "react";

/**
 * Whether the lofi + rain audio is on. The turntable and the hidden nav toggle it; `engine.ts`
 * subscribes and does the playback. Off by default; the last choice is remembered (see `engine.ts`
 * for how a remembered "on" waits for the visitor's first click/keypress before it starts).
 */
const PREF_KEY = "night:audio";

let playing = false;
const listeners = new Set<() => void>();

export function isAudioPlaying() {
  return playing;
}

export function setAudioPlaying(next: boolean) {
  if (next === playing) return;
  playing = next;
  writePref(next);
  listeners.forEach((l) => l());
}

export function toggleAudio() {
  setAudioPlaying(!playing);
}

export function subscribeAudio(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useAudioPlaying() {
  return useSyncExternalStore(subscribeAudio, isAudioPlaying, () => false);
}

/** The remembered choice from a previous visit (storage can be missing or throw: then "off"). */
export function readAudioPref(): boolean {
  try {
    return window.localStorage.getItem(PREF_KEY) === "on";
  } catch {
    return false;
  }
}

function writePref(on: boolean) {
  try {
    window.localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    // private mode / blocked storage: the choice just isn't remembered
  }
}
