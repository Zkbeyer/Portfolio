import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Color, Group, MeshBasicMaterial } from "three";
import { PALETTE } from "../../palette";
import { DESK, SHELF, type Vec3 } from "../layout";
import { useSceneTime } from "../../hooks/useSceneTime";
import { useDisposable } from "../../hooks/useDisposable";
import { Matte, Rod } from "./parts";

const Y = DESK.topY;
const BRASS = PALETTE.brass;

/** Positions for the decor (world space). Kept clear of the hotspot props in layout.ANCHORS. */
const SPOTS = {
  bonsai: [-1.22, Y, -1.2] as Vec3,
  pencils: [-1.0, Y, -0.86] as Vec3,
  candle: [1.13, Y, -1.12] as Vec3,
  headphones: [1.6, Y, -1.36] as Vec3,
  camera: [-1.19, SHELF.center[1] + 0.022, SHELF.center[2] + 0.03] as Vec3,
} as const;

/** Small bonsai: shallow charcoal tray, twisting trunk, flat-shaded foliage pads. */
function Bonsai() {
  const [x, y, z] = SPOTS.bonsai;
  const pads: { p: Vec3; s: Vec3; c: string }[] = [
    { p: [-0.07, 0.25, 0], s: [0.09, 0.045, 0.07], c: "#34502F" },
    { p: [0.06, 0.29, 0.01], s: [0.08, 0.04, 0.065], c: "#3E5A36" },
    { p: [0.0, 0.34, -0.01], s: [0.07, 0.04, 0.06], c: "#385432" },
    { p: [0.11, 0.2, 0.0], s: [0.055, 0.03, 0.05], c: "#34502F" },
  ];
  return (
    <group position={[x, y, z]}>
      <RoundedBox args={[0.2, 0.04, 0.13]} radius={0.01} smoothness={2} position={[0, 0.02, 0]}>
        <Matte color={PALETTE.charcoal} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, 0.041, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 0.11]} />
        <Matte color="#4A3A2C" />
      </mesh>
      <Rod from={[0.01, 0.04, 0]} to={[-0.03, 0.14, 0]} radius={0.014} radiusTop={0.011}>
        <Matte color="#5A4434" roughness={0.9} />
      </Rod>
      <Rod from={[-0.03, 0.14, 0]} to={[0.03, 0.24, 0]} radius={0.011} radiusTop={0.008}>
        <Matte color="#5A4434" roughness={0.9} />
      </Rod>
      <Rod from={[0.0, 0.18, 0]} to={[-0.07, 0.24, 0]} radius={0.006} radiusTop={0.004}>
        <Matte color="#5A4434" roughness={0.9} />
      </Rod>
      <Rod from={[0.02, 0.2, 0]} to={[0.11, 0.2, 0]} radius={0.005} radiusTop={0.004}>
        <Matte color="#5A4434" roughness={0.9} />
      </Rod>
      {pads.map((pad, i) => (
        <mesh key={i} position={pad.p} scale={pad.s}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={pad.c} roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/** Reddish-orange pencil cup with a few cream + charcoal pencils. */
function PencilCup() {
  const [x, y, z] = SPOTS.pencils;
  const pencils: { to: Vec3; c: string }[] = [
    { to: [0.02, 0.17, 0.01], c: PALETTE.cream },
    { to: [-0.025, 0.16, -0.01], c: PALETTE.charcoal },
    { to: [0.0, 0.18, -0.02], c: PALETTE.brass },
    { to: [-0.01, 0.15, 0.025], c: PALETTE.cream },
  ];
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.032, 0.03, 0.09, 20, 1, true]} />
        <meshStandardMaterial color={PALETTE.accent} roughness={0.9} side={2} />
      </mesh>
      <mesh position={[0, 0.002, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.004, 20]} />
        <Matte color={PALETTE.accent} />
      </mesh>
      {pencils.map((p, i) => (
        <Rod key={i} from={[p.to[0] * 0.2, 0.01, p.to[2] * 0.2]} to={p.to} radius={0.0035} segments={6}>
          <Matte color={p.c} roughness={0.6} />
        </Rod>
      ))}
    </group>
  );
}

/** Pillar candle with a softly flickering flame. */
function Candle() {
  const time = useSceneTime();
  const flame = useRef<Group>(null);
  const base = useMemo(() => new Color(PALETTE.lamp), []);
  const mat = useDisposable(() => new MeshBasicMaterial({ color: base.clone().multiplyScalar(3), toneMapped: false }), [base]);
  useFrame(() => {
    const t = time.current;
    const f = 1 + Math.sin(t * 13) * 0.06 + Math.sin(t * 7.3) * 0.05;
    if (flame.current) flame.current.scale.set(1, f, 1);
    mat.color.copy(base).multiplyScalar(2.6 + Math.sin(t * 11) * 0.3);
  });
  const [x, y, z] = SPOTS.candle;
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.004, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.008, 24]} />
        <meshStandardMaterial color={BRASS} metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.046, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.08, 20]} />
        <Matte color={PALETTE.cream} roughness={0.9} />
      </mesh>
      <group ref={flame} position={[0, 0.09, 0]}>
        <mesh position={[0, 0.012, 0]} material={mat} scale={[0.6, 1.4, 0.6]}>
          <sphereGeometry args={[0.009, 10, 8]} />
        </mesh>
      </group>
    </group>
  );
}

/** Headphones resting on an oak stand with a walnut base. */
function Headphones() {
  const [x, y, z] = SPOTS.headphones;
  const top = 0.26;
  return (
    <group position={[x, y, z]} rotation={[0, -0.5, 0]}>
      <mesh position={[0, 0.008, 0]}>
        <cylinderGeometry args={[0.055, 0.06, 0.016, 24]} />
        <Matte color={PALETTE.walnut} roughness={0.6} />
      </mesh>
      <mesh position={[0, top / 2, 0]}>
        <cylinderGeometry args={[0.008, 0.01, top, 10]} />
        <Matte color={PALETTE.oak} roughness={0.6} />
      </mesh>
      {/* band over the top of the stand */}
      <mesh position={[0, top - 0.005, 0]}>
        <torusGeometry args={[0.075, 0.009, 8, 24, Math.PI]} />
        <Matte color={PALETTE.charcoal} roughness={0.5} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.078, top - 0.055, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.045, 0.045, 0.03, 24]} />
            <Matte color={PALETTE.charcoal} roughness={0.5} />
          </mesh>
          <mesh position={[0, -s * 0.018, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.012, 24]} />
            <Matte color={PALETTE.greige} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Vintage rangefinder film camera: leatherette body, chrome top plate, lens, orange strap lug. */
function FilmCamera() {
  const [x, y, z] = SPOTS.camera;
  return (
    <group position={[x, y, z]} rotation={[0, 0.35, 0]}>
      <RoundedBox args={[0.13, 0.065, 0.045]} radius={0.008} smoothness={2} position={[0, 0.0325, 0]}>
        <Matte color="#1E1C1A" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[0.132, 0.02, 0.047]} radius={0.006} smoothness={2} position={[0, 0.072, 0]}>
        <meshStandardMaterial color="#C9C6BF" metalness={0.85} roughness={0.3} />
      </RoundedBox>
      <mesh position={[0.01, 0.034, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.026, 0.035, 24]} />
        <meshStandardMaterial color="#C9C6BF" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0.01, 0.034, 0.053]}>
        <circleGeometry args={[0.017, 24]} />
        <meshStandardMaterial color="#1B2630" metalness={0.6} roughness={0.08} />
      </mesh>
      {/* viewfinder window + shutter dial */}
      <mesh position={[-0.042, 0.06, 0.0236]}>
        <planeGeometry args={[0.018, 0.012]} />
        <meshStandardMaterial color="#2A3540" metalness={0.5} roughness={0.1} />
      </mesh>
      <mesh position={[0.04, 0.086, 0]}>
        <cylinderGeometry args={[0.011, 0.011, 0.008, 16]} />
        <meshStandardMaterial color="#C9C6BF" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[-0.067, 0.05, 0]}>
        <boxGeometry args={[0.006, 0.012, 0.012]} />
        <Matte color={PALETTE.accent} />
      </mesh>
    </group>
  );
}

/** Non-interactive vintage/fun decor (R5, revised 2026-10-12 after Zack's notes: no print, clock or vase). */
export function Decor() {
  return (
    <group>
      <FilmCamera />
      <Bonsai />
      <PencilCup />
      <Candle />
      <Headphones />
    </group>
  );
}
