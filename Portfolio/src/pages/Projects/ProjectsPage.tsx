import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll } from "@react-three/drei";
import ProjectsOverlay from "./ProjectsOverlay";
import { CameraRig } from "./ProjectsScene"; // export it (see next step)
import "./projects.css";
import Duck from "../../components/3dModels/Duck";

export default function ProjectsPage() {
  return (
    <div className="projects-root">
         {/* HOME BUTTON */}
        <div
            style={{
            position: "fixed",
            top: 22,
            right: 26,
            zIndex: 50,
            }}
        >
            <button
            onClick={() => {
                console.log("HOME CLICKED"); // wire later
            }}
            style={{
                background: "rgba(10,12,16,0.65)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.9)",
                padding: "10px 14px",
                borderRadius: 14,
                fontSize: 12,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                transition: "all 0.18s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.38)";
                e.currentTarget.style.background = "rgba(20,24,30,0.75)";
                e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                e.currentTarget.style.background = "rgba(10,12,16,0.65)";
                e.currentTarget.style.transform = "translateY(0)";
            }}
            >
            ← Home
            </button>
        </div>
      <Canvas className="projects-canvas">
        <ScrollControls pages={2} damping={0.12}>
          {/* 3D */}
          <CameraRig />
          <ambientLight intensity={0.8} />
          <pointLight position={[4, 4, 4]} intensity={1.2} />
          <Suspense fallback={null}>
            <Duck />
          </Suspense>

          {/* HTML overlay tied to SAME scroll */}
          <Scroll html>
            <ProjectsOverlay />
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}