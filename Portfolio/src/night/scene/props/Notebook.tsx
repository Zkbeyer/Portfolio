import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, Group, MathUtils, MeshStandardMaterial } from "three";
import { PALETTE } from "../../palette";
import { ANCHORS } from "../layout";
import { useSceneTime } from "../../hooks/useSceneTime";
import { useDisposable } from "../../hooks/useDisposable";
import { Matte } from "./parts";
import { paperTexture } from "./paperTexture";

const PAGE = { w: 0.17, d: 0.235 } as const;
const COVER = "#3A3430"; // charcoal linen cover
const PAGE_SLOPE = 0.025;

function usePaper(seed: number, ink: number) {
  const map = useDisposable(() => paperTexture(seed, ink), [seed, ink]);
  return useDisposable(() => new MeshStandardMaterial({ map, roughness: 0.95, side: DoubleSide }), [map]);
}

/**
 * Open notebook (→ resume). With `active` (hover) the top right page lifts and flutters.
 */
export function Notebook({ active = false }: { active?: boolean }) {
  const time = useSceneTime();
  const flutter = useRef<Group>(null);
  const lift = useRef(0);
  const [x, y, z] = ANCHORS.notebook;
  const left = usePaper(3, 0.8);
  const under = usePaper(9, 0.6); // revealed when the top page lifts
  const top = usePaper(5, 0.45);

  useFrame((_, delta) => {
    const g = flutter.current;
    if (!g) return;
    lift.current = MathUtils.damp(lift.current, active ? 1 : 0, 5, Math.min(delta, 0.1));
    const t = time.current;
    const wobble = Math.sin(t * 7) * 0.12 + Math.sin(t * 11.3) * 0.06;
    g.rotation.z = PAGE_SLOPE + lift.current * (0.55 + wobble);
  });

  return (
    <group position={[x, y, z]} rotation={[0, -0.22, 0]}>
      {/* cover */}
      <mesh position={[0, 0.003, 0]}>
        <boxGeometry args={[PAGE.w * 2 + 0.016, 0.006, PAGE.d + 0.012]} />
        <Matte color={COVER} roughness={0.7} />
      </mesh>
      {/* page blocks, very slightly sloped toward the spine */}
      <group position={[-PAGE.w / 2 - 0.002, 0.0095, 0]} rotation={[0, 0, -PAGE_SLOPE]}>
        <mesh>
          <boxGeometry args={[PAGE.w, 0.007, PAGE.d]} />
          <Matte color="#E3D8C4" />
        </mesh>
        <mesh position={[0, 0.0036, 0]} rotation={[-Math.PI / 2, 0, 0]} material={left}>
          <planeGeometry args={[PAGE.w, PAGE.d]} />
        </mesh>
      </group>
      <group position={[PAGE.w / 2 + 0.002, 0.0095, 0]} rotation={[0, 0, PAGE_SLOPE]}>
        <mesh>
          <boxGeometry args={[PAGE.w, 0.007, PAGE.d]} />
          <Matte color="#E3D8C4" />
        </mesh>
        <mesh position={[0, 0.0036, 0]} rotation={[-Math.PI / 2, 0, 0]} material={under}>
          <planeGeometry args={[PAGE.w, PAGE.d]} />
        </mesh>
      </group>
      {/* the page that flutters: pivots on the spine */}
      <group ref={flutter} position={[0.002, 0.0118, 0]} rotation={[0, 0, PAGE_SLOPE]}>
        <mesh position={[PAGE.w / 2, 0.0002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={top}>
          <planeGeometry args={[PAGE.w, PAGE.d]} />
        </mesh>
      </group>
      {/* spine shadow */}
      <mesh position={[0, 0.0142, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.006, PAGE.d]} />
        <meshBasicMaterial color={PALETTE.ink} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {/* pen */}
      <group position={[PAGE.w + 0.045, 0.008, 0.01]} rotation={[0, 0.35, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.0055, 0.0055, 0.14, 10]} />
          <Matte color={PALETTE.ink} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.077, 0]}>
          <coneGeometry args={[0.0055, 0.014, 10]} />
          <Matte color="#C9A25E" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
