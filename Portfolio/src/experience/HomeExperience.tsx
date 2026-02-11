import { useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";

import HomeOverlay from "../pages/Home/HomeOverlay";
import HomeScene from "../scenes/HomeScene";
import AudioGate from "../components/Audio/AudioGate";
import MouseHUD from "../components/MouseHUD/MouseHUD";
import { useAudio } from "../components/Audio/useAudio";
import useSectionScroller from "../hooks/useSectionScroller";

import PageProjects from "../pages/Home/sections/PageProjects";
import PageAbout from "../pages/Home/sections/PageAbout";
import PageContact from "../pages/Home/sections/PageContact";

import "../pages/Home/Home.css";
import "../pages/Home/sections.css";
import "../pages/Home/transition.css";

export default function HomeExperience() {
  const NUM = 3;

  const { enabled, muted, toggleMute, playWhoosh, enableAudio, setAmbience } = useAudio({
    whooshUrl: "/audio/whoosh.mp3",
    whooshVolume: 0.15,
    musicVolume: 0.30,
  });

  // Always set the HOME ambience for this experience
  useEffect(() => {
    setAmbience?.("HOME");
  }, [setAmbience]);

  // Called by AudioGate – must be a direct user gesture
  const onEnableAudio = async () => {
    await enableAudio();
    setAmbience?.("HOME");
  };



  const {
    section,
    transition,
    pageOpacity,
    uiLocked,
    scrollHostRef,
    sentinelRef,
    onSelectSection,
  } = useSectionScroller({
    numSections: NUM,
    onWhoosh: playWhoosh,
  });

  const Page = useMemo(() => {
    if (section === 0) return <PageProjects />;
    if (section === 1) return <PageAbout />;
    return <PageContact />;
  }, [section]);

  const sectionAlignClass =
    section === 0 ? "sectionAlignRight" : section === 1 ? "sectionAlignCenter" : "sectionAlignLeft";

  return (
    
    <div className="homeRoot">
      <MouseHUD />

      <AudioGate visible={!enabled} onEnable={onEnableAudio} />

      <div className="homeOverlayLayer">
        <div className="homeOverlayPointer">
          <HomeOverlay
            activeIndex={section}
            numSections={NUM}
            onSelectIndex={onSelectSection}
            onToggleMusic={toggleMute}
            musicMuted={muted}
          />
        </div>
      </div>

      <div
        ref={scrollHostRef}
        className={`homeScrollHost ${uiLocked ? "isLocked" : ""}`}
        style={{ opacity: pageOpacity }}
      >
        <div className={`sectionWrap ${sectionAlignClass}`}>{Page}</div>
        <div ref={sentinelRef} className="homeSentinel" />
      </div>

      <Canvas className="homeCanvas">
        <HomeScene section={section} transition={transition} />
      </Canvas>

      {(transition.active || uiLocked) && <div className="transitionDim" aria-hidden />}
    </div>
  );
}