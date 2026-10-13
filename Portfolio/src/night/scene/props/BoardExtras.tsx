import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { CatmullRomCurve3, Vector3 } from "three";
import { PALETTE } from "../../palette";
import { WALL_Z, type Vec3 } from "../layout";
import { Matte, Rod } from "./parts";
import { seeded } from "./seeded";
import { LEAF, vineLeaves } from "./vine";

/**
 * R8 — extras from Zack's Pinterest board: a green velvet mid-century lounge chair, a tiered paper
 * floor lamp, and a hanging trailing plant. All static (the chair and planter join StaticMerge; the
 * lamp's glowing shades are emissive and stay separate).
 */

// ── green velvet lounge chair, left of the desk under the shelf ───────────────
const CHAIR = { pos: [-1.82, 0, -0.62] as Vec3, yaw: 0.55 } as const;
const VELVET = "#3A5A3E";

function Velvet() {
  return <meshPhysicalMaterial color={VELVET} roughness={0.92} sheen={1} sheenColor="#9DBB8F" sheenRoughness={0.45} />;
}

export function AccentChair() {
  const seatY = 0.4;
  const legs = useMemo(
    () =>
      [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz]) => ({
        from: [sx * 0.24, seatY - 0.06, sz * 0.2] as Vec3,
        to: [sx * 0.3, 0, sz * 0.27] as Vec3,
      })),
    [],
  );
  return (
    <group position={CHAIR.pos} rotation={[0, CHAIR.yaw, 0]}>
      {/* walnut frame + splayed tapered legs with brass caps */}
      <RoundedBox args={[0.6, 0.05, 0.52]} radius={0.015} smoothness={2} position={[0, seatY - 0.06, 0]}>
        <Matte color={PALETTE.walnut} roughness={0.6} />
      </RoundedBox>
      {legs.map((l, i) => (
        <group key={i}>
          <Rod from={l.from} to={l.to} radius={0.018} radiusTop={0.009} segments={10}>
            <Matte color={PALETTE.walnut} roughness={0.6} />
          </Rod>
          <mesh position={[l.to[0], 0.012, l.to[2]]}>
            <cylinderGeometry args={[0.01, 0.01, 0.024, 10]} />
            <Matte color={PALETTE.brass} roughness={0.35} metalness={0.7} />
          </mesh>
        </group>
      ))}
      {/* seat cushion + reclined back */}
      <RoundedBox args={[0.6, 0.12, 0.54]} radius={0.05} smoothness={4} position={[0, seatY + 0.02, 0.02]}>
        <Velvet />
      </RoundedBox>
      <RoundedBox args={[0.6, 0.56, 0.12]} radius={0.05} smoothness={4} position={[0, seatY + 0.3, -0.25]} rotation={[-0.22, 0, 0]}>
        <Velvet />
      </RoundedBox>
      {/* button tufts */}
      {[-0.16, 0, 0.16].map((x) =>
        [0.2, 0.38].map((y) => (
          <mesh key={`${x}-${y}`} position={[x, seatY + y, -0.19 - y * 0.22]} rotation={[-0.22, 0, 0]}>
            <sphereGeometry args={[0.009, 8, 6]} />
            <Matte color="#2C4430" roughness={0.9} />
          </mesh>
        )),
      )}
    </group>
  );
}

// ── tiered paper floor lamp, between the desk and the record console ──────────
const LAMP = { pos: [0.7, 0, -1.36] as Vec3 } as const;
const TIERS = [
  { y: 0.62, r: 0.12, h: 0.2 },
  { y: 0.94, r: 0.16, h: 0.28 },
  { y: 1.26, r: 0.11, h: 0.18 },
] as const;

export function PaperFloorLamp() {
  const [x, , z] = LAMP.pos;
  return (
    <group>
      {/* slim black stem on a three-leg base */}
      <Rod from={[x, 0.18, z]} to={[x, TIERS[2].y + TIERS[2].h / 2 + 0.04, z]} radius={0.006}>
        <Matte color="#1E1C1A" roughness={0.5} metalness={0.4} />
      </Rod>
      {[0, 2.1, 4.2].map((a) => (
        <Rod key={a} from={[x, 0.18, z]} to={[x + Math.cos(a) * 0.16, 0.004, z + Math.sin(a) * 0.16]} radius={0.006}>
          <Matte color="#1E1C1A" roughness={0.5} metalness={0.4} />
        </Rod>
      ))}
      {/* washi-paper tiers: softly glowing barrels with darker rib lines */}
      {TIERS.map((t) => (
        <group key={t.y} position={[x, t.y, z]}>
          <mesh>
            <cylinderGeometry args={[t.r * 0.92, t.r * 0.92, t.h, 28, 1, true]} />
            <meshStandardMaterial color="#EBD6B4" emissive="#FFB570" emissiveIntensity={0.6} roughness={0.95} side={2} />
          </mesh>
          {[-0.5, -0.25, 0, 0.25, 0.5].map((f) => (
            <mesh key={f} position={[0, f * t.h, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[t.r * 0.925, 0.0018, 4, 28]} />
              <meshStandardMaterial color="#B98A55" emissive="#7A4A20" emissiveIntensity={0.4} roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
      <pointLight position={[x, TIERS[1].y, z + 0.05]} color={PALETTE.lamp} intensity={0.35} distance={2.4} decay={2} />
    </group>
  );
}

// ── hanging trailing plant in front of the window, upper right ──────────────────
const HANG = { x: 2.3, top: 2.95, potY: 2.42, z: WALL_Z + 0.42 } as const; // in front of the window, upper right

export function HangingPlant() {
  const { vines, crown } = useMemo(() => {
    const rand = seeded(29);
    const { x, potY, z } = HANG;
    const rim = potY + 0.07;
    const mk = (pts: [number, number, number][]) => new CatmullRomCurve3(pts.map((p) => new Vector3(...p)));
    const curves = [
      mk([
        [x - 0.06, rim, z + 0.02],
        [x - 0.1, rim - 0.06, z + 0.05],
        [x - 0.12, rim - 0.35, z + 0.06],
        [x - 0.1, rim - 0.7, z + 0.04],
      ]),
      mk([
        [x + 0.05, rim, z + 0.03],
        [x + 0.09, rim - 0.08, z + 0.06],
        [x + 0.08, rim - 0.45, z + 0.09],
        [x + 0.11, rim - 0.95, z + 0.07],
      ]),
      mk([
        [x, rim, z - 0.05],
        [x + 0.02, rim - 0.1, z - 0.09],
        [x - 0.02, rim - 0.5, z - 0.1],
      ]),
    ];
    const crownLeaves = Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return {
        p: new Vector3(x + Math.cos(a) * 0.06, rim + 0.02 + rand() * 0.04, z + Math.sin(a) * 0.06),
        rot: [Math.sin(a) * 1.1, -a, Math.cos(a) * 1.1] as [number, number, number],
        s: 0.035 + rand() * 0.012,
        color: LEAF[i % LEAF.length],
      };
    });
    return { vines: curves.map((c, i) => ({ curve: c, leaves: vineLeaves(c, 8 + i * 2, rand) })), crown: crownLeaves };
  }, []);

  const { x, top, potY, z } = HANG;
  return (
    <group>
      {/* macramé: three cords from a ceiling hook to the pot */}
      {[0, 2.1, 4.2].map((a) => (
        <Rod key={a} from={[x, top, z]} to={[x + Math.cos(a) * 0.075, potY + 0.03, z + Math.sin(a) * 0.075]} radius={0.003} segments={5}>
          <Matte color="#D9CBB2" roughness={1} />
        </Rod>
      ))}
      <mesh position={[x, potY, z]}>
        <cylinderGeometry args={[0.085, 0.06, 0.13, 22]} />
        <Matte color="#B5603E" roughness={0.9} />
      </mesh>
      {crown.map((l, i) => (
        <mesh key={i} position={l.p} rotation={l.rot} scale={[l.s, l.s * 0.18, l.s * 0.7]}>
          <sphereGeometry args={[1, 10, 6]} />
          <Matte color={l.color} roughness={0.7} />
        </mesh>
      ))}
      {vines.map((v, i) => (
        <group key={i}>
          <mesh>
            <tubeGeometry args={[v.curve, 24, 0.0025, 5, false]} />
            <Matte color="#4D7A5C" />
          </mesh>
          {v.leaves.map((l, j) => (
            <mesh key={j} position={l.p} rotation={l.rot} scale={[l.s, l.s * 0.18, l.s * 0.7]}>
              <sphereGeometry args={[1, 10, 6]} />
              <Matte color={l.color} roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
