import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Group, MathUtils, MeshBasicMaterial } from "three";
import { OUTSIDE } from "../layout";
import { FROZEN_TIME, useSceneTime } from "../../hooks/useSceneTime";
import { useDisposable } from "../../hooks/useDisposable";
import { planeState } from "./planeState";

/** Seconds for one crossing, and how often a crossing starts. */
const CROSSING = 11;
const PERIOD = 21;
// Phase offset so the reduced-motion still frame catches the plane mid-window,
// and a normal visit sees the first crossing ~8s after load.
const PHASE = (CROSSING * 0.55 - (FROZEN_TIME % PERIOD) + PERIOD) % PERIOD;

const SILHOUETTE = "#0B0A1C";

function useGlow(hex: string) {
  const base = useMemo(() => new Color(hex), [hex]);
  const material = useDisposable(() => new MeshBasicMaterial({ color: base.clone(), toneMapped: false }), [base]);
  return { base, material };
}

/** A small airliner silhouette crossing the sky every ~20s with nav lights, strobe and beacon. */
export function Plane() {
  const time = useSceneTime();
  const group = useRef<Group>(null);
  const body = useDisposable(() => new MeshBasicMaterial({ color: SILHOUETTE }), []);

  const port = useGlow("#FF3B3B"); // left wing (far side when flying +x)
  const starboard = useGlow("#3BFF7A"); // right wing (near side)
  const strobe = useGlow("#FFFFFF");
  const beacon = useGlow("#FF5040");

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const t = time.current;
    const phase = (t + PHASE) % PERIOD;
    const p = phase / CROSSING;
    const visible = p <= 1;
    g.visible = visible;
    planeState.visible = visible;
    planeState.progress = Math.min(p, 1);
    if (!visible) return;

    const { z, x0, x1, y0, y1 } = OUTSIDE.plane;
    const x = MathUtils.lerp(x0, x1, p);
    const y = MathUtils.lerp(y0, y1, p) + Math.sin(t * 0.7) * 0.02;
    g.position.set(x, y, z);
    g.rotation.z = 0.05 + Math.sin(t * 0.5) * 0.015; // slight climb attitude
    planeState.position.copy(g.position);

    port.material.color.copy(port.base).multiplyScalar(2.2);
    starboard.material.color.copy(starboard.base).multiplyScalar(2.2);
    const strobeOn = (t % 1.3) < 0.07;
    strobe.material.color.copy(strobe.base).multiplyScalar(strobeOn ? 4.5 : 0.0);
    const beaconP = ((t + 0.5) % 1.05) / 1.05;
    beacon.material.color.copy(beacon.base).multiplyScalar(0.15 + 3 * Math.exp(-Math.pow((beaconP - 0.1) * 10, 2)));
  });

  return (
    <group ref={group} visible={false}>
      {/* fuselage, tail fin, wings and stabiliser — seen from below and slightly behind */}
      <mesh material={body}>
        <capsuleGeometry args={[0.022, 0.32, 4, 10]} />
      </mesh>
      <mesh material={body} position={[-0.15, 0.045, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.07, 0.07, 0.008]} />
      </mesh>
      <mesh material={body} position={[0.02, -0.006, 0]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.09, 0.008, 0.36]} />
      </mesh>
      <mesh material={body} position={[-0.15, 0.01, 0]}>
        <boxGeometry args={[0.04, 0.006, 0.16]} />
      </mesh>
      {/* lights */}
      <mesh material={port.material} position={[-0.01, -0.006, -0.18]}>
        <sphereGeometry args={[0.02, 8, 6]} />
      </mesh>
      <mesh material={starboard.material} position={[0.01, -0.006, 0.18]}>
        <sphereGeometry args={[0.02, 8, 6]} />
      </mesh>
      <mesh material={strobe.material} position={[-0.2, 0.02, 0]}>
        <sphereGeometry args={[0.022, 8, 6]} />
      </mesh>
      <mesh material={beacon.material} position={[0.02, -0.03, 0]}>
        <sphereGeometry args={[0.018, 8, 6]} />
      </mesh>
    </group>
  );
}
