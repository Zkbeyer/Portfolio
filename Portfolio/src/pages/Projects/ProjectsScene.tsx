import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, ScrollControls, useScroll } from "@react-three/drei";
import * as THREE from "three";
import Duck from "../../components/3dModels/Duck";

// Replace this with your model component later

export function CameraRig() {
  const camRef = useRef<THREE.PerspectiveCamera | null>(null);

  // mouse parallax
  const mouse = useRef(new THREE.Vector2(0, 0));
  const desiredLook = useRef(new THREE.Vector3());
  const smoothedLook = useRef(new THREE.Vector3(0, 0, 0));

  const scroll = useScroll();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouse.current.set(x, y);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Define camera poses you want as the user scrolls
  // (start -> mid -> end). You can add more later.
  const poses = useMemo(
    () => [
      { pos: new THREE.Vector3(-15, 9, -10), look: new THREE.Vector3(4, 4, -6) },  // top
      { pos: new THREE.Vector3(-10, 6, -8), look: new THREE.Vector3(1, 2, 2) },  // middle 
      { pos: new THREE.Vector3(-12, 4, -1), look: new THREE.Vector3(0, 1.5, 1) }, // bottom
    ],
    []
  );

  // helper: smooth step between 3 poses
  const lerpPose = (t: number) => {
    // t 0..1
    const a = poses[0], b = poses[1], c = poses[2];
    if (t < 0.5) {
      const k = t / 0.5;
      return {
        pos: a.pos.clone().lerp(b.pos, k),
        look: a.look.clone().lerp(b.look, k),
      };
    } else {
      const k = (t - 0.5) / 0.5;
      return {
        pos: b.pos.clone().lerp(c.pos, k),
        look: b.look.clone().lerp(c.look, k),
      };
    }
  };

  useFrame(() => {
    const cam = camRef.current;
    if (!cam) return;

    const t = scroll.offset; // 0..1
    const pose = lerpPose(t);

    // Smooth camera position to scroll pose
    cam.position.lerp(pose.pos, 0.06);

    // Add mouse parallax to look target (subtle)
    const PARALLAX_X = 0.25;
    const PARALLAX_Y = 0.16;

    desiredLook.current.copy(pose.look);
    desiredLook.current.x += mouse.current.x * PARALLAX_X;
    desiredLook.current.y += mouse.current.y * PARALLAX_Y;

    smoothedLook.current.lerp(desiredLook.current, 0.08);
    cam.lookAt(smoothedLook.current);
  });

  return <PerspectiveCamera ref={camRef} makeDefault position={[0.6, 0.1, 2.6]} fov={45} />;
}

export default function ProjectsScene() {
  return (
    <div className="projects-canvas">
      <Canvas>
        <ScrollControls pages={2} damping={0.12}>
          <CameraRig />
          <ambientLight intensity={0.8} />
          <pointLight position={[4, 4, 4]} intensity={1.2} />
          <Suspense fallback={null}>
            <group position={[0, -0.1, 0]}>
              <Duck />
            </group>
          </Suspense>
        </ScrollControls>
      </Canvas>
    </div>
  );
}