import { useEffect, useState } from "react";
import { Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { ANCHORS, type Vec3 } from "../layout";
import { useLightsOn } from "../lights";
import { flipLights } from "../../ui/actions";

const proxy = { transparent: true, opacity: 0, depthWrite: false, colorWrite: false } as const;

/** Click targets on the desk lamp (head + base) and the paper floor lamp: each one flips the room lights. */
const TARGETS: { center: Vec3; size: Vec3; label: Vec3 }[] = [
  { center: ANCHORS.lampHead, size: [0.26, 0.22, 0.26], label: [ANCHORS.lampHead[0], ANCHORS.lampHead[1] + 0.2, ANCHORS.lampHead[2]] },
  { center: [ANCHORS.lamp[0], ANCHORS.lamp[1] + 0.05, ANCHORS.lamp[2]], size: [0.22, 0.12, 0.22], label: [ANCHORS.lamp[0], ANCHORS.lamp[1] + 0.22, ANCHORS.lamp[2]] },
  { center: [0.7, 0.95, -1.36], size: [0.38, 0.86, 0.38], label: [0.7, 1.5, -1.36] },
];

export function LightSwitch() {
  const on = useLightsOn();
  const [hover, setHover] = useState<number | null>(null);
  useEffect(
    () => () => {
      document.body.style.cursor = "";
    },
    [],
  );
  const over = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(i);
    document.body.style.cursor = "pointer";
  };
  const out = () => {
    setHover(null);
    document.body.style.cursor = "";
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    flipLights();
  };
  return (
    <group>
      {TARGETS.map((t, i) => (
        <mesh key={i} position={t.center} onPointerOver={over(i)} onPointerOut={out} onClick={click}>
          <boxGeometry args={t.size} />
          <meshBasicMaterial {...proxy} />
        </mesh>
      ))}
      {hover !== null && (
        <Html position={TARGETS[hover].label} center zIndexRange={[20, 0]} pointerEvents="none" className="night-label-anchor">
          <span className="night-label hand is-active">{on ? "lights off" : "lights on"}</span>
        </Html>
      )}
    </group>
  );
}
