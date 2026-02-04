import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { RoundedBox } from "@react-three/drei";

export function SectionWidgets3D({
  activeIndex,
  onHoverPrompt,
  onOpenSection,
}: {
  activeIndex: number;
  onHoverPrompt?: (prompt: string | null) => void;
  onOpenSection?: (index: number) => void;
}) {
  const widgetPoses = useMemo(
    () => [
      // Section 0 (Projects)
      { pos: [.7, 0, -2.5] as [number, number, number], rot: [0, .2, 0] as [number, number, number], scale: .5 },

      // Section 1 (About)
      { pos: [1.4, -.01, -2.9] as [number, number, number], rot: [0, .4, 0] as [number, number, number], scale: 0.3},

      // Section 2 (Contact)
      { pos: [-.2, 0, -2.5] as [number, number, number], rot: [0, 0, -.05] as [number, number, number], scale: 0.5 },
    ],
    []
  );

  const t = widgetPoses[activeIndex] ?? widgetPoses[0];

  return (
    <group position={t.pos} rotation={t.rot} scale={t.scale}>
      {activeIndex === 0 && (
        <ProjectsWidget3D
          onHoverPrompt={onHoverPrompt}
          onOpen={() => onOpenSection?.(0)}
        />
      )}
      {activeIndex === 1 && (
        <AboutWidget3D
          onHoverPrompt={onHoverPrompt}
          onOpen={() => onOpenSection?.(1)}
        />
      )}
      {activeIndex === 2 && (
        <ContactWidget3D
          onHoverPrompt={onHoverPrompt}
          onOpen={() => onOpenSection?.(2)}
        />
      )}
    </group>
  );
}

function BasePanel({
  title,
  subtitle,
  accent,
  onHoverPrompt,
  onOpen,
  children,
}: {
  title: string;
  subtitle: string;
  accent: string;
  onHoverPrompt?: (prompt: string | null) => void;
  onOpen?: () => void;
  children?: React.ReactNode;
}) {
    const setCursor = (c: string) => {document.body.style.cursor = c;};
  const [hovered, setHovered] = useState(false);

  const bgColor = "#ffab8c";
  const textMain = hovered ? "rgba(46, 33, 33, 0.6)": "rgba(66, 47, 47, 0.6)";
  const textSub = "rgba(88, 64, 64, 0.6)";

  const FONT_TITLE = "/AtkinsonHyperlegible-Regular.ttf";

  return (
    <group >
      {/* main panel */}
      <RoundedBox
        args={[2.2, 1.25, 0.08]}
        radius={0.14}
        smoothness={8}
        onPointerOver={() => {
          setHovered(true);
          setCursor("pointer");
          onHoverPrompt?.(`Click to open ${title}`);
        }}
        onPointerOut={() => {
          setHovered(false);
          setCursor("default");
          onHoverPrompt?.(null);
        }}
        onClick={() => onOpen?.()}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={bgColor}
          metalness={0.25}
          roughness={0.35}
          emissive={new THREE.Color(accent)}
          emissiveIntensity={hovered ? 0.50 : 0.40}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </RoundedBox>


      {/* Title text */}
      <Text
        position={[-0.95, 0.40, 0.065]}
        fontSize={0.14}
        font={FONT_TITLE}
        color={textMain}
        anchorX="left"
        anchorY="middle"
      >
        {title.toUpperCase()}
      </Text>

      {/* Subtitle text */}
      <Text
        position={[-0.95, 0.22, 0.065]}
        fontSize={0.072}
        font={FONT_TITLE}
        color={textSub}
        anchorX="left"
        anchorY="middle"
      >
        {subtitle}
      </Text>

      {/* Content area */}
      <group position={[-0.95, -0.02, 0.065]}>{children}</group>

      {/* Hover hint inside 3D */}
      {hovered && (
        <Text
          position={[-0.95, -0.52, 0.065]}
          fontSize={0.045}
          font={FONT_TITLE}
          color="rgba(43, 23, 23, 0.6)"
          anchorX="left"
          anchorY="middle"
        >
          *CLICK TO LEARN MORE
        </Text>
      )}
    </group>
  );
}





function ProjectsWidget3D({
  onHoverPrompt,
  onOpen,
}: {
  onHoverPrompt?: (prompt: string | null) => void;
  onOpen?: () => void;
}) {
  return (
    <BasePanel
      title="Projects"
      subtitle="Featured Projects"
      accent="#bbb2a0"
      onHoverPrompt={onHoverPrompt}
      onOpen={onOpen}
    >

      {/* Menu-style selector */}
      <Text position={[0, 0.04, 0]} fontSize={0.085} color="rgba(88, 64, 64, 0.6)" anchorX="left">
        SPOTIFY REWIND
      </Text>

      <Text position={[0.06, -0.10, 0]} fontSize={0.065} color="rgba(88, 64, 64, 0.6)" anchorX="left">
        your personal year-in-review
      </Text>

      {/* Small metadata block */}
      <Text position={[0, -0.24, 0]} fontSize={0.055} color="rgba(88, 64, 64, 0.6)" anchorX="left">
        STACK: React • Node • API
      </Text>
    </BasePanel>
  );
}

function AboutWidget3D({
  onHoverPrompt,
  onOpen,
}: {
  onHoverPrompt?: (prompt: string | null) => void;
  onOpen?: () => void;
}) {
  return (
    <BasePanel
      title="ABOUT"
      subtitle="ZACKERY BEYER"
      accent="rgb(138, 114, 114)"
      onHoverPrompt={onHoverPrompt}
      onOpen={onOpen}
    >


      {/* Bold identity line */}
      <Text position={[0, -0.06, 0]} fontSize={0.075} color="rgba(88, 64, 64, 0.6)" anchorX="left">
         CS @ MIZZOU • SOFTWARE DEV
      </Text>

      {/* Skill readout block */}
      <Text position={[0, -0.20, 0]} fontSize={0.065} color="rgba(88, 64, 64, 0.6)" anchorX="left">
        FAVORITE LANG: C/C++ • C# • Python
      </Text>
    </BasePanel>
  );
}

function ContactWidget3D({
  onHoverPrompt,
  onOpen,
}: {
  onHoverPrompt?: (prompt: string | null) => void;
  onOpen?: () => void;
}) {
  return (
    <BasePanel
      title="CONTACT"
      subtitle="GET IN TOUCH"
      accent="#494975"
      onHoverPrompt={onHoverPrompt}
      onOpen={onOpen}
    >
      {/* "channel info" vibe */}
      <Text position={[0, 0.18, 0]} fontSize={0.06} color="rgba(88, 64, 64, 0.6)" anchorX="left">
        LET'S CONNECT
      </Text>
      {/* Bold identity line */}
      <Text position={[0, -0.06, 0]} fontSize={0.075} color="rgba(88, 64, 64, 0.6)" anchorX="left">
         HOW TO FIND MY STUFF:
      </Text>

      {/* Skill readout block */}
      <Text position={[0, -0.20, 0]} fontSize={0.065} color="rgba(88, 64, 64, 0.6)" anchorX="left">
        GITHUB • LINKEDIN • EMAIL
      </Text>

    </BasePanel>
  );
}