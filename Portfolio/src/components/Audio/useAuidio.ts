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
    const unlock = async () => {
      if (unlocked) return;
      setUnlocked(true);

      // Try a tiny play/pause to satisfy autoplay policies
      try {
        const music = musicRef.current;
        if (music && !muted) {
          await music.play();
          music.pause();
          music.currentTime = 0;
        }
      } catch {
        // If it fails, that's okay — next gesture will usually succeed.
      }
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock as any);
      window.removeEventListener("keydown", unlock as any);
    };
  }, [unlocked, muted]);

  const playWhoosh = useCallback(() => {
    if (muted || !unlocked) return;
    const a = whooshRef.current;
    if (!a) return;

    try {
      a.currentTime = 0; // restart so rapid scroll still plays
      a.volume = whooshVolume;
      void a.play();
    } catch {
      // ignore
    }
  }, [muted, unlocked, whooshVolume]);

  const startMusic = useCallback(async () => {
    if (muted || !unlocked) return;
    const m = musicRef.current;
    if (!m) return;
    try {
      await m.play();
    } catch {
      // ignore
    }
  }, [muted, unlocked]);

  const stopMusic = useCallback(() => {
    const m = musicRef.current;
    if (!m) return;
    m.pause();
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  // keep music state in sync with mute
  useEffect(() => {
    const m = musicRef.current;
    if (!m) return;

    if (muted) {
      m.pause();
    } else {
      // attempt play (will work after unlocked)
      if (unlocked) void m.play();
    }
  }, [muted, unlocked]);

  return { muted, toggleMute, playWhoosh, startMusic, stopMusic, unlocked };
}