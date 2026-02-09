import { useCallback, useEffect, useRef, useState } from "react";

type AudioOptions = {
  whooshUrl: string;
  musicUrl: string;
  whooshVolume?: number; // 0..1
  musicVolume?: number;  // 0..1
};

export function useAudio({ whooshUrl, musicUrl, whooshVolume = 0.15, musicVolume = 0.18 }: AudioOptions) {
  const [muted, setMuted] = useState(true);
  const [unlocked, setUnlocked] = useState(false);

  const mutedRef = useRef(true);
  const unlockedRef = useRef(false);

  const whooshRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // create audio elements once
  useEffect(() => {
    const whoosh = new Audio(whooshUrl);
    whoosh.preload = "auto";
    whoosh.volume = whooshVolume;

    const music = new Audio(musicUrl);
    music.preload = "auto";
    music.loop = true;
    music.volume = musicVolume;

    whooshRef.current = whoosh;
    musicRef.current = music;

    return () => {
      whoosh.pause();
      music.pause();
      whooshRef.current = null;
      musicRef.current = null;
    };
  }, [whooshUrl, musicUrl, whooshVolume, musicVolume]);

  // unlock on first user gesture
  useEffect(() => {
    const unlockAudio = async () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      setUnlocked(true);

      // Try a tiny play/pause to satisfy autoplay policies
      try {
        const music = musicRef.current;
        if (music && !mutedRef.current) {
          await music.play();
          music.pause();
          music.currentTime = 0;
        }
      } catch {
        // If it fails, that's okay — next gesture will usually succeed.
      }
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio as any);
      window.removeEventListener("keydown", unlockAudio as any);
    };
  }, []);

  const playWhoosh = useCallback(() => {
    if (mutedRef.current || !unlockedRef.current) return;
    const a = whooshRef.current;
    if (!a) return;

    try {
      a.currentTime = 0; // restart so rapid scroll still plays
      a.volume = whooshVolume;
      void a.play();
    } catch {
      // ignore
    }
  }, [whooshVolume]);

  const startMusic = useCallback(async () => {
    if (mutedRef.current || !unlockedRef.current) return;
    const m = musicRef.current;
    if (!m) return;
    try {
      await m.play();
    } catch {
      // ignore
    }
  }, []);

  const stopMusic = useCallback(() => {
    const m = musicRef.current;
    if (!m) return;
    m.pause();
  }, []);

  const setMute = useCallback((value: boolean) => {
    mutedRef.current = value;
    setMuted(value);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      return next;
    });
  }, []);

  const enableAudio = useCallback(async () => {
    // Must be called inside a user gesture (click/tap/keydown)
    unlockedRef.current = true;
    setUnlocked(true);

    mutedRef.current = false;
    setMuted(false);

    const m = musicRef.current;
    if (!m) return;

    try {
      await m.play();
    } catch {
      // ignore
    }
  }, []);

  // keep music state in sync with mute
  useEffect(() => {
    // keep refs in sync with state (in case state changes elsewhere)
    mutedRef.current = muted;
    unlockedRef.current = unlocked;

    const m = musicRef.current;
    if (!m) return;

    if (muted) {
      m.pause();
    } else {
      if (unlocked) void m.play();
    }
  }, [muted, unlocked]);

  return { muted, toggleMute, setMute, playWhoosh, startMusic, stopMusic, enableAudio, unlocked };
}