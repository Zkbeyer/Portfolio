import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/** Scene time used when the user prefers reduced motion: everything holds a single, pleasant frame. */
export const FROZEN_TIME = 14;

/**
 * Seconds of animation time for shaders and ambient motion. Advances with the frame clock
 * (clamped so a backgrounded tab doesn't jump), and freezes at FROZEN_TIME under reduced motion.
 * Call it before the component's own useFrame so the value is fresh for that frame.
 */
export function useSceneTime() {
  const reduced = usePrefersReducedMotion();
  const t = useRef(0);
  useFrame((_, delta) => {
    t.current = reduced ? FROZEN_TIME : t.current + Math.min(delta, 0.1);
  });
  return t;
}
