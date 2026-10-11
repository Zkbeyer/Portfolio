import { RoundedBox } from "@react-three/drei";
import { PALETTE } from "../palette";
import { DESK, ROOM, SHELF, WALL_Z, WINDOW } from "./layout";

const WALL_T = 0.1;
const FRAME_T = 0.08; // frame bar thickness
const FRAME_D = 0.16; // frame depth

function Mat({ color, roughness = 0.9 }: { color: string; roughness?: number }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={0} />;
}

/** Back wall built from four panels around the window opening. */
function BackWall() {
  const { width, height, leftX } = ROOM;
  const rightX = leftX + width;
  const z = WALL_Z - WALL_T / 2;
  const panels: { x0: number; x1: number; y0: number; y1: number }[] = [
    { x0: leftX, x1: WINDOW.x0, y0: 0, y1: height },
    { x0: WINDOW.x1, x1: rightX, y0: 0, y1: height },
    { x0: WINDOW.x0, x1: WINDOW.x1, y0: 0, y1: WINDOW.y0 },
    { x0: WINDOW.x0, x1: WINDOW.x1, y0: WINDOW.y1, y1: height },
  ];
  return (
    <group>
      {panels.map((p, i) => (
        <mesh key={i} position={[(p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2, z]}>
          <boxGeometry args={[p.x1 - p.x0, p.y1 - p.y0, WALL_T]} />
          <Mat color={PALETTE.wall} />
        </mesh>
      ))}
    </group>
  );
}

/** Window frame, cross mullions and sill. The glass + view arrive in P2. */
function WindowFrame() {
  const w = WINDOW.x1 - WINDOW.x0;
  const h = WINDOW.y1 - WINDOW.y0;
  const cx = (WINDOW.x0 + WINDOW.x1) / 2;
  const cy = (WINDOW.y0 + WINDOW.y1) / 2;
  const z = WALL_Z - WALL_T / 2;
  const bars: { pos: [number, number, number]; size: [number, number, number] }[] = [
    { pos: [cx, WINDOW.y1 - FRAME_T / 2, z], size: [w, FRAME_T, FRAME_D] },
    { pos: [cx, WINDOW.y0 + FRAME_T / 2, z], size: [w, FRAME_T, FRAME_D] },
    { pos: [WINDOW.x0 + FRAME_T / 2, cy, z], size: [FRAME_T, h, FRAME_D] },
    { pos: [WINDOW.x1 - FRAME_T / 2, cy, z], size: [FRAME_T, h, FRAME_D] },
    { pos: [cx, cy, z], size: [w, FRAME_T * 0.6, FRAME_D * 0.8] },
    { pos: [cx, cy, z], size: [FRAME_T * 0.6, h, FRAME_D * 0.8] },
  ];
  return (
    <group>
      {bars.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <boxGeometry args={b.size} />
          <Mat color={PALETTE.frame} roughness={0.7} />
        </mesh>
      ))}
      <RoundedBox args={[w + 0.3, 0.06, 0.26]} radius={0.015} smoothness={2} position={[cx, WINDOW.y0 - 0.03, WALL_Z + 0.08]}>
        <Mat color={PALETTE.frame} roughness={0.7} />
      </RoundedBox>
    </group>
  );
}

function Desk() {
  const { topY, width, depth, centerZ } = DESK;
  const legX = width / 2 - 0.12;
  return (
    <group>
      <RoundedBox args={[width, 0.06, depth]} radius={0.02} smoothness={3} position={[0, topY - 0.03, centerZ]}>
        <Mat color={PALETTE.deskTop} roughness={0.75} />
      </RoundedBox>
      {/* apron */}
      <mesh position={[0, topY - 0.1, centerZ + depth / 2 - 0.03]}>
        <boxGeometry args={[width - 0.1, 0.1, 0.04]} />
        <Mat color={PALETTE.deskFront} />
      </mesh>
      {/* panel legs */}
      {[-legX, legX].map((x) => (
        <mesh key={x} position={[x, (topY - 0.06) / 2, centerZ]}>
          <boxGeometry args={[0.06, topY - 0.06, depth - 0.1]} />
          <Mat color={PALETTE.shadowPurple} />
        </mesh>
      ))}
    </group>
  );
}

function Shelf() {
  const [x, y, z] = SHELF.center;
  return (
    <group>
      <RoundedBox args={[SHELF.width, 0.05, SHELF.depth]} radius={0.012} smoothness={2} position={[x, y, z]}>
        <Mat color={PALETTE.shelf} roughness={0.8} />
      </RoundedBox>
      {[-SHELF.width / 2 + 0.2, SHELF.width / 2 - 0.2].map((dx) => (
        <mesh key={dx} position={[x + dx, y - 0.1, WALL_Z + 0.06]}>
          <boxGeometry args={[0.03, 0.16, 0.12]} />
          <Mat color={PALETTE.shadowPurple} />
        </mesh>
      ))}
    </group>
  );
}

/** Procedural room shell: walls, floor, desk, shelf, window frame. */
export function Room() {
  const { width, height, leftX } = ROOM;
  return (
    <group>
      <BackWall />
      <WindowFrame />
      {/* left side wall */}
      <mesh position={[leftX, height / 2, WALL_Z + 2.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5, height]} />
        <Mat color={PALETTE.wallShade} />
      </mesh>
      {/* floor */}
      <mesh position={[leftX + width / 2, 0, WALL_Z + 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, 5]} />
        <Mat color={PALETTE.deep} />
      </mesh>
      {/* skirting */}
      <mesh position={[leftX + width / 2, 0.05, WALL_Z + 0.01]}>
        <boxGeometry args={[width, 0.1, 0.02]} />
        <Mat color={PALETTE.deep3} />
      </mesh>
      <Desk />
      <Shelf />
    </group>
  );
}
