import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

import SpaceBoi from "../components/3dModels/SpaceBoi";
import Home from "../pages/Home";
import { useAudio } from "./Audio/useAudio";

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

function wrapIndex(i: number, n: number) {
  return ((i % n) + n) % n;
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

  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const desiredLookRef = useRef(new THREE.Vector3());
  const smoothedLookRef = useRef(new THREE.Vector3(0, 0, -5));

  // Reuse vectors (avoid allocations each frame)
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 6 }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 10,
              borderRadius: 2,
              background: i % 2 === 0 ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
            }}
          />
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>Next Section ↓</div>
    </div>
  );
}

function PageProjects() {
  const [hovered, setHovered] = React.useState(false);

  return (
    <>
      <div style={{ letterSpacing: "0.18em", fontSize: 12, opacity: 0.7, marginBottom: 10, marginTop: 20 }}>
        Contact ↑
      </div>

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          e.preventDefault();
          console.log("Projects page clicked (stub)");
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            console.log("Projects page clicked (stub)");
          }
        }}
        style={{
          borderRadius: 18,
          padding: "22px 20px",
          background: hovered ? "rgba(10,12,16,0.62)" : "rgba(10,12,16,0.52)",
          border: hovered ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          cursor: "pointer",
          transition: "background 180ms ease, border-color 180ms ease, transform 180ms ease",
          transform: hovered ? "translateY(-1px)" : "translateY(0)",
          outline: "none",
        }}
        aria-label="Open Projects page"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 44, letterSpacing: "0.06em" }}>PROJECTS</div>

          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              opacity: hovered ? 0.95 : 0.78,
              border: "1px solid rgba(255,255,255,0.16)",
              padding: "10px 12px",
              borderRadius: 14,
              userSelect: "none",
            }}
          >
            Click to open Projects →
          </div>
        </div>

        <div style={{ maxWidth: 820, lineHeight: 1.6, opacity: 0.85, marginTop: 10 }}>
          See what I’ve built, how I build, and what I’m building next.
          Scroll down to see featured projects, or click the headers to jump around.
        </div>

        <div style={{ height: 100 }} />

        <div style={{ fontSize: 22, letterSpacing: "0.12em" }}>HIGHLIGHTED PROJECT:</div>

        <div
          style={{
            marginTop: 14,
            borderRadius: 16,
            padding: 18,
            background: "rgba(10,12,16,0.55)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 18, letterSpacing: "0.12em" }}>SPOTIFY REWIND</div>
              <div style={{ opacity: 0.65, marginTop: 6 }}>
                Your personal music year-in-review with AI-style insights
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, opacity: 0.78, lineHeight: 1.55 }}>
            A full-stack web app that analyzes listening history to generate a personalized “Wrapped”-style report,
            with shareable insights and clean, fast UX.
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {["React", "Node", "Express", "TypeScript", "API"].map((t) => (
              <div
                key={t}
                style={{
                  fontSize: 12,
                  letterSpacing: "0.08em",
                  opacity: 0.85,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                {t}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
              marginTop: 14,
            }}
          >
            {["/assets/project-placeholder-1.jpg", "/assets/project-placeholder-2.jpg"].map((src) => (
              <div
                key={src}
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(0,0,0,0.35)",
                }}
              >
                <img
                  src={src}
                  alt=""
                  style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, opacity: 0.6, fontSize: 12, letterSpacing: "0.12em" }}>
            HOVER/CLICK INTERACTIONS COMING NEXT
          </div>
        </div>

        <div style={{ height: 150 }} />

        <div
          style={{
            marginTop: 14,
            opacity: 0.65,
            letterSpacing: "0.16em",
            fontSize: 12,
            textTransform: "uppercase",
            borderTop: "1px dashed rgba(255,255,255,0.10)",
            paddingTop: 14,
          }}
        >
          Tip: click anywhere on this panel to open the full Projects page
        </div>

        <BottomChecker label="END OF PROJECTS" />
      </div>

      <div style={{ height: 220 }} />
    </>
  );
}

function PageAbout() {
  const [hovered, setHovered] = React.useState(false);

  return (
    <>
      <div style={{ letterSpacing: "0.18em", fontSize: 12, opacity: 0.7, marginBottom: 10, marginTop: 20 }}>
        Projects ↑
      </div>

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          e.preventDefault();
          console.log("About page clicked (stub)");
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            console.log("About page clicked (stub)");
          }
        }}
        style={{
          borderRadius: 18,
          padding: "22px 20px",
          background: hovered ? "rgba(10,12,16,0.62)" : "rgba(10,12,16,0.52)",
          border: hovered ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          cursor: "pointer",
          transition: "background 180ms ease, border-color 180ms ease, transform 180ms ease",
          transform: hovered ? "translateY(-1px)" : "translateY(0)",
          outline: "none",
        }}
        aria-label="Open About page"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 44, letterSpacing: "0.06em" }}>ABOUT</div>

          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              opacity: hovered ? 0.95 : 0.78,
              border: "1px solid rgba(255,255,255,0.16)",
              padding: "10px 12px",
              borderRadius: 14,
              userSelect: "none",
            }}
          >
            Click to open About →
          </div>
        </div>

        <div style={{ maxWidth: 820, lineHeight: 1.6, opacity: 0.85, marginTop: 10 }}>
          A quick snapshot of who I am and how I build.
        </div>

        <div style={{ height: 22 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          <div
            style={{
              borderRadius: 16,
              padding: 16,
              background: "rgba(10,12,16,0.45)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <div style={{ fontSize: 18, letterSpacing: "0.12em" }}>ZACKERY BEYER</div>
            <div style={{ opacity: 0.7, marginTop: 6 }}>
              CS @ Mizzou • software + systems • building useful, fun stuff
            </div>
            <div style={{ marginTop: 10, opacity: 0.82, lineHeight: 1.55 }}>
              I love problem solving and building fun stuff with code. I’m aiming to become a software engineer post
              graduation, with a focus on systems and embedded-adjacent work.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
            {[
              { k: "FOCUS", v: "SWE + Systems" },
              { k: "BEST", v: "C/C++ • Python • TS" },
              { k: "STYLE", v: "Creative + Intentional" },
            ].map((item) => (
              <div
                key={item.k}
                style={{
                  borderRadius: 16,
                  padding: 14,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div style={{ fontSize: 12, letterSpacing: "0.18em", opacity: 0.7 }}>{item.k}</div>
                <div style={{ marginTop: 8, letterSpacing: "0.08em", opacity: 0.9 }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 26 }} />

        <div style={{ fontSize: 18, letterSpacing: "0.12em" }}>HOW I BUILD</div>
        <div style={{ maxWidth: 820, lineHeight: 1.6, opacity: 0.85, marginTop: 10 }}>
          I love constantly learning and trying new things to find what works. I thrive on problem solving and love
          seeing the final product come to fruition.
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {["Learning", "Maintainable", "Efficient", "Collaborative", "Fun"].map((t) => (
            <div
              key={t}
              style={{
                fontSize: 12,
                letterSpacing: "0.08em",
                opacity: 0.85,
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {t}
            </div>
          ))}
        </div>

        <div style={{ height: 26 }} />

        <div style={{ fontSize: 18, letterSpacing: "0.12em" }}>RIGHT NOW</div>
        <div style={{ maxWidth: 820, lineHeight: 1.6, opacity: 0.85, marginTop: 10 }}>
          Building this interactive portfolio experience, shipping personal tools, and leveling up in systems +
          embedded-adjacent work.
        </div>

        <div
          style={{
            marginTop: 14,
            opacity: 0.65,
            letterSpacing: "0.16em",
            fontSize: 12,
            textTransform: "uppercase",
            borderTop: "1px dashed rgba(255,255,255,0.10)",
            paddingTop: 14,
          }}
        >
          Tip: click anywhere on this panel to open the full About page
        </div>

        <BottomChecker label="END OF ABOUT" />
      </div>

      <div style={{ height: 220 }} />
    </>
  );
}

function PageContact() {
  const [hovered, setHovered] = React.useState(false);

  return (
    <>
      <div style={{ letterSpacing: "0.18em", fontSize: 12, opacity: 0.7, marginBottom: 10, marginTop: 20 }}>
        About ↑
      </div>

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: 18,
          padding: "22px 20px",
          background: hovered ? "rgba(10,12,16,0.62)" : "rgba(10,12,16,0.52)",
          border: hovered ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          transition: "background 180ms ease, border-color 180ms ease, transform 180ms ease",
          transform: hovered ? "translateY(-1px)" : "translateY(0)",
        }}
        aria-label="Contact section"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 44, letterSpacing: "0.06em" }}>CONTACT</div>
        </div>

        <div style={{ maxWidth: 820, lineHeight: 1.6, opacity: 0.85, marginTop: 10 }}>
          Lets connect! I’m always open to chatting about new opportunities, collaborations, or just random tech talk.
        </div>

        <div style={{ height: 22 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          <div style={{ borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 18, letterSpacing: "0.12em" }}>LINKS</div>
            <div style={{ opacity: 0.7, marginTop: 6 }}>Click to open.</div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <a href="https://github.com/Zkbeyer" target="_blank" rel="noreferrer" style={linkButtonStyle(hovered)}>
                <span>GitHub</span>
                <span style={{ opacity: 0.75 }}>github.com/Zkbeyer →</span>
              </a>

              <a
                href="https://www.linkedin.com/in/zackery-beyer/"
                target="_blank"
                rel="noreferrer"
                style={linkButtonStyle(hovered)}
              >
                <span>LinkedIn</span>
                <span style={{ opacity: 0.75 }}>linkedin.com/in/zackery-beyer →</span>
              </a>

              <a
                href="/resume.pdf"
                target="_blank"
                rel="noreferrer"
                style={linkButtonStyle(hovered)}
                title="Place your resume at public/resume.pdf"
              >
                <span>Resume</span>
                <span style={{ opacity: 0.75 }}>open PDF →</span>
              </a>
            </div>

            <div
              style={{
                marginTop: 14,
                opacity: 0.65,
                letterSpacing: "0.16em",
                fontSize: 12,
                textTransform: "uppercase",
                borderTop: "1px dashed rgba(255,255,255,0.10)",
                paddingTop: 14,
              }}
            >
              Tip: put your resume at <span style={{ opacity: 0.9 }}>/public/resume.pdf</span>
            </div>
          </div>
        </div>

        <div style={{ height: 16 }} />

        <BottomChecker label="END OF CONTACT" />
      </div>

      <div style={{ height: 220 }} />
    </>
  );
}

function linkButtonStyle(hovered: boolean): React.CSSProperties {
  return {
    textDecoration: "none",
    color: "white",
    borderRadius: 14,
    padding: "12px 14px",
    border: hovered ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.04)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontSize: 12,
    display: "inline-flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  };
}

export default function ScrollSectionScene() {
  const NUM = 3;

  const { muted, toggleMute, playWhoosh, enableAudio: hookEnableAudio } = useAudio({
    whooshUrl: "/audio/whoosh.mp3",
    musicUrl: "/audio/ambient.mp3",
    whooshVolume: 0.05,
    musicVolume: 0.14,
  });

  const [audioReady, setAudioReady] = useState(false);
  const onEnableAudio = async () => {
    setAudioReady(true);
    await hookEnableAudio();
  };

  const [section, setSection] = useState(0);
  const [transition, setTransition] = useState({ active: false, from: 0, to: 0, t: 0 });

  const [pageOpacity, setPageOpacity] = useState(1);
  const [uiLocked, setUiLocked] = useState(false);

  const scrollHostRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollMax, setScrollMax] = useState(0);
  const rafScrollRef = useRef(0);

  useEffect(() => {
    const host = scrollHostRef.current;
    if (!host) return;
    setScrollTop(host.scrollTop);
    setScrollMax(Math.max(0, host.scrollHeight - host.clientHeight));
  }, [section]);

  const transitioningRef = useRef(false);
  const wheelBlockUntilRef = useRef(0);
  const swappedMidRef = useRef(false);

  const TRANSITION_SEC = 0.95;

  useEffect(() => {
    if (!transition.active) return;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      setTransition((prev) => {
        const nextT = prev.t + dt / TRANSITION_SEC;
        if (nextT >= 1) return { ...prev, t: 1 };
        return { ...prev, t: nextT };
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [transition.active]);

  useEffect(() => {
    if (!transition.active) {
      setPageOpacity(1);
      return;
    }
    const t = clamp01(transition.t);
    setPageOpacity(1 - Math.sin(Math.PI * t));
  }, [transition.active, transition.t]);

  useEffect(() => {
    if (!transition.active) return;
    if (swappedMidRef.current) return;

    if (transition.t >= 0.5) {
      swappedMidRef.current = true;
      const nextSection = transition.to;

      setSection(nextSection);

      const host = scrollHostRef.current;
      if (host) host.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [transition.active, transition.t, transition.to]);

  useEffect(() => {
    if (!transition.active) return;
    if (transition.t < 1) return;

    const finalSection = transition.to;
    setTransition({ active: false, from: finalSection, to: finalSection, t: 0 });
    setUiLocked(false);

    wheelBlockUntilRef.current = performance.now() + 450;
    transitioningRef.current = false;
  }, [transition.active, transition.t, transition.to]);

  const startTransitionTo = (to: number) => {
    if (transitioningRef.current) return;
    if (transition.active || uiLocked) return;

    const from = section;
    const next = wrapIndex(to, NUM);

    if (next === from) {
      scrollHostRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      transitioningRef.current = false;
      return;
    }

    transitioningRef.current = true;
    swappedMidRef.current = false;
    setUiLocked(true);
    wheelBlockUntilRef.current = performance.now() + 900;
    playWhoosh?.();
    setTransition({ active: true, from, to: next, t: 0 });
  };

  const goNext = () => startTransitionTo(section + 1);
  const goPrev = () => startTransitionTo(section - 1);

  // Transition when the bottom sentinel enters view (near bottom).
  useEffect(() => {
    const host = scrollHostRef.current;
    const sentinel = sentinelRef.current;
    if (!host || !sentinel) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (transition.active) return;
        for (const e of entries) {
          if (e.isIntersecting) {
            const nearBottom = host.scrollTop + host.clientHeight >= host.scrollHeight - 8;
            if (nearBottom) goNext();
          }
        }
      },
      { root: host, threshold: 0.65 }
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, [section, transition.active]);

  // At top/bottom, wheel can move to prev/next section.
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

      if (e.deltaY > 0 && atBottom) {
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

  const contentWrapStyle = useMemo<React.CSSProperties>(() => {
    const base: React.CSSProperties = { maxWidth: 820, width: "min(820px, 92%)" };

    if (section === 0) return { ...base, marginLeft: "auto", marginRight: 14 }; // right
    if (section === 1) return { ...base, marginLeft: "auto", marginRight: "auto" }; // center
    return { ...base, marginLeft: 14, marginRight: "auto" }; // left
  }, [section]);

  const onSelectSection = (i: number) => {
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

      <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none" }}>
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

      <div
        ref={scrollHostRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          if (rafScrollRef.current) return;
          rafScrollRef.current = requestAnimationFrame(() => {
            rafScrollRef.current = 0;
            setScrollTop(el.scrollTop);
            setScrollMax(Math.max(0, el.scrollHeight - el.clientHeight));
          });
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 5,
          overflowY: transition.active || uiLocked ? "hidden" : "auto",
          overflowX: "hidden",
          padding: "150px 4vw 150px",
          boxSizing: "border-box",
          color: "rgba(255,255,255,0.88)",
          fontFamily: "ui-sans-serif, system-ui",
          opacity: pageOpacity,
          pointerEvents: pageOpacity < 0.02 ? "none" : "auto",
        }}
      >
        <div style={contentWrapStyle}>{Page}</div>
        <div ref={sentinelRef} style={{ height: 2 }} />
      </div>

      <Canvas style={{ width: "100%", height: "100%" }}>
        <Scene section={section} transition={transition} />
      </Canvas>

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