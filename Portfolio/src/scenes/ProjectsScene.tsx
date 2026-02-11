import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type Pose = {
  camPos: [number, number, number];
  lookAt: [number, number, number];
};

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

// Tune these for your Projects scene
const PROJECTS_POSES: Pose[] = [
  { camPos: [-10, 10, 5], lookAt: [0, 0.2, 0] },   // top
  { camPos: [-5, 1, 2], lookAt: [0.2, 0.2, 0] }, // mid
  { camPos: [-8, 2, 0], lookAt: [-0.2, 2, 0] } // bottom
];

export function CameraRig({ progress = 0 }: { progress?: number }) {
  const { camera } = useThree();
  const poses = useMemo(() => PROJECTS_POSES, []);

  const tmpPos = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());
  const desiredLook = useRef(new THREE.Vector3());
  const smoothedLook = useRef(new THREE.Vector3());

  // subtle mouse parallax
  const mouse = useRef(new THREE.Vector2(0, 0));
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouse.current.set(x, y);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    const t = clamp01(progress);

    // Map 0..1 across pose segments
    const seg = (poses.length - 1) * t;
    const i0 = Math.floor(seg);
    const i1 = Math.min(poses.length - 1, i0 + 1);
    const localT = seg - i0;

    const a = poses[i0];
    const b = poses[i1];

    // Interpolate pose
    const bPos = new THREE.Vector3(...b.camPos);
    const bLook = new THREE.Vector3(...b.lookAt);

    tmpPos.current.set(...a.camPos).lerp(bPos, localT);
    tmpLook.current.set(...a.lookAt).lerp(bLook, localT);

    // Smooth camera movement
    camera.position.lerp(tmpPos.current, 0.10);

    // Mouse “parallax” on look target
    const PARALLAX_X = 0.18;
    const PARALLAX_Y = 0.12;

    desiredLook.current.copy(tmpLook.current);
    desiredLook.current.x += mouse.current.x * PARALLAX_X;
    desiredLook.current.y += mouse.current.y * PARALLAX_Y;

    smoothedLook.current.lerp(desiredLook.current, 0.12);
    camera.lookAt(smoothedLook.current);
    camera.updateProjectionMatrix();
  });

  return null;
}