import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

import Clouds from "../components/3dModels/Clouds";
import Home from "../pages/Home";
import { useAudio } from "./Audio/useAudio";

type Pose = {
  camPos: [number, number, number];
  lookAt: [number, number, number];
};

const POSES: Pose[] = [
  { camPos: [0.8, -0.1, -1], lookAt: [0, 0.2, -5] },
  { camPos: [1.5, 0, -2.2], lookAt: [-2, 0, -10] },
  { camPos: [-0.2, 0.1, -1], lookAt: [2, -0.9, -10] },
];

function easeInOut(t: number) {
  // smoothstep
  return t * t * (3 - 2 * t);
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

function wrapIndex(i: number, n: number) {
  return ((i % n) + n) % n;
}

/**
 * A simple 3D transition “wipe” object that crosses the camera.
 * Replace this with your own transition object if you want.
 */
function TransitionWipe({ active, progress }: { active: boolean; progress: number }) {
  // progress 0..1
  if (!active) return null;

  // Move from far right to far left in camera space-ish
  const x = THREE.MathUtils.lerp(3.5, -3.5, easeInOut(progress));
  const z = THREE.MathUtils.lerp(-1.5, -0.6, easeInOut(progress));

  return (
    <group position={[x, 0, z]}>
      <mesh>
        <boxGeometry args={[2.2, 2.2, 0.15]} />
        <meshStandardMaterial
          color={"#0b0c10"}
          metalness={0.15}
          roughness={0.2}
          emissive={new THREE.Color("#111")}
          emissiveIntensity={0.35}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* “checker” hint */}
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[2.15, 2.15]} />
        <meshBasicMaterial
          transparent
          opacity={0.55}
          color={"#ffffff"}
        />
      </mesh>
    </group>
  );
}

function Scene({
  section,
  transition,
}: {
  section: number;
  transition: {
    active: boolean;
    from: number;
    to: number;
    t: number;
  };
}) {
  const camRef = useRef<THREE.PerspectiveCamera | null>(null);

  // mouse parallax
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const desiredLookRef = useRef(new THREE.Vector3());
  const smoothedLookRef = useRef(new THREE.Vector3(0, 0, -5));

  // reuse vectors
  const tmpPos = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());

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

    // Base pose (interpolated during transition)
    tmpPos.current
      .set(...fromPose.camPos)
      .lerp(new THREE.Vector3(...toPose.camPos), k);

    tmpLook.current
      .set(...fromPose.lookAt)
      .lerp(new THREE.Vector3(...toPose.lookAt), k);

    // Smooth camera movement a bit (keeps things premium)
    cam.position.lerp(tmpPos.current, 0.10);

    // Parallax on top of look
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
        <Clouds />
      </Suspense>

      <TransitionWipe active={transition.active} progress={transition.t} />
    </>
  );
}

function BottomChecker({ label }: { label: string }) {
  return (
    <div
      style={{
        marginTop: 28,
        padding: "22px 0",
        borderTop: "1px solid rgba(255,255,255,0.10)",
        borderBottom: "1px solid rgba(255,255,255,0.10)",
        opacity: 0.75,
      }}
    >
      <div
        style={{
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontSize: 12,
          marginBottom: 10,
          opacity: 0.8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 6,
        }}
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 10,
              borderRadius: 2,
              background:
                i % 2 === 0
                  ? "rgba(255,255,255,0.18)"
                  : "rgba(255,255,255,0.06)",
            }}
          />
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
        Scroll past this checker to transition.
      </div>
    </div>
  );
}

function PageProjects() {
  return (
    <div>
      <div style={{ letterSpacing: "0.18em", fontSize: 12, opacity: 0.7 }}>
        V-001 • INDEX • PROJECTS
      </div>
      <div style={{ fontSize: 44, letterSpacing: "0.06em", marginTop: 10 }}>
        PROJECTS
      </div>
      <div style={{ maxWidth: 820, lineHeight: 1.6, opacity: 0.85, marginTop: 10 }}>
        Scroll this page to the bottom. When you pass the checker, the camera
        transitions to ABOUT and the ABOUT page starts at the top.
      </div>

      <div style={{ height: 520 }} />

      <div style={{ fontSize: 18, letterSpacing: "0.12em" }}>FEATURED</div>
      <div style={{ maxWidth: 820, lineHeight: 1.6, opacity: 0.85, marginTop: 10 }}>
        • Spotify Rewind — description, tech stack, repo link<br />
        • RecipeHub — description, tech stack, repo link
      </div>

      <div style={{ height: 800 }} />

      <BottomChecker label="END OF PROJECTS" />

      {/* A little extra padding so the checker can be fully passed */}
      <div style={{ height: 220 }} />
    </div>
  );
}

function PageAbout() {
  return (
    <div>
      <div style={{ letterSpacing: "0.18em", fontSize: 12, opacity: 0.7 }}>
        V-001 • INDEX • ABOUT
      </div>
      <div style={{ fontSize: 44, letterSpacing: "0.06em", marginTop: 10 }}>
        ABOUT
      </div>
      <div style={{ maxWidth: 820, lineHeight: 1.6, opacity: 0.85, marginTop: 10 }}>
        Scroll this page to the bottom to transition to CONTACT.
      </div>

      <div style={{ height: 520 }} />

      <div style={{ fontSize: 18, letterSpacing: "0.12em" }}>HOW I BUILD</div>
      <div style={{ maxWidth: 820, lineHeight: 1.6, opacity: 0.85, marginTop: 10 }}>
        Put your “systems mindset / aviation / tooling” story here.
      </div>

      <div style={{ height: 900 }} />

      <BottomChecker label="END OF ABOUT" />
      <div style={{ height: 220 }} />
    </div>
  );
}

function PageContact() {
  return (
    <div>
      <div style={{ letterSpacing: "0.18em", fontSize: 12, opacity: 0.7 }}>
        V-001 • INDEX • CONTACT
      </div>
      <div style={{ fontSize: 44, letterSpacing: "0.06em", marginTop: 10 }}>
        CONTACT
      </div>
      <div style={{ maxWidth: 820, lineHeight: 1.6, opacity: 0.85, marginTop: 10 }}>
        Scroll to the bottom to loop back to PROJECTS (direct 2 → 0 transition).
      </div>

      <div style={{ height: 520 }} />

      <div style={{ fontSize: 18, letterSpacing: "0.12em" }}>LINKS</div>
      <div style={{ maxWidth: 820, lineHeight: 1.6, opacity: 0.85, marginTop: 10 }}>
        • Email<br />
        • GitHub<br />
        • LinkedIn
      </div>

      <div style={{ height: 900 }} />

      <BottomChecker label="END OF CONTACT" />
      <div style={{ height: 220 }} />
    </div>
  );
}

export default function ScrollSectionScene() {
  const NUM = 3;

  const { muted, toggleMute, playWhoosh, startMusic, enableAudio: hookEnableAudio } = useAudio({
    whooshUrl: "/audio/whoosh.mp3",
    musicUrl: "/audio/ambient.mp3",
    whooshVolume: 0.18,
    musicVolume: 0.14,
  });

  const [audioReady, setAudioReady] = useState(false);
  const onEnableAudio = async () => {
    setAudioReady(true);
    await hookEnableAudio();
  };

  const [section, setSection] = useState(0);
  const [transition, setTransition] = useState({
    active: false,
    from: 0,
    to: 0,
    t: 0,
  });

  // --- HTML page fade control (during transition) ---
  const [pageOpacity, setPageOpacity] = useState(1);
  const [uiLocked, setUiLocked] = useState(false);

  const scrollHostRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Immediate (sync) locks to prevent double-trigger from wheel/IO bursts
  const transitioningRef = useRef(false);
  const wheelBlockUntilRef = useRef(0);
    // Swap page/headers once at transition midpoint
  const swappedMidRef = useRef(false);

  const TRANSITION_SEC = 0.95;

  // drive transition time
  useEffect(() => {
    if (!transition.active) return;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      setTransition((prev) => {
        const nextT = prev.t + dt / TRANSITION_SEC;
        if (nextT >= 1) {
          return { ...prev, t: 1 };
        }
        return { ...prev, t: nextT };
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [transition.active]);

  // Fade the HTML page out/in DURING the camera transition (1 → 0 → 1)
  useEffect(() => {
    if (!transition.active) {
      setPageOpacity(1);
      return;
    }

    const t = clamp01(transition.t);
    // 1 at start/end, 0 at midpoint
    const opacity = 1 - Math.sin(Math.PI * t);
    setPageOpacity(opacity);
  }, [transition.active, transition.t]);

    // ✅ Swap the HTML page + Home highlights at the midpoint (when opacity is ~0)
  useEffect(() => {
    if (!transition.active) return;
    if (swappedMidRef.current) return;

    if (transition.t >= 0.5) {
      swappedMidRef.current = true;

      const nextSection = transition.to;

      // Swap content/headers
      setSection(nextSection);

      // Reset scroll to top of the NEW page while hidden
      const host = scrollHostRef.current;
      if (host) {
        host.scrollTo({ top: 0, behavior: "auto" });
      }
    }
  }, [transition.active, transition.t, transition.to]);

    // when transition completes: end camera transition + unlock UI
  useEffect(() => {
    if (!transition.active) return;
    if (transition.t < 1) return;

    const finalSection = transition.to;

    // End the camera transition + unlock UI
    setTransition({ active: false, from: finalSection, to: finalSection, t: 0 });
    setUiLocked(false);

    // Post-transition wheel block to prevent rapid retrigger
    wheelBlockUntilRef.current = performance.now() + 450;
    transitioningRef.current = false;
  }, [transition.active, transition.t, transition.to]);

  const startTransitionTo = (to: number) => {
    if (transitioningRef.current) return;
    if (transition.active || uiLocked) return;

    const from = section;
    const next = wrapIndex(to, NUM);

    if (next === from) {
      // just scroll to top
      scrollHostRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      transitioningRef.current = false;
      return;
    }

    transitioningRef.current = true;
    swappedMidRef.current = false;   // ✅ reset midpoint swap
    setUiLocked(true);
    // Wheel block for duration of transition (covers 0.95s transition, add buffer)
    wheelBlockUntilRef.current = performance.now() + 900;
    playWhoosh?.();
    setTransition({ active: true, from, to: next, t: 0 });
  };

  const goNext = () => startTransitionTo(section + 1);
  const goPrev = () => startTransitionTo(section - 1);

  // Sentinel logic: when the bottom checker is passed, transition forward.
  useEffect(() => {
    const host = scrollHostRef.current;
    const sentinel = sentinelRef.current;
    if (!host || !sentinel) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (transition.active) return;
        for (const e of entries) {
          if (e.isIntersecting) {
            // When the sentinel enters view near the bottom, allow user to "pass" it.
            // If they're at/near bottom, transition.
            const nearBottom = host.scrollTop + host.clientHeight >= host.scrollHeight - 8;
            if (nearBottom) {
              goNext();
            }
          }
        }
      },
      {
        root: host,
        threshold: 0.65,
      }
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, [section, transition.active]);

  // Edge wheel navigation:
  // - scroll down at bottom => next section
  // - scroll up at top => previous section
  useEffect(() => {
    const host = scrollHostRef.current;
    if (!host) return;

    const onWheel = (e: WheelEvent) => {
      if (transition.active || uiLocked) return;
      const now = performance.now();
      if (now < wheelBlockUntilRef.current) return;

      const max = host.scrollHeight - host.clientHeight;
      if (max <= 0) return;

      const atTop = host.scrollTop <= 1;
      const atBottom = host.scrollTop >= max - 1;

      if (e.deltaY < 0 && atTop) {
        e.preventDefault();
        e.stopPropagation();
        wheelBlockUntilRef.current = performance.now() + 500;
        goPrev();
      }

      // Keep your 'checker' concept: only advance if the sentinel is in view near the bottom
      if (e.deltaY > 0 && atBottom) {
        // Let IntersectionObserver decide; but if sentinel is already visible, go next.
        const sentinel = sentinelRef.current;
        if (sentinel) {
          const r = sentinel.getBoundingClientRect();
          if (r.top <= window.innerHeight) {
            e.preventDefault();
            e.stopPropagation();
            wheelBlockUntilRef.current = performance.now() + 500;
            goNext();
          }
        }
      }
    };

    host.addEventListener("wheel", onWheel, { passive: false });
    return () => host.removeEventListener("wheel", onWheel as any);
  }, [section, transition.active, uiLocked]);


  const Page = useMemo(() => {
    if (section === 0) return <PageProjects />;
    if (section === 1) return <PageAbout />;
    return <PageContact />;
  }, [section]);

  const onSelectSection = (i: number) => {
    // direct jump; ignore wheel cooldown
    wheelBlockUntilRef.current = 0;
    startTransitionTo(i);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", overflow: "hidden" }}>
      {!audioReady && (
        <div
          onClick={onEnableAudio}
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            zIndex: 9999,
            color: "white",
            fontFamily: "ui-sans-serif, system-ui",
            background: "rgba(0,0,0,0.55)",
            cursor: "pointer",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Click to enable sound
        </div>
      )}

      {/* Overlay UI (header/footer) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto" }}>
          <Home
            activeIndex={section}
            numSections={3}
            onSelectIndex={onSelectSection}
            onToggleMusic={toggleMute}
            musicMuted={muted}
          />
        </div>
      </div>

      {/* HTML page host */}
      <div
        ref={scrollHostRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 5,
          overflowY: (transition.active || uiLocked) ? "hidden" : "auto",
          overflowX: "hidden",
          padding: "140px 6vw 140px",
          boxSizing: "border-box",
          color: "rgba(255,255,255,0.88)",
          fontFamily: "ui-sans-serif, system-ui",
          opacity: pageOpacity,
          pointerEvents: pageOpacity < 0.02 ? "none" : "auto",
        }}
      >
        {/* Page content */}
        {Page}

        {/* Sentinel AFTER the checker + extra pad: when it reaches view and you are at bottom, we transition */}
        <div ref={sentinelRef} style={{ height: 2 }} />
      </div>

      {/* 3D background */}
      <Canvas style={{ width: "100%", height: "100%" }}>
        <Scene section={section} transition={transition} />
      </Canvas>

      {/* During transition, keep the HTML visible but disable scrolling; optional subtle overlay */}
      {(transition.active || uiLocked) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 50,
            background: transition.active
              ? `rgba(0,0,0,${0.12 * Math.sin(Math.PI * clamp01(transition.t))})`
              : "rgba(0,0,0,0.12)",
          }}
        />
      )}
    </div>
  );
}