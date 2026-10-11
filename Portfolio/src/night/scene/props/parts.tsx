import { useMemo, type ReactNode } from "react";
import { Quaternion, Vector3 } from "three";
import type { Vec3 } from "../layout";

const UP = new Vector3(0, 1, 0);

/** A cylinder spanning two points (lamp arms, telescope legs, cables). */
export function Rod({
  from,
  to,
  radius,
  radiusTop,
  segments = 10,
  children,
}: {
  from: Vec3;
  to: Vec3;
  radius: number;
  radiusTop?: number;
  segments?: number;
  children: ReactNode;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new Vector3(...from);
    const b = new Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    return {
      position: a.add(b).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(UP, dir.normalize()),
      length: len,
    };
  }, [from, to]);
  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radiusTop ?? radius, radius, length, segments]} />
      {children}
    </mesh>
  );
}

/** Plain matte material in a palette colour. */
export function Matte({ color, roughness = 0.85, metalness = 0 }: { color: string; roughness?: number; metalness?: number }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />;
}
