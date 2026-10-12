import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import { PALETTE } from "../../palette";
import { ANCHORS } from "../layout";
import { useSceneTime } from "../../hooks/useSceneTime";
import { Matte } from "./parts";

const BODY = "#E9E1D2";
const CHROME = "#C9C6BF";

/**
 * Vintage tin model plane on a little stand on the window sill (→ work, "the day job").
 * The propeller idles slowly and spins up on hover/focus. The real plane outside is just an easter egg now.
 */
export function ModelPlane({ active = false }: { active?: boolean }) {
  const time = useSceneTime();
  const prop = useRef<Group>(null);
  const spin = useRef(0.4);
  const lastT = useRef(0);
  const [x, y, z] = ANCHORS.modelPlane;

  useFrame((_, delta) => {
    const t = time.current;
    const dt = Math.max(0, t - lastT.current);
    lastT.current = t;
    spin.current = MathUtils.damp(spin.current, active ? 18 : 0.4, 3, Math.min(delta, 0.1));
    if (prop.current) prop.current.rotation.x += dt * spin.current;
  });

  return (
    <group position={[x, y, z]} rotation={[0, 0.55, 0]}>
      {/* stand */}
      <mesh position={[0, 0.006, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.012, 20]} />
        <Matte color={PALETTE.walnut} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.07, 6]} />
        <meshStandardMaterial color={CHROME} metalness={0.85} roughness={0.3} />
      </mesh>
      {/* the plane, nose to +x, slight climb */}
      <group position={[0, 0.088, 0]} rotation={[0, 0, 0.12]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.016, 0.13, 6, 14]} />
          <Matte color={BODY} roughness={0.45} />
        </mesh>
        {/* accent cheat line along the fuselage + accent nose */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1.03, 0.35, 1.03]}>
          <cylinderGeometry args={[0.0162, 0.0162, 0.13, 14, 1, true]} />
          <Matte color={PALETTE.accent} roughness={0.5} />
        </mesh>
        <mesh position={[0.088, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.015, 0.02, 14]} />
          <Matte color={PALETTE.accent} roughness={0.5} />
        </mesh>
        {/* wings with accent tips */}
        <mesh position={[0.012, -0.004, 0]}>
          <boxGeometry args={[0.045, 0.005, 0.2]} />
          <Matte color={BODY} roughness={0.45} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.012, -0.004, s * 0.095]}>
            <boxGeometry args={[0.046, 0.0055, 0.012]} />
            <Matte color={PALETTE.accent} roughness={0.5} />
          </mesh>
        ))}
        {/* tail */}
        <mesh position={[-0.078, 0.004, 0]}>
          <boxGeometry args={[0.025, 0.004, 0.075]} />
          <Matte color={BODY} roughness={0.45} />
        </mesh>
        <mesh position={[-0.08, 0.022, 0]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[0.028, 0.035, 0.004]} />
          <Matte color={PALETTE.accent} roughness={0.5} />
        </mesh>
        {/* propeller */}
        <group ref={prop} position={[0.1, 0, 0]}>
          {[0, 1].map((i) => (
            <mesh key={i} rotation={[(i * Math.PI) / 2, 0, 0]}>
              <boxGeometry args={[0.003, 0.06, 0.008]} />
              <meshStandardMaterial color={CHROME} metalness={0.85} roughness={0.3} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
