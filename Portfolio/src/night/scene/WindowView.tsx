import { useMemo } from "react";
import { BufferAttribute, Color, PlaneGeometry } from "three";
import { PALETTE } from "../palette";
import { WALL_Z, WINDOW_CENTER } from "./layout";

/**
 * Placeholder view through the window: vertical sky gradient + moon.
 * P2 replaces this with the sky shader, skyline layers, plane flyby and rain glass.
 */
export function WindowView() {
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(8, 5, 1, 2);
    const stops = [PALETTE.skyTop, PALETTE.skyMid, PALETTE.skyLow].map((c) => new Color(c));
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const t = (pos.getY(i) + 2.5) / 5; // 0 bottom → 1 top
      const c = t > 0.5 ? stops[1].clone().lerp(stops[0], (t - 0.5) * 2) : stops[2].clone().lerp(stops[1], t * 2);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new BufferAttribute(colors, 3));
    return g;
  }, []);

  const z = WALL_Z - 0.9;
  return (
    <group>
      <mesh geometry={geometry} position={[WINDOW_CENTER[0], WINDOW_CENTER[1] + 0.4, z - 0.05]}>
        <meshBasicMaterial vertexColors />
      </mesh>
      {/* moon (over-bright so Bloom picks it up) */}
      <mesh position={[2.2, 2.45, z + 0.05]}>
        <circleGeometry args={[0.12, 40]} />
        <meshBasicMaterial color={new Color(PALETTE.moon).multiplyScalar(2.2)} toneMapped={false} />
      </mesh>
    </group>
  );
}
