import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type AmbienceKey = "HOME" | "PROJECTS" | "ABOUT";

type Options = {
  whooshUrl?: string;
  whooshVolume?: number;
  musicVolume?: number; // ambience volume
  ambience?: Record<AmbienceKey, string>;
};

type AudioApi = {
  enabled: boolean;         // user has enabled audio at least once (persisted)
  muted: boolean;           // shared across pages (persisted)
  enableAudio: () => Promise<void>;
  toggleMute: () => void;
  setAmbience: (key: AmbienceKey) => void;
  playWhoosh: () => void;
};

const LS_ENABLED = "audio:enabled";
const LS_MUTED = "audio:muted";
const LS_SCENE = "audio:scene";

const DEFAULT_AMBIENCE: Record<AmbienceKey, string> = {
  HOME: `${import.meta.env.BASE_URL}/audio/home-ambient.mp3`,
  PROJECTS: `${import.meta.env.BASE_URL}/audio/projects-ambient.mp3`,
  ABOUT: `${import.meta.env.BASE_URL}/audio/about-ambient.mp3`,
};

// Module-level singleton (shared across the whole app)
let singleton: {
  ambienceEl: HTMLAudioElement | null;
  whooshEl: HTMLAudioElement | null;
  initDone: boolean;
} = {
  ambienceEl: null,
  whooshEl: null,
  initDone: false,
};

function ensureAudioEls() {
  if (!singleton.ambienceEl) {
    const a = new Audio();
    a.loop = true;
    a.preload = "auto";
    a.volume = 0.14;
    singleton.ambienceEl = a;
  }
  if (!singleton.whooshEl) {
    const w = new Audio();
    w.preload = "auto";
    w.volume = 0.08;
    singleton.whooshEl = w;
  }
}

export function useAudio(opts?: Options): AudioApi {
  const whooshUrl = opts?.whooshUrl ?? "/audio/whoosh.mp3";
  const whooshVolume = opts?.whooshVolume ?? 0.08;
  const musicVolume = opts?.musicVolume ?? 0.14;
  const ambienceMap = opts?.ambience ?? DEFAULT_AMBIENCE;

  const [enabled, setEnabled] = useState(() => localStorage.getItem(LS_ENABLED) === "1");
  const [muted, setMuted] = useState(() => localStorage.getItem(LS_MUTED) === "1");
  const [scene, setScene] = useState<AmbienceKey>(() => (localStorage.getItem(LS_SCENE) as AmbienceKey) || "HOME");

  const sceneRef = useRef<AmbienceKey>(scene);
  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  // init once
  useEffect(() => {
    ensureAudioEls();

    const a = singleton.ambienceEl!;
    const w = singleton.whooshEl!;

    // Only set URLs once to avoid thrashing
    if (!singleton.initDone) {
      w.src = whooshUrl;
      singleton.initDone = true;
    }

    a.muted = muted;
    a.volume = musicVolume;
    w.volume = whooshVolume;

    // apply current scene src
    const desired = ambienceMap[sceneRef.current] ?? ambienceMap.HOME;
    if (!a.src.endsWith(desired)) {
      a.src = desired;
      a.load();
    }

    // try resume if already enabled
    if (enabled && !muted) {
      void a.play().catch(() => {});
    }
  }, [whooshUrl, whooshVolume, musicVolume, ambienceMap, enabled, muted]);

  useEffect(() => {
    localStorage.setItem(LS_ENABLED, enabled ? "1" : "0");
  }, [enabled]);

  useEffect(() => {
    localStorage.setItem(LS_MUTED, muted ? "1" : "0");
    ensureAudioEls();
    if (singleton.ambienceEl) singleton.ambienceEl.muted = muted;
  }, [muted]);

  useEffect(() => {
    localStorage.setItem(LS_SCENE, scene);
  }, [scene]);

  const enableAudio = useCallback(async () => {
    ensureAudioEls();
    const a = singleton.ambienceEl!;
    a.muted = muted;
    a.volume = musicVolume;

    // ensure correct ambience is loaded
    const desired = ambienceMap[sceneRef.current] ?? ambienceMap.HOME;
    if (!a.src.endsWith(desired)) {
      a.src = desired;
      a.load();
    }

    setEnabled(true);

    try {
      if (!muted) await a.play();
    } catch {
      // If browser blocks for some reason, user can click again
    }
  }, [ambienceMap, muted, musicVolume]);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const setAmbience = useCallback(
    (key: AmbienceKey) => {
      ensureAudioEls();
      const a = singleton.ambienceEl!;
      const next = ambienceMap[key] ?? ambienceMap.HOME;

      setScene(key);

      if (!a.src.endsWith(next)) {
        a.src = next;
        a.load();
      }

      if (enabled && !muted) {
        void a.play().catch(() => {});
      }
    },
    [ambienceMap, enabled, muted]
  );

  const playWhoosh = useCallback(() => {
    ensureAudioEls();
    const w = singleton.whooshEl!;
    if (muted) return;

    try {
      w.currentTime = 0;
      void w.play();
    } catch {}
  }, [muted]);

  return useMemo(
    () => ({ enabled, muted, enableAudio, toggleMute, setAmbience, playWhoosh }),
    [enabled, muted, enableAudio, toggleMute, setAmbience, playWhoosh]
  );
}