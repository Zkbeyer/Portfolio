import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";

import "./projects.css";
import Duck from "../../components/3dModels/Duck";
import { CameraRig } from "../../scenes/ProjectsScene";
import ProjectsOverlay from "./ProjectsOverlay";
import { navigateTo } from "../../app/navBus";

import { useAudio } from "../../components/Audio/useAudio";

export default function ProjectsPage() {
  const { muted, toggleMute, setAmbience } = useAudio();

  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Switch ambience for this page
  useEffect(() => {
    setAmbience("PROJECTS");
  }, [setAmbience]);

  // Drive CameraRig progress from the Projects scroll host
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const max = Math.max(1, el.scrollHeight - el.clientHeight);
      const y = el.scrollTop;
      setProgress(y / max);
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll as any);
  }, []);

  return (
    <div className="projects-root">

      <div className="projects-homeBtnWrap">
        <button className="projects-homeBtn" onClick={() => navigateTo("HOME")}>
          ← Home
        </button>
      </div>
      
      <div className="projects-audioBtnWrap">
        <button className="projects-audioBtn" onClick={toggleMute}>
          {muted ? "Audio: Muted" : "Audio: Live"}
        </button>
      </div>

      <Canvas className="projects-canvas">
        <CameraRig progress={progress} />
        <ambientLight intensity={0.8} />
        <pointLight position={[4, 4, 4]} intensity={1.2} />
        <Suspense fallback={null}>
          <Duck />
        </Suspense>
      </Canvas>

      <div className="projects-scroll" ref={scrollRef}>
        <ProjectsOverlay />
      </div>
    </div>
  );
}