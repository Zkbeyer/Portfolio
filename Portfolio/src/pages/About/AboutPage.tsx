import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, ScrollControls, Scroll, useScroll, Environment } from "@react-three/drei";
import * as THREE from "three";

import "./about.css";
import Forest from "../../components/3dModels/Forest";
import { navigateTo } from "../../app/navBus";
import { useAudio } from "../../components/Audio/useAudio";

type Pose = {
  camPos: [number, number, number];
  lookAt: [number, number, number];
};

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

function easeInOut(t: number) {
  return t * t * (3 - 2 * t);
}

function AboutCameraRig({ poses }: { poses: Pose[] }) {
  const camRef = useRef<THREE.PerspectiveCamera | null>(null);
  const scroll = useScroll();

  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const desiredLookRef = useRef(new THREE.Vector3());
  const smoothedLookRef = useRef(new THREE.Vector3());

  // Reusable vectors
  const fromPos = useRef(new THREE.Vector3());
  const toPos = useRef(new THREE.Vector3());
  const fromLook = useRef(new THREE.Vector3());
  const toLook = useRef(new THREE.Vector3());
  const blendedPos = useRef(new THREE.Vector3());
  const blendedLook = useRef(new THREE.Vector3());

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

    // ScrollControls provides a normalized 0..1 offset across pages
    const u = clamp01(scroll.offset);

    // With 3 poses, blend 0->1 between pose0..pose1, then pose1..pose2
    const n = poses.length;
    const segs = Math.max(1, n - 1);
    const scaled = u * segs;
    const i = Math.min(segs - 1, Math.floor(scaled));
    const localT = easeInOut(scaled - i);

    const a = poses[i];
    const b = poses[i + 1];

    fromPos.current.set(...a.camPos);
    toPos.current.set(...b.camPos);
    fromLook.current.set(...a.lookAt);
    toLook.current.set(...b.lookAt);

    blendedPos.current.copy(fromPos.current).lerp(toPos.current, localT);
    blendedLook.current.copy(fromLook.current).lerp(toLook.current, localT);

    // Smooth camera move (feels alive)
    cam.position.lerp(blendedPos.current, 0.10);

    // Subtle parallax look
    const PARALLAX_X = 0.01;
    const PARALLAX_Y = 0.01;

    desiredLookRef.current.copy(blendedLook.current);
    desiredLookRef.current.x += mouseRef.current.x * PARALLAX_X;
    desiredLookRef.current.y += mouseRef.current.y * PARALLAX_Y;

    smoothedLookRef.current.lerp(desiredLookRef.current, 0.12);
    cam.lookAt(smoothedLookRef.current);
  });

  return <PerspectiveCamera ref={camRef} makeDefault fov={50} position={poses[0].camPos} />;
}

function AboutOverlay() {
  return (
    <div className="about-overlay">
      <div className="about-shell">
        <section className="about-hero" aria-label="About header">
          <div className="about-avatarWrap">
            <img
              className="about-avatar"
              src={`${import.meta.env.BASE_URL}/assets/headshot.JPG`}
              alt="Zackery Beyer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="about-avatarDot" aria-hidden />
          </div>

          <div className="about-heroText">
            <div className="about-kicker">V-001 • PROFILE • ABOUT</div>
            <h1 className="about-title">ZACKERY BEYER</h1>
            <div className="about-subtitle">Software Developer • CS @ Mizzou • Systems-minded builder</div>

            <div className="about-heroMeta" role="list">
              <div className="about-metaCard" role="listitem">
                <div className="about-metaKey">Focus</div>
                <div className="about-metaVal">SWE + systems / embedded-adjacent</div>
              </div>
              <div className="about-metaCard" role="listitem">
                <div className="about-metaKey">Best with</div>
                <div className="about-metaVal">C/C++ • C# • TypeScript • Python</div>
              </div>
              <div className="about-metaCard" role="listitem">
                <div className="about-metaKey">Vibe</div>
                <div className="about-metaVal">Creative, intentional, ship-focused</div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-grid" aria-label="About sections">
          <div className="about-card">
            <div className="about-cardTitle">Snapshot</div>
            <div className="about-cardBody">
              I am a <span className="about-em">software engineer</span> focused on backed, platform, and could systems.
              I love constantly learning new things and the process of problem solving and building solutions.
              
            </div>
          </div>

          <div className="about-card">
            <div className="about-cardTitle">How I work</div>
            <div className="about-pillRow">
              {[
                "Always learning",
                "Coachable",
                "High ownership",
                "Fast iteration",
                "Documentation-first",
                "Taste + polish",
              ].map((t) => (
                <span key={t} className="about-pill">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="about-card">
            <div className="about-cardTitle">What I’m building</div>
            <div className="about-cardBody">
              An interactive portfolio experience (this), plus personal projects that combine useful tooling and good UX.
              I like projects that I’ll actually use—analyzers, dashboards, automation, and developer tooling.
            </div>
          </div>

          <div className="about-card">
            <div className="about-cardTitle">Highlights</div>
            <div className="about-timeline">
              <div className="about-timelineRow">
                <div className="about-dot" aria-hidden />
                <div>
                  <div className="about-timelineTitle">Garmin Aviation (Summer 2026)</div>
                  <div className="about-timelineSub">Incoming software engineering internship</div>
                </div>
              </div>
              <div className="about-timelineRow">
                <div className="about-dot" aria-hidden />
                <div>
                  <div className="about-timelineTitle">Full-stack projects</div>
                  <div className="about-timelineSub">React/Node apps + data-driven features</div>
                </div>
              </div>
              <div className="about-timelineRow">
                <div className="about-dot" aria-hidden />
                <div>
                  <div className="about-timelineTitle">Embedded curiosity</div>
                  <div className="about-timelineSub">Sensors, hardware experiments, systems thinking</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-wide" aria-label="Toolbox">
          <div className="about-card about-cardWide">
            <div className="about-cardTitle">Toolbox</div>
            <div className="about-cardBody">
              I try to keep my stack simple and sharp. Here’s what I reach for most often.
            </div>
            <div className="about-toolGrid">
              {[
                { k: "Languages", v: "C/C++, C#, TypeScript, Python, Java" },
                { k: "Web", v: "React, Vite, Node/Express, REST" },
                { k: "Data", v: "SQL, modeling, visualization" },
                { k: "Dev", v: "Git/GitHub, CI mindset, clean structure" },
              ].map((x) => (
                <div key={x.k} className="about-tool">
                  <div className="about-toolKey">{x.k}</div>
                  <div className="about-toolVal">{x.v}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-cta" aria-label="Next">
          <div className="about-end">END OF ABOUT • SCROLL UP TO REFOCUS</div>
        </section>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const { setAmbience, muted, toggleMute } = useAudio();

  // Switch ambience for this route/page
  useEffect(() => {
    setAmbience("ABOUT");
  }, [setAmbience]);

  // These are just placeholder poses — tune freely
  const poses = useMemo<Pose[]>(
    () => [
      { camPos: [-8, 7, 3], lookAt: [-2, 10, -1]},
      { camPos: [4, 9, 7], lookAt: [3, 8, -3]},
      { camPos: [5, 9.5, 5], lookAt: [1, 8, 0] },
    ],
    []
  );

  return (
    <div className="about-root">
      <div className="about-homeBtnWrap">
        <button className="about-homeBtn" onClick={() => navigateTo("HOME")}>← Home</button>
      </div>
      <div className="about-audioBtnWrap">
        <button
          type="button"
          className={`about-audioBtn ${muted ? "isMuted" : "isOn"}`}
          onClick={toggleMute}
          aria-label={muted ? "Unmute audio" : "Mute audio"}
        >
          {muted ? "AUDIO: OFF" : "AUDIO: ON"}
        </button>
      </div>

      <Canvas shadows className="about-canvas">
        <ScrollControls pages={2.4} damping={0.12}>
          <AboutCameraRig poses={poses} />
          <ambientLight intensity={0} />
          <hemisphereLight castShadow intensity={10} />
          <Suspense fallback={null}>
            <Forest />
          </Suspense>

          <Scroll html>
            <Environment preset="forest" background blur={0.15} />
            <AboutOverlay />
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}