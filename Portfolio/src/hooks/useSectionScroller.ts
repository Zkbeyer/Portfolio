import { useEffect, useMemo, useRef, useState } from "react";

function wrapIndex(i: number, n: number) {
  return ((i % n) + n) % n;
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

export type TransitionState = {
  active: boolean;
  from: number;
  to: number;
  t: number; // 0..1
};

export default function useSectionScroller({
  numSections,
  onWhoosh,
}: {
  numSections: number;
  onWhoosh?: () => void;
}) {
  const [section, setSection] = useState(0);
  const [transition, setTransition] = useState<TransitionState>({
    active: false,
    from: 0,
    to: 0,
    t: 0,
  });
  const [pageOpacity, setPageOpacity] = useState(1);
  const [uiLocked, setUiLocked] = useState(false);

  const scrollHostRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const transitioningRef = useRef(false);
  const swappedMidRef = useRef(false);
  const wheelBlockUntilRef = useRef(0);

  const TRANSITION_SEC = 0.95;

  useEffect(() => {
    if (!transition.active) return;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      setTransition((prev) => {
        const nextT = prev.t + dt / TRANSITION_SEC;
        if (nextT >= 1) return { ...prev, t: 1 };
        return { ...prev, t: nextT };
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [transition.active]);

  useEffect(() => {
    if (!transition.active) {
      setPageOpacity(1);
      return;
    }
    const t = clamp01(transition.t);
    setPageOpacity(1 - Math.sin(Math.PI * t));
  }, [transition.active, transition.t]);

  useEffect(() => {
    if (!transition.active) return;
    if (swappedMidRef.current) return;

    if (transition.t >= 0.5) {
      swappedMidRef.current = true;
      setSection(transition.to);
      scrollHostRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [transition.active, transition.t, transition.to]);

  useEffect(() => {
    if (!transition.active) return;
    if (transition.t < 1) return;

    const final = transition.to;
    setTransition({ active: false, from: final, to: final, t: 0 });
    setUiLocked(false);

    wheelBlockUntilRef.current = performance.now() + 450;
    transitioningRef.current = false;
  }, [transition.active, transition.t, transition.to]);

  const startTransitionTo = (to: number) => {
    if (transitioningRef.current) return;
    if (transition.active || uiLocked) return;

    const from = section;
    const next = wrapIndex(to, numSections);

    if (next === from) {
      scrollHostRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      transitioningRef.current = false;
      return;
    }

    transitioningRef.current = true;
    swappedMidRef.current = false;

    setUiLocked(true);
    wheelBlockUntilRef.current = performance.now() + 900;

    onWhoosh?.();
    setTransition({ active: true, from, to: next, t: 0 });
  };

  const goNext = () => startTransitionTo(section + 1);
  const goPrev = () => startTransitionTo(section - 1);

  useEffect(() => {
    const host = scrollHostRef.current;
    const sentinel = sentinelRef.current;
    if (!host || !sentinel) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (transition.active) return;
        for (const e of entries) {
          if (e.isIntersecting) {
            const nearBottom = host.scrollTop + host.clientHeight >= host.scrollHeight - 8;
            if (nearBottom) goNext();
          }
        }
      },
      { root: host, threshold: 0.65 }
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, [section, transition.active]);

  useEffect(() => {
    const host = scrollHostRef.current;
    if (!host) return;

    const onWheel = (e: WheelEvent) => {
      if (transition.active || uiLocked) return;

      const now = performance.now();
      if (now < wheelBlockUntilRef.current) return;

      const max = host.scrollHeight - host.clientHeight;
      if (max <= 0) return;

      const atTop = host.scrollTop <= 1;
      const atBottom = host.scrollTop >= max - 1;

      if (e.deltaY < 0 && atTop) {
        e.preventDefault();
        e.stopPropagation();
        wheelBlockUntilRef.current = performance.now() + 500;
        goPrev();
        return;
      }

      if (e.deltaY > 0 && atBottom) {
        const s = sentinelRef.current;
        if (s) {
          const r = s.getBoundingClientRect();
          if (r.top <= window.innerHeight) {
            e.preventDefault();
            e.stopPropagation();
            wheelBlockUntilRef.current = performance.now() + 500;
            goNext();
          }
        }
      }
    };

    host.addEventListener("wheel", onWheel, { passive: false });
    return () => host.removeEventListener("wheel", onWheel as any);
  }, [section, transition.active, uiLocked]);

  const onSelectSection = (i: number) => {
    wheelBlockUntilRef.current = 0;
    startTransitionTo(i);
  };

  return useMemo(
    () => ({
      section,
      transition,
      pageOpacity,
      uiLocked,
      scrollHostRef,
      sentinelRef,
      onSelectSection,
    }),
    [section, transition, pageOpacity, uiLocked]
  );
}