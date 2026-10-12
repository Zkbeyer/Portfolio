import { useSyncExternalStore } from "react";

/**
 * Whether the lofi + rain audio is on. P4 wires the cassette and the hidden nav to this store;
 * the P5 audio engine subscribes to it and does the actual playback. Off by default.
 */
let playing = false;
const listeners = new Set<() => void>();

export function isAudioPlaying() {
  return playing;
}

export function setAudioPlaying(next: boolean) {
  if (next === playing) return;
  playing = next;
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
