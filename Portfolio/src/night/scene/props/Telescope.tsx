import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, Vector3 } from "three";
import { ANCHORS, WINDOW_CENTER, type Vec3 } from "../layout";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { Matte, Rod } from "./parts";

const TUBE = "#E9DCC3";
const BRASS = "#C9A25E";
const DARK = "#2A2724";
const MOUNT_H = 0.98; // floor-standing tripod (round-3 layout)
const LEG_SPREAD = 0.3;

/** Where the telescope rests: up through the window at the sky above the skyline. */
const AIM = new Vector3(WINDOW_CENTER[0] + 0.2, WINDOW_CENTER[1] + 0.9, WINDOW_CENTER[2] - 1.5);

/**
 * Floor-standing refractor on a tripod by the window (→ about). It leans a little toward the cursor; `active` lets it
 * follow further.
 */
export function Telescope({ active = false }: { active?: boolean }) {
  const reduced = usePrefersReducedMotion();
  const tube = useRef<Group>(null);
  const aim = useRef(AIM.clone());
  const desired = useRef(new Vector3());
  const [x, y, z] = ANCHORS.telescope;
  const mount: Vec3 = [x, y + MOUNT_H, z];

  const feet = useMemo(
    () =>
      [0.6, 2.7, 4.8].map((a) => [x + Math.cos(a) * LEG_SPREAD, y + 0.003, z + Math.sin(a) * LEG_SPREAD] as Vec3),
    [x, y, z],
  );

  useFrame((state, delta) => {
    const g = tube.current;
    if (!g) return;
    const reach = active ? 1.6 : 0.7;
    const px = reduced ? 0 : state.pointer.x * reach;
    const py = reduced ? 0 : state.pointer.y * reach * 0.6;
    desired.current.set(AIM.x + px, AIM.y + py, AIM.z);
    const lambda = reduced ? 1e3 : 2;
    const dt = Math.min(delta, 0.1);
    aim.current.x = MathUtils.damp(aim.current.x, desired.current.x, lambda, dt);
    aim.current.y = MathUtils.damp(aim.current.y, desired.current.y, lambda, dt);
    aim.current.z = desired.current.z;
    g.lookAt(aim.current);
  });

  return (
    <group>
      {feet.map((f, i) => (
        <group key={i}>
          <Rod from={mount} to={f} radius={0.011} segments={8}>
            <Matte color={DARK} roughness={0.5} metalness={0.4} />
          </Rod>
          <mesh position={f}>
            <sphereGeometry args={[0.009, 8, 6]} />
            <Matte color={DARK} />
          </mesh>
        </group>
      ))}
      <mesh position={mount}>
        <cylinderGeometry args={[0.02, 0.024, 0.03, 14]} />
        <Matte color={DARK} roughness={0.4} metalness={0.5} />
      </mesh>

      {/* the optical tube points along +z, so lookAt aims it */}
      <group ref={tube} position={[x, y + MOUNT_H + 0.03, z]} scale={1.25}>
        <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.036, 0.03, 0.44, 24]} />
          <Matte color={TUBE} roughness={0.45} />
        </mesh>
        {/* dew shield + brass rings */}
        <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.041, 0.039, 0.05, 24, 1, true]} />
          <Matte color={DARK} roughness={0.5} />
        </mesh>
        {[0.27, -0.12].map((rz) => (
          <mesh key={rz} position={[0, 0, rz]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.038, 0.038, 0.012, 24]} />
            <Matte color={BRASS} roughness={0.3} metalness={0.7} />
          </mesh>
        ))}
        {/* objective lens */}
        <mesh position={[0, 0, 0.29]}>
          <circleGeometry args={[0.034, 24]} />
          <meshStandardMaterial color="#2A3A48" roughness={0.05} metalness={0.6} />
        </mesh>
        {/* focuser + eyepiece, angled up at the back */}
        <mesh position={[0, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.05, 14]} />
          <Matte color={DARK} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.03, -0.205]} rotation={[0.6, 0, 0]}>
          <cylinderGeometry args={[0.011, 0.011, 0.05, 12]} />
          <Matte color={BRASS} roughness={0.3} metalness={0.7} />
        </mesh>
        {/* finder scope */}
        <mesh position={[0, 0.05, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.009, 0.008, 0.13, 10]} />
          <Matte color={DARK} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
