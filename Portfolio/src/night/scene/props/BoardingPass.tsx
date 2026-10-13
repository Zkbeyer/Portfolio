import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import { WALL_Z, WINDOW } from "../layout";
import { useDisposable } from "../../hooks/useDisposable";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { PASS_H, PASS_W, boardingPassTexture } from "./boardingPassTexture";

const W = 0.25;
const H = (W * PASS_H) / PASS_W;
/** On the sill between the model plane and the bonsai, turned toward the "plane" close-up. */
const BASE: [number, number, number] = [1.86, WINDOW.y0 + 0.002, WALL_Z + 0.12];
const YAW = -0.15;
const LYING = -Math.PI / 2 + 0.02; // flat on the sill (barely lifted so it never z-fights)
const PROPPED = -0.24; // leaning back against the glass

/**
 * The model plane's "look closer" content: a boarding pass that lies flat on the sill and stands up,
 * hinged at its bottom edge, when the plane is focused (Mizzou → Garmin 2027 + the internship line).
 * Lifts a little on hover so it hints that there's something to read.
 */
export function BoardingPass({ open, hover }: { open: boolean; hover: boolean }) {
  const reduced = usePrefersReducedMotion();
  const hinge = useRef<Group>(null);
  const map = useDisposable(() => boardingPassTexture(), []);
  const target = open ? PROPPED : hover ? LYING + 0.35 : LYING;

  useFrame((_, delta) => {
    const g = hinge.current;
    if (!g) return;
    g.rotation.x = reduced ? target : MathUtils.damp(g.rotation.x, target, 6, Math.min(delta, 0.1));
  });

  return (
    <group position={BASE} rotation={[0, YAW, 0]}>
      <group ref={hinge} rotation={[LYING, 0, 0]}>
        <mesh position={[0, H / 2, 0]}>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial
            map={map}
            emissiveMap={map}
            emissive="#ffffff"
            emissiveIntensity={0.28}
            roughness={0.85}
            side={2}
          />
        </mesh>
      </group>
    </group>
  );
}
