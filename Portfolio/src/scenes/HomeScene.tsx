import { Suspense, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

import SpaceBoi from "../components/3dModels/SpaceBoi";

type Pose = {
  camPos: [number, number, number];
  lookAt: [number, number, number];
};

const POSES: Pose[] = [
  { camPos: [10, 6, 12], lookAt: [7, 3, 1] },
  { camPos: [5, 10, 5], lookAt: [0, 1, 0] },
  { camPos: [12, 3, 5], lookAt: [3, 2, 5.5] },
];

function easeInOut(t: number) {
  return t * t * (3 - 2 * t);
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

export default function HomeScene({
  section,
  transition,
}: {
  section: number;
  transition: { active: boolean; from: number; to: number; t: number };
}) {
  const camRef = useRef<THREE.PerspectiveCamera | null>(null);

  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const desiredLookRef = useRef(new THREE.Vector3());
  const smoothedLookRef = useRef(new THREE.Vector3(0, 0, -5));

  const tmpPos = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());
  const tmpToPos = useRef(new THREE.Vector3());
  const tmpToLook = useRef(new THREE.Vector3());

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.set(x, y);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    const cam = camRef.current;
    if (!cam) return;

    const fromPose = POSES[transition.active ? transition.from : section];
    const toPose = POSES[transition.active ? transition.to : section];

    const k = transition.active ? easeInOut(clamp01(transition.t)) : 1;

    tmpToPos.current.set(...toPose.camPos);
    tmpToLook.current.set(...toPose.lookAt);

    tmpPos.current.set(...fromPose.camPos).lerp(tmpToPos.current, k);
    tmpLook.current.set(...fromPose.lookAt).lerp(tmpToLook.current, k);

    cam.position.lerp(tmpPos.current, 0.10);

    const PARALLAX_X = 0.30;
    const PARALLAX_Y = 0.20;

    desiredLookRef.current.copy(tmpLook.current);
    desiredLookRef.current.x += mouseRef.current.x * PARALLAX_X;
    desiredLookRef.current.y += mouseRef.current.y * PARALLAX_Y;

    smoothedLookRef.current.lerp(desiredLookRef.current, 0.12);
    cam.lookAt(smoothedLookRef.current);
  });

  return (
    <>
      <PerspectiveCamera ref={camRef} makeDefault position={POSES[0].camPos} fov={50} />
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} />
      <Suspense fallback={null}>
        <SpaceBoi />
      </Suspense>
    </>
  );
}