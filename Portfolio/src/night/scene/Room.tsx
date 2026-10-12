import { useLayoutEffect, useMemo, useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { Color, ExtrudeGeometry, InstancedMesh, Matrix4, Shape, Path, type Texture } from "three";
import { PALETTE } from "../palette";
import { useDisposable } from "../hooks/useDisposable";
import { DESK, ROOM, RUG, SHELF, SLATS, WALL_Z, WINDOW } from "./layout";
import { floorTexture, plasterTexture, rugTexture } from "./textures";
import { Rod } from "./props/parts";

const WALL_T = 0.1;
const FRAME_T = 0.07; // outer frame bar thickness
const BAR_T = 0.032; // shoji-style inner bars
const FRAME_D = 0.14;

function Mat({ color, roughness = 0.9, map }: { color?: string; roughness?: number; map?: Texture }) {
  return <meshStandardMaterial color={color ?? "#ffffff"} map={map} roughness={roughness} metalness={0} />;
}

/**
 * Back wall as one extruded slab with the window cut out, so the limewash texture runs continuously
 * (ExtrudeGeometry front-face UVs are world x/y in metres; the texture repeats every 2m).
 */
function BackWall({ plaster }: { plaster: Texture }) {
  const geometry = useDisposable(() => {
    const { width, height, leftX } = ROOM;
    const shape = new Shape();
    shape.moveTo(leftX, 0);
    shape.lineTo(leftX + width, 0);
    shape.lineTo(leftX + width, height);
    shape.lineTo(leftX, height);
    shape.closePath();
    const hole = new Path();
    hole.moveTo(WINDOW.x0, WINDOW.y0);
    hole.lineTo(WINDOW.x0, WINDOW.y1);
    hole.lineTo(WINDOW.x1, WINDOW.y1);
    hole.lineTo(WINDOW.x1, WINDOW.y0);
    hole.closePath();
    shape.holes.push(hole);
    return new ExtrudeGeometry(shape, { depth: WALL_T, bevelEnabled: false });
  }, []);
  return (
    <mesh geometry={geometry} position={[0, 0, WALL_Z - WALL_T]}>
      <Mat map={plaster} roughness={0.95} />
    </mesh>
  );
}

/** Light-oak window: outer frame, shoji-style grid (3 × 3 panes) and a deep sill. */
function WindowFrame() {
  const w = WINDOW.x1 - WINDOW.x0;
  const h = WINDOW.y1 - WINDOW.y0;
  const cx = (WINDOW.x0 + WINDOW.x1) / 2;
  const cy = (WINDOW.y0 + WINDOW.y1) / 2;
  const z = WALL_Z - WALL_T / 2;
  const bars: { pos: [number, number, number]; size: [number, number, number]; outer?: boolean }[] = [
    { pos: [cx, WINDOW.y1 - FRAME_T / 2, z], size: [w, FRAME_T, FRAME_D], outer: true },
    { pos: [cx, WINDOW.y0 + FRAME_T / 2, z], size: [w, FRAME_T, FRAME_D], outer: true },
    { pos: [WINDOW.x0 + FRAME_T / 2, cy, z], size: [FRAME_T, h, FRAME_D], outer: true },
    { pos: [WINDOW.x1 - FRAME_T / 2, cy, z], size: [FRAME_T, h, FRAME_D], outer: true },
  ];
  for (const f of [1 / 3, 2 / 3]) {
    bars.push({ pos: [WINDOW.x0 + w * f, cy, z], size: [BAR_T, h, FRAME_D * 0.7] });
    bars.push({ pos: [cx, WINDOW.y0 + h * f, z], size: [w, BAR_T, FRAME_D * 0.7] });
  }
  return (
    <group>
      {bars.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <boxGeometry args={b.size} />
          <Mat color={b.outer ? PALETTE.oak : PALETTE.oakLight} roughness={0.75} />
        </mesh>
      ))}
      <RoundedBox args={[w + 0.24, 0.045, 0.24]} radius={0.012} smoothness={2} position={[cx, WINDOW.y0 - 0.022, WALL_Z + 0.07]}>
        <Mat color={PALETTE.oak} roughness={0.7} />
      </RoundedBox>
    </group>
  );
}

/** Vertical light-oak slats on a dark felt backing (Japandi acoustic panel). One instanced draw call. */
function SlatPanel() {
  const ref = useRef<InstancedMesh>(null);
  const count = Math.floor((SLATS.x1 - SLATS.x0) / SLATS.pitch);
  const h = SLATS.y1 - SLATS.y0;

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new Matrix4();
    const c = new Color();
    for (let i = 0; i < count; i++) {
      m.makeTranslation(SLATS.x0 + SLATS.pitch * (i + 0.5), SLATS.y0 + h / 2, WALL_Z + 0.012 + SLATS.depth / 2);
      mesh.setMatrixAt(i, m);
      // tiny tone variation per slat so it reads as real wood
      c.set(PALETTE.oak).offsetHSL(0, 0, ((i * 37) % 11) / 11 * 0.05 - 0.025);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, h]);

  return (
    <group>
      <mesh position={[(SLATS.x0 + SLATS.x1) / 2, SLATS.y0 + h / 2, WALL_Z + 0.006]}>
        <boxGeometry args={[SLATS.x1 - SLATS.x0, h, 0.012]} />
        <Mat color={PALETTE.charcoal} roughness={1} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, count]}>
        <boxGeometry args={[SLATS.width, h, SLATS.depth]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
    </group>
  );
}

/** Mid-century walnut desk: thin top, tapered splayed legs with brass caps, a reddish-orange drawer front. */
function Desk() {
  const { topY, width, depth, centerZ } = DESK;
  const underY = topY - 0.045;
  const legs = useMemo(() => {
    const ix = width / 2 - 0.16;
    const iz = depth / 2 - 0.1;
    return [-1, 1].flatMap((sx) =>
      [-1, 1].map((sz) => ({
        top: [sx * ix, underY, centerZ + sz * iz] as [number, number, number],
        foot: [sx * (ix + 0.07), 0.02, centerZ + sz * (iz + 0.05)] as [number, number, number],
      })),
    );
  }, [width, depth, centerZ, underY]);

  return (
    <group>
      <RoundedBox args={[width, 0.045, depth]} radius={0.016} smoothness={3} position={[0, topY - 0.0225, centerZ]}>
        <Mat color={PALETTE.walnut} roughness={0.6} />
      </RoundedBox>
      {/* thin apron rails */}
      <mesh position={[0, underY - 0.03, centerZ + depth / 2 - 0.09]}>
        <boxGeometry args={[width - 0.4, 0.05, 0.02]} />
        <Mat color={PALETTE.walnutDark} roughness={0.7} />
      </mesh>
      {legs.map((l, i) => (
        <group key={i}>
          <Rod from={l.foot} to={l.top} radius={0.013} radiusTop={0.026} segments={12}>
            <Mat color={PALETTE.walnutDark} roughness={0.6} />
          </Rod>
          <mesh position={[l.foot[0], 0.02, l.foot[2]]}>
            <cylinderGeometry args={[0.0135, 0.0135, 0.04, 12]} />
            <meshStandardMaterial color={PALETTE.brass} metalness={0.8} roughness={0.35} />
          </mesh>
        </group>
      ))}
      {/* hanging drawer (left), accent front + brass pull */}
      <group position={[-1.95, underY - 0.065, centerZ + 0.02]}>
        <mesh>
          <boxGeometry args={[0.72, 0.12, depth - 0.12]} />
          <Mat color={PALETTE.walnut} roughness={0.65} />
        </mesh>
        <RoundedBox args={[0.68, 0.1, 0.012]} radius={0.004} smoothness={2} position={[0, 0, (depth - 0.12) / 2 + 0.006]}>
          <Mat color={PALETTE.accent} roughness={0.7} />
        </RoundedBox>
        <mesh position={[0, -0.005, (depth - 0.12) / 2 + 0.018]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.006, 0.006, 0.14, 10]} />
          <meshStandardMaterial color="#B8924A" metalness={0.85} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/** Floating light-oak shelf (no visible brackets). */
function Shelf() {
  const [x, y, z] = SHELF.center;
  return (
    <RoundedBox args={[SHELF.width, 0.045, SHELF.depth]} radius={0.01} smoothness={2} position={[x, y, z]}>
      <Mat color={PALETTE.oakLight} roughness={0.75} />
    </RoundedBox>
  );
}

/** Procedural room shell: plaster walls, slat panel, plank floor + rug, desk, shelf, oak window. No ceiling light — only small lamps (Zack). */
export function Room() {
  const { width, height, leftX } = ROOM;
  const plaster = useDisposable(() => {
    const t = plasterTexture();
    t.repeat.set(0.5, 0.5); // world-unit UVs on the extruded wall → one tile per 2m
    return t;
  }, []);
  const sidePlaster = useDisposable(() => plasterTexture(13), []);
  const floor = useDisposable(() => floorTexture(), []);
  const rug = useDisposable(() => rugTexture(), []);

  return (
    <group>
      <BackWall plaster={plaster} />
      <WindowFrame />
      <SlatPanel />
      {/* left side wall, a touch darker (out of the lamp) */}
      <mesh position={[leftX, height / 2, WALL_Z + 2.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5, height]} />
        <Mat map={sidePlaster} color={PALETTE.plasterShade} />
      </mesh>
      {/* floor + rug */}
      <mesh position={[leftX + width / 2, 0, WALL_Z + 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, 5]} />
        <Mat map={floor} roughness={0.7} />
      </mesh>
      <mesh position={RUG.center} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={RUG.size} />
        <Mat map={rug} color="#958C80" roughness={1} />
      </mesh>
      {/* oak skirting */}
      <mesh position={[leftX + width / 2, 0.04, WALL_Z + 0.01]}>
        <boxGeometry args={[width, 0.08, 0.02]} />
        <Mat color={PALETTE.oak} roughness={0.8} />
      </mesh>
      <Desk />
      <Shelf />
    </group>
  );
}
