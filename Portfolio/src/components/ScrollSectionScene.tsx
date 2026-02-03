import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import Clouds from '../components/3dModels/Clouds';
import Home from "../pages/Home";

type SectionPose = {
  // camera position and "look at" target per section
  camPos: [number, number, number];
  lookAt: [number, number, number];
};

function wrapIndex(i: number, n: number) {
  return ((i % n) + n) % n;
}

function Scene({ activeIndex }: { activeIndex: number }) {
  const camRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Define 3 “locked” camera poses (tune these)
  const poses: SectionPose[] = useMemo(
    () => [
      { camPos: [0.8, -0.1, -1], lookAt: [0, .2, -5] },     // Section 0
      { camPos: [1.2, 0, -2.5], lookAt: [-5, 0, -10] }, // Section 1
      { camPos: [-.2, -.1, -1], lookAt: [2, -.1, -10] }, // Section 2
    ],
    []
  );

  //targets
  const targetPos = useRef(new THREE.Vector3(...poses[0].camPos));
  const targetLook = useRef(new THREE.Vector3(...poses[0].lookAt));

  //smoothed look
  const smoothedLook = useRef(new THREE.Vector3(...poses[0].lookAt));

  // Update targets whenever active section changes
  useEffect(() => {
    const p = poses[activeIndex];
    targetPos.current.set(...p.camPos);
    targetLook.current.set(...p.lookAt);
  }, [activeIndex, poses]);

  useFrame(() => {
    const cam = camRef.current;
    if (!cam) return;

    // Smoothly move camera to target
    cam.position.lerp(targetPos.current, .05);

    smoothedLook.current.lerp(targetLook.current, 0.08);

    cam.lookAt(smoothedLook.current);

    cam.updateProjectionMatrix();
  });

  return (
    <>
      <PerspectiveCamera ref={camRef} makeDefault position={[0, .1, 0]} fov={50} />
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} />

      <Suspense fallback={null}>
        <Clouds />
      </Suspense>
    </>
  );
}

export default function ScrollSectionScene() {
  const NUM_SECTIONS = 3;

  const [activeIndex, setActiveIndex] = useState(0);

  // lock so trackpads don’t blast through multiple sections
  const lockedRef = useRef(false);
  const wheelAccumRef = useRef(0);

  const LOCK_MS = 650;       // how long it “snaps/locks”
  const THRESHOLD = 100;      // how much wheel delta before we advance a section

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      // Prevent the page from scrolling
      e.preventDefault();

      if (lockedRef.current) return;

      // Accumulate wheel movement (trackpads send many small deltas)
      wheelAccumRef.current += e.deltaY;

      if (Math.abs(wheelAccumRef.current) < THRESHOLD) return;

      const dir = wheelAccumRef.current > 0 ? 1 : -1; // down = next, up = prev
      wheelAccumRef.current = 0;

      lockedRef.current = true;
      setActiveIndex((prev) => wrapIndex(prev + dir, NUM_SECTIONS));

      window.setTimeout(() => {
        lockedRef.current = false;
      }, LOCK_MS);
    };

    // Use { passive:false } so preventDefault works
    window.addEventListener("wheel", onWheel, { passive: false });

    return () => window.removeEventListener("wheel", onWheel as any);
  }, []);

  // Optional: keyboard navigation feels great for “channels”
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lockedRef.current) return;

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        lockedRef.current = true;
        setActiveIndex((prev) => wrapIndex(prev + 1, NUM_SECTIONS));
        setTimeout(() => (lockedRef.current = false), LOCK_MS);
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        lockedRef.current = true;
        setActiveIndex((prev) => wrapIndex(prev - 1, NUM_SECTIONS));
        setTimeout(() => (lockedRef.current = false), LOCK_MS);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
        <Home activeIndex={activeIndex} numSections={NUM_SECTIONS} onSelectIndex={setActiveIndex}/>
      <Canvas style={{ width: "100%", height: "100%" }}>
        <Scene activeIndex={activeIndex} />
      </Canvas>
    </div>
  );
}