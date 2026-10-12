import { useMemo } from "react";
import { Color, DoubleSide, BackSide, Quaternion, Vector3 } from "three";
import { PALETTE } from "../../palette";
import { ANCHORS, type Vec3 } from "../layout";
import { Matte, Rod } from "./parts";

const ARM = "#2E2B28"; // charcoal arms
const SHADE = "#D9A441"; // mustard MCM shade

/** Articulated desk lamp. Its light lives in Lighting.tsx; this is the visible fixture + glowing bulb. */
export function Lamp() {
  const [bx, by, bz] = ANCHORS.lamp;
  const head = ANCHORS.lampHead;
  const elbow: Vec3 = [bx - 0.08, 1.24, bz + 0.03];
  const shoulder: Vec3 = [bx, by + 0.05, bz];
  const neck: Vec3 = [head[0] - 0.06, head[1] + 0.05, head[2] - 0.02];

  // the shade opens toward the same spot Lighting.tsx aims the spotlight at
  const { quaternion, bulb } = useMemo(() => {
    const target = new Vector3(head[0] + 0.45, ANCHORS.lamp[1], head[2] + 0.1);
    const dir = target.sub(new Vector3(...head)).normalize();
    return {
      quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, -1, 0), dir),
      bulb: new Vector3(...head).addScaledVector(dir, 0.035).toArray() as Vec3,
    };
  }, [head]);

  const bulbColor = useMemo(() => new Color(PALETTE.lamp).multiplyScalar(5), []);
  const innerColor = useMemo(() => new Color(PALETTE.lamp).multiplyScalar(1.25), []);

  return (
    <group>
      <mesh position={[bx, by + 0.012, bz]}>
        <cylinderGeometry args={[0.085, 0.095, 0.024, 28]} />
        <Matte color={ARM} roughness={0.5} metalness={0.3} />
      </mesh>
      <Rod from={shoulder} to={elbow} radius={0.011}>
        <Matte color={ARM} roughness={0.45} metalness={0.4} />
      </Rod>
      <Rod from={elbow} to={neck} radius={0.011}>
        <Matte color={ARM} roughness={0.45} metalness={0.4} />
      </Rod>
      {[shoulder, elbow, neck].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.02, 12, 10]} />
          <Matte color={PALETTE.ink} roughness={0.4} metalness={0.5} />
        </mesh>
      ))}

      <group position={head} quaternion={quaternion}>
        {/* outer shade */}
        <mesh position={[0, -0.02, 0]}>
          <coneGeometry args={[0.1, 0.15, 32, 1, true]} />
          <meshStandardMaterial color={SHADE} emissive={PALETTE.lamp} emissiveIntensity={0.12} roughness={0.6} side={DoubleSide} />
        </mesh>
        {/* lit inside of the shade */}
        <mesh position={[0, -0.022, 0]} scale={0.97}>
          <coneGeometry args={[0.1, 0.15, 32, 1, true]} />
          <meshBasicMaterial color={innerColor} side={BackSide} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.022, 0.03, 0.03, 16]} />
          <Matte color={SHADE} roughness={0.6} />
        </mesh>
      </group>
      <mesh position={bulb}>
        <sphereGeometry args={[0.03, 16, 12]} />
        <meshBasicMaterial color={bulbColor} toneMapped={false} />
      </mesh>
    </group>
  );
}
