import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Color, Group, InstancedMesh, Matrix4, MeshBasicMaterial, Quaternion, Vector2, Vector3 } from "three";
import { PALETTE } from "../../palette";
import { DESK, SHELF, WALL_Z, type Vec3 } from "../layout";
import { useSceneTime } from "../../hooks/useSceneTime";
import { useDisposable } from "../../hooks/useDisposable";
import { Matte, Rod } from "./parts";
import { seeded } from "./seeded";
import { mcmPrintTexture } from "./decorTextures";

const Y = DESK.topY;
const BRASS = "#B8924A";

/** Positions for the decor (world space). Kept clear of the hotspot props in layout.ANCHORS. */
const SPOTS = {
  vase: [0.66, Y, -1.36] as Vec3,
  bonsai: [-1.22, Y, -1.2] as Vec3,
  pencils: [-1.0, Y, -0.86] as Vec3,
  candle: [1.13, Y, -1.12] as Vec3,
  headphones: [1.6, Y, -1.36] as Vec3,
  // on the slat panel (in front of the slats), clear of the hero name in the top-left corner
  clock: [-0.74, 2.4, WALL_Z + 0.065] as Vec3,
  print: [-2.05, 1.36, WALL_Z + 0.015] as Vec3,
  shelfJar: [-1.42, SHELF.center[1] + 0.022, SHELF.center[2] + 0.02] as Vec3,
  shelfBowl: [-1.24, SHELF.center[1] + 0.022, SHELF.center[2] + 0.03] as Vec3,
} as const;

/** Lathe profile helper: points (radius, height) → Vector2[]. */
const lathe = (pts: [number, number][]) => pts.map(([r, h]) => new Vector2(r, h));

/** Speckled cream vase with dried pampas/bunny-tail stems fanning out. */
function DriedStems() {
  const stems = useMemo(() => {
    const rnd = seeded(21);
    return Array.from({ length: 7 }, (_, i) => {
      const a = -0.5 + (i / 6) * 1.0 + (rnd() - 0.5) * 0.15;
      const len = 0.42 + rnd() * 0.2;
      const top: Vec3 = [Math.sin(a) * len * 0.45, 0.17 + Math.cos(a) * len, (rnd() - 0.5) * 0.08];
      return { top, plume: 0.05 + rnd() * 0.035 };
    });
  }, []);
  const [x, y, z] = SPOTS.vase;
  const profile = useMemo(() => lathe([[0, 0], [0.05, 0], [0.068, 0.05], [0.06, 0.11], [0.03, 0.16], [0.032, 0.185], [0, 0.185]]), []);
  return (
    <group position={[x, y, z]}>
      <mesh>
        <latheGeometry args={[profile, 28]} />
        <Matte color="#E3D9C6" roughness={0.95} />
      </mesh>
      {stems.map((s, i) => (
        <group key={i}>
          <Rod from={[0, 0.17, 0]} to={s.top} radius={0.0022} segments={5}>
            <Matte color="#B59A72" />
          </Rod>
          <mesh position={s.top} quaternion={new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(...s.top).normalize())}>
            <capsuleGeometry args={[0.016, s.plume, 4, 10]} />
            <Matte color="#E9DCC3" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

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

/** Terracotta pencil cup with a few mustard + charcoal pencils. */
function PencilCup() {
  const [x, y, z] = SPOTS.pencils;
  const pencils: { to: Vec3; c: string }[] = [
    { to: [0.02, 0.17, 0.01], c: PALETTE.mustard },
    { to: [-0.025, 0.16, -0.01], c: PALETTE.charcoal },
    { to: [0.0, 0.18, -0.02], c: PALETTE.mustard },
    { to: [-0.01, 0.15, 0.025], c: PALETTE.cream },
  ];
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.032, 0.03, 0.09, 20, 1, true]} />
        <meshStandardMaterial color={PALETTE.terracotta} roughness={0.9} side={2} />
      </mesh>
      <mesh position={[0, 0.002, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.004, 20]} />
        <Matte color={PALETTE.terracotta} />
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

/** Sunburst wall clock: brass rays (one instanced draw call), walnut ring, cream face, hands that move. */
function SunburstClock() {
  const rays = useRef<InstancedMesh>(null);
  const hands = useRef<Group[]>([]);
  const time = useSceneTime();
  const N = 24;
  useLayoutEffect(() => {
    const mesh = rays.current;
    if (!mesh) return;
    const m = new Matrix4();
    const q = new Quaternion();
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const len = i % 2 === 0 ? 0.2 : 0.14;
      q.setFromAxisAngle(new Vector3(0, 0, 1), a);
      const d = 0.1 + len / 2; // box is along +y, rotated by a → points along (-sin a, cos a)
      m.compose(new Vector3(-Math.sin(a) * d, Math.cos(a) * d, 0), q, new Vector3(1, len, 1));
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);
  // 2:07am, then real seconds tick the minute hand slowly
  useFrame(() => {
    const minutes = 7 + time.current / 60;
    const [h, m] = hands.current;
    if (m) m.rotation.z = -(minutes / 60) * Math.PI * 2;
    if (h) h.rotation.z = -((2 + minutes / 60) / 12) * Math.PI * 2;
  });
  return (
    <group position={SPOTS.clock} scale={0.85}>
      <instancedMesh ref={rays} args={[undefined, undefined, N]}>
        <boxGeometry args={[0.008, 1, 0.006]} />
        <meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.35} />
      </instancedMesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.008]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
        <Matte color={PALETTE.walnut} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.019]}>
        <circleGeometry args={[0.082, 32]} />
        <Matte color={PALETTE.cream} roughness={0.9} />
      </mesh>
      {[0.045, 0.068].map((len, i) => (
        <group key={i} ref={(g) => { if (g) hands.current[i] = g; }} position={[0, 0, 0.021 + i * 0.002]}>
          <mesh position={[0, len / 2, 0]}>
            <boxGeometry args={[i === 0 ? 0.008 : 0.005, len, 0.002]} />
            <Matte color={PALETTE.charcoal} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0, 0.025]}>
        <circleGeometry args={[0.007, 12]} />
        <meshStandardMaterial color={BRASS} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** Abstract mid-century print in a thin oak frame with a cream mat. */
function FramedPrint() {
  const map = useDisposable(() => mcmPrintTexture(), []);
  const W = 0.4;
  const H = 0.5;
  return (
    <group position={SPOTS.print}>
      <RoundedBox args={[W + 0.04, H + 0.04, 0.02]} radius={0.004} smoothness={2}>
        <Matte color={PALETTE.oak} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0105]}>
        <planeGeometry args={[W, H]} />
        <Matte color="#F1EADF" />
      </mesh>
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[W - 0.07, H - 0.07]} />
        <meshStandardMaterial map={map} roughness={0.95} />
      </mesh>
    </group>
  );
}

/** Small ceramics on the shelf: a sage jar and a stack of two bowls. */
function ShelfCeramics() {
  const jar = useMemo(() => lathe([[0, 0], [0.035, 0], [0.042, 0.04], [0.036, 0.09], [0.022, 0.1], [0.024, 0.115], [0, 0.115]]), []);
  return (
    <group>
      <mesh position={SPOTS.shelfJar}>
        <latheGeometry args={[jar, 24]} />
        <Matte color={PALETTE.sage} roughness={0.8} />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} position={[SPOTS.shelfBowl[0], SPOTS.shelfBowl[1] + i * 0.028, SPOTS.shelfBowl[2]]} scale={[1 - i * 0.18, 1, 1 - i * 0.18]}>
          <sphereGeometry args={[0.05, 20, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color={i === 0 ? PALETTE.cream : PALETTE.terracotta} roughness={0.8} side={2} />
        </mesh>
      ))}
    </group>
  );
}

/** Non-interactive decor for the mid-century × Japandi restyle (R5). */
export function Decor() {
  return (
    <group>
      <DriedStems />
      <Bonsai />
      <PencilCup />
      <Candle />
      <Headphones />
      <SunburstClock />
      <FramedPrint />
      <ShelfCeramics />
    </group>
  );
}
