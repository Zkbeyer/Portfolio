import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import Clouds from "../components/3dModels/Clouds";
import Home from "../pages/Home";
import { SectionWidgets3D } from "../components/SectionWidgets3D";
import { useAudio } from "../components/Audio/useAuidio";

type SectionPose = {
  camPos: [number, number, number];
  lookAt: [number, number, number];
};

function wrapIndex(i: number, n: number) {
  return ((i % n) + n) % n;
}

function Scene({
  activeIndex,
  onHoverPrompt,
  onOpenSection,
}: {
  activeIndex: number;
  onHoverPrompt?: (prompt: string | null) => void;
  onOpenSection?: (index: number) => void;
}) {
  const camRef = useRef<THREE.PerspectiveCamera | null>(null);

  const poses: SectionPose[] = useMemo(
    () => [
      { camPos: [0.8, -0.1, -1], lookAt: [0, 0.2, -5] },
      { camPos: [1.5, 0, -2.2], lookAt: [-2, 0, -10] },
      { camPos: [-0.2, 0.1, -1], lookAt: [2, -0.9, -10] },
    ],
    []
  );

  const targetPos = useRef(new THREE.Vector3(...poses[0].camPos));
  const targetLook = useRef(new THREE.Vector3(...poses[0].lookAt));
  const smoothedLook = useRef(new THREE.Vector3(...poses[0].lookAt));

  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const desiredLookRef = useRef(new THREE.Vector3()); // avoids alloc

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.set(x, y);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const p = poses[activeIndex];
    targetPos.current.set(...p.camPos);
    targetLook.current.set(...p.lookAt);
  }, [activeIndex, poses]);

  useFrame(() => {
    const cam = camRef.current;
    if (!cam) return;

    cam.position.lerp(targetPos.current, 0.05);

    const PARALLAX_X = 0.35;
    const PARALLAX_Y = 0.22;

    desiredLookRef.current.copy(targetLook.current);
    desiredLookRef.current.x += mouseRef.current.x * PARALLAX_X;
    desiredLookRef.current.y += mouseRef.current.y * PARALLAX_Y;

    smoothedLook.current.lerp(desiredLookRef.current, 0.08);
    cam.lookAt(smoothedLook.current);
  });

  return (
    <>
      <PerspectiveCamera ref={camRef} makeDefault position={[0, 0.1, 0]} fov={50} />
      <ambientLight intensity={1} />
      <pointLight position={[10, 10, 10]} />

      <Suspense fallback={null}>
        <Clouds />
      </Suspense>

      <SectionWidgets3D
        activeIndex={activeIndex}
        onHoverPrompt={onHoverPrompt}
        onOpenSection={onOpenSection}
      />
    </>
  );
}

export default function ScrollSectionScene() {
  const NUM_SECTIONS = 3;
  const [activeIndex, setActiveIndex] = useState(0);
  const [audioReady, setAudioReady] = useState(false);

  const enableAudio = async () => {
  setAudioReady(true);
  await startMusic(); // will succeed because this is inside a user click
};

  // ✅ hook is now inside component
  const { muted, toggleMute, playWhoosh, startMusic, unlocked } = useAudio({
    whooshUrl: "/audio/whoosh.mp3",
    musicUrl: "/audio/ambient.mp3",
    whooshVolume: 0.18,
    musicVolume: 0.14,
  });

  // whoosh on channel switch
  useEffect(() => {
    playWhoosh();
  }, [activeIndex, playWhoosh]);

  // start music after first user interaction unlocks audio
  useEffect(() => {
    if (unlocked && !muted) void startMusic();
  }, [unlocked, muted, startMusic]);

  const lockedRef = useRef(false);
  const wheelAccumRef = useRef(0);
  const LOCK_MS = 650;
  const THRESHOLD = 100;

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (lockedRef.current) return;

      wheelAccumRef.current += e.deltaY;
      if (Math.abs(wheelAccumRef.current) < THRESHOLD) return;

      const dir = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current = 0;

      lockedRef.current = true;
      setActiveIndex((prev) => wrapIndex(prev + dir, NUM_SECTIONS));

      window.setTimeout(() => {
        lockedRef.current = false;
      }, LOCK_MS);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel as any);
  }, []);

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
      <Home
        activeIndex={activeIndex}
        numSections={NUM_SECTIONS}
        onSelectIndex={setActiveIndex}
        onToggleMusic={toggleMute}
        musicMuted={muted}
      />
      <Canvas style={{ width: "100%", height: "100%" }}>
        <Scene activeIndex={activeIndex} />
      </Canvas>
    </div>
  );
}