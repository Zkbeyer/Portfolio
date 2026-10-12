import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { BASE_SHOT, SHOTS, focusOn, getFocus } from "./focus";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const BASE_FOV = 42;
const MAX_FOV = 70;
// Half-width of the room (desk + window) that should stay in frame at the base shot.
const KEEP_HALF_WIDTH = 2.5;
const PARALLAX = { x: 0.18, y: 0.08 };

/**
 * Base framing + gentle mouse parallax. Eases to a close-up when `focusOn(id)` is called,
 * and back to the base shot when focus clears (Escape, or scrolling back to the top).
 */
export function CameraRig() {
  const size = useThree((s) => s.size);
  const reduced = usePrefersReducedMotion();

  const pos = useRef(new Vector3(...BASE_SHOT.position));
  const look = useRef(new Vector3(...BASE_SHOT.target));
  const desiredPos = useRef(new Vector3());
  const desiredLook = useRef(new Vector3());

  // Portrait viewports crop the room; slide the base shot toward the monitor/window side.
  const portraitShift = useRef(0);
  const targetFov = useRef(BASE_FOV);

  // Responsive FOV: widen on narrow viewports so the desk still reads, capped for portrait.
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    portraitShift.current = MathUtils.clamp((1 - aspect) * 0.35, 0, 0.2); // R4: monitors moved left, keep them in a portrait crop
    const distance = new Vector3(...BASE_SHOT.position).distanceTo(new Vector3(...BASE_SHOT.target));
    const halfH = Math.atan(KEEP_HALF_WIDTH / distance);
    const needed = MathUtils.radToDeg(2 * Math.atan(Math.tan(halfH) / aspect));
    targetFov.current = MathUtils.clamp(Math.max(BASE_FOV, needed), BASE_FOV, MAX_FOV);
  }, [size.width, size.height]);

  // Escape or returning to the top of the page clears focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && getFocus()) focusOn(null);
    };
    const onScroll = () => {
      if (window.scrollY < 8 && getFocus()) focusOn(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera;
    if (Math.abs(camera.fov - targetFov.current) > 0.01) {
      camera.fov = targetFov.current;
      camera.updateProjectionMatrix();
    }
    const focus = getFocus();
    const shot = focus ? SHOTS[focus] : BASE_SHOT;
    const px = reduced || focus ? 0 : state.pointer.x * PARALLAX.x;
    const py = reduced || focus ? 0 : state.pointer.y * PARALLAX.y;

    const shift = focus ? 0 : portraitShift.current;
    desiredPos.current.set(shot.position[0] + px + shift, shot.position[1] + py, shot.position[2]);
    desiredLook.current.set(shot.target[0] + shift, shot.target[1], shot.target[2]);

    // Reduced motion: snap instead of easing.
    const lambda = reduced ? 1e3 : focus ? 3 : 2.4;
    const dt = Math.min(delta, 0.1);
    pos.current.x = MathUtils.damp(pos.current.x, desiredPos.current.x, lambda, dt);
    pos.current.y = MathUtils.damp(pos.current.y, desiredPos.current.y, lambda, dt);
    pos.current.z = MathUtils.damp(pos.current.z, desiredPos.current.z, lambda, dt);
    look.current.x = MathUtils.damp(look.current.x, desiredLook.current.x, lambda, dt);
    look.current.y = MathUtils.damp(look.current.y, desiredLook.current.y, lambda, dt);
    look.current.z = MathUtils.damp(look.current.z, desiredLook.current.z, lambda, dt);

    camera.position.copy(pos.current);
    camera.lookAt(look.current);
  });

  return null;
}
