import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { CanvasTexture, Color, Group, InstancedMesh, MathUtils, Matrix4, MeshBasicMaterial, SRGBColorSpace } from "three";
import { PALETTE } from "../../palette";
import { ANCHORS, CONSOLE } from "../layout";
import { useSceneTime } from "../../hooks/useSceneTime";
import { useDisposable } from "../../hooks/useDisposable";
import { Matte, Rod } from "./parts";
import { seeded } from "./seeded";

const W = CONSOLE.x1 - CONSOLE.x0;
const CX = (CONSOLE.x0 + CONSOLE.x1) / 2;
const BODY_H = 0.4; // cabinet box; legs make up the rest of CONSOLE.topY
const LEG_H = CONSOLE.topY - BODY_H;
const SLEEVES = ["#D1492A", "#E8DFD0", "#2E2B28", "#9E3220", "#CFC4B3", "#5A4A3C", "#E8774F", "#3A3430", "#8C8275", "#D9A441", "#E8DFD0", "#2E2B28"];

/** Vinyl sleeves standing in the open cubby. One instanced draw call with per-instance colours. */
function Vinyl({ x0, x1, y0, z }: { x0: number; x1: number; y0: number; z: number }) {
  const ref = useRef<InstancedMesh>(null);
  const n = Math.floor((x1 - x0) / 0.016);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const rnd = seeded(41);
    const m = new Matrix4();
    const c = new Color();
    for (let i = 0; i < n; i++) {
      const lean = i > n - 4 ? (n - 4 - i) * 0.12 : (rnd() - 0.5) * 0.03;
      m.makeRotationZ(lean).setPosition(x0 + 0.01 + i * 0.016, y0 + 0.155, z + (rnd() - 0.5) * 0.01);
      mesh.setMatrixAt(i, m);
      c.set(SLEEVES[Math.floor(rnd() * SLEEVES.length)]);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [n, x0, y0, z]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]}>
      <boxGeometry args={[0.006, 0.31, 0.3]} />
      <meshStandardMaterial roughness={0.8} />
    </instancedMesh>
  );
}

/**
 * Low walnut record console under the window (vintage stereo-cabinet style): open vinyl cubby on the
 * left, two sliding doors with an accent stripe, tapered legs. The turntable sits on top (see Turntable).
 */
export function RecordConsole() {
  const bodyY = LEG_H + BODY_H / 2;
  const front = CONSOLE.z + CONSOLE.depth / 2;
  const cubbyW = W * 0.42;
  const legs = useMemo(
    () =>
      [-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => ({
          top: [CX + sx * (W / 2 - 0.08), LEG_H, CONSOLE.z + sz * (CONSOLE.depth / 2 - 0.07)] as [number, number, number],
          foot: [CX + sx * (W / 2 - 0.04), 0.01, CONSOLE.z + sz * (CONSOLE.depth / 2 - 0.04)] as [number, number, number],
        })),
      ),
    [],
  );
  return (
    <group>
      {/* carcass: top, bottom, sides, back, divider */}
      <RoundedBox args={[W, 0.03, CONSOLE.depth]} radius={0.008} smoothness={2} position={[CX, CONSOLE.topY - 0.015, CONSOLE.z]}>
        <Matte color={PALETTE.walnut} roughness={0.55} />
      </RoundedBox>
      <mesh position={[CX, LEG_H + 0.015, CONSOLE.z]}>
        <boxGeometry args={[W, 0.03, CONSOLE.depth]} />
        <Matte color={PALETTE.walnut} roughness={0.6} />
      </mesh>
      {[CONSOLE.x0 + 0.015, CONSOLE.x1 - 0.015, CONSOLE.x0 + cubbyW].map((x) => (
        <mesh key={x} position={[x, bodyY, CONSOLE.z]}>
          <boxGeometry args={[0.03, BODY_H, CONSOLE.depth]} />
          <Matte color={PALETTE.walnut} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[CX, bodyY, CONSOLE.z - CONSOLE.depth / 2 + 0.01]}>
        <boxGeometry args={[W, BODY_H, 0.02]} />
        <Matte color={PALETTE.walnutDark} roughness={0.8} />
      </mesh>
      <Vinyl x0={CONSOLE.x0 + 0.04} x1={CONSOLE.x0 + cubbyW - 0.03} y0={LEG_H + 0.03} z={CONSOLE.z + 0.01} />
      {/* sliding doors with a reddish-orange stripe + brass finger pulls */}
      {[0, 1].map((i) => {
        const dw = (W - cubbyW - 0.03) / 2;
        const x = CONSOLE.x0 + cubbyW + 0.015 + dw * (i + 0.5);
        return (
          <group key={i} position={[x, bodyY, front - 0.008 - i * 0.012]}>
            <mesh>
              <boxGeometry args={[dw, BODY_H - 0.04, 0.012]} />
              <Matte color={i === 0 ? PALETTE.walnut : "#4A2E1D"} roughness={0.55} />
            </mesh>
            <mesh position={[0, BODY_H * 0.22, 0.0065]}>
              <planeGeometry args={[dw, 0.03]} />
              <Matte color={PALETTE.accent} roughness={0.7} />
            </mesh>
            <mesh position={[i === 0 ? dw / 2 - 0.04 : -dw / 2 + 0.04, 0, 0.008]}>
              <boxGeometry args={[0.012, 0.06, 0.004]} />
              <meshStandardMaterial color={PALETTE.brass} metalness={0.85} roughness={0.3} />
            </mesh>
          </group>
        );
      })}
      {legs.map((l, i) => (
        <Rod key={i} from={l.foot} to={l.top} radius={0.011} radiusTop={0.02} segments={10}>
          <Matte color={PALETTE.walnutDark} roughness={0.6} />
        </Rod>
      ))}
    </group>
  );
}

function labelTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#151311";
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = PALETTE.accent;
  ctx.beginPath();
  ctx.arc(32, 32, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.cream;
  ctx.fillRect(22, 30, 20, 2);
  ctx.beginPath();
  ctx.arc(32, 32, 1.5, 0, Math.PI * 2);
  ctx.fill();
  // grooves
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  for (let r = 16; r < 32; r += 2.5) {
    ctx.beginPath();
    ctx.arc(32, 32, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/**
 * Vintage turntable on the console (→ lofi audio toggle). With `playing`, the platter spins up to
 * 33⅓ and the tonearm swings onto the record; the power light glows.
 */
const ARM_PLAY = -0.44;

export function Turntable({ playing = false }: { playing?: boolean }) {
  const time = useSceneTime();
  const platter = useRef<Group>(null);
  const arm = useRef<Group>(null);
  const speed = useRef(0);
  const angle = useRef(0);
  const lastT = useRef(0);
  const [x, y, z] = ANCHORS.cassette;
  const record = useDisposable(() => labelTexture(), []);
  const ledBase = useMemo(() => new Color(PALETTE.accentSoft), []);
  const led = useDisposable(() => new MeshBasicMaterial({ toneMapped: false }), []);

  useFrame((_, delta) => {
    const t = time.current;
    const dt = Math.max(0, t - lastT.current); // 0 under reduced motion
    lastT.current = t;
    const d = Math.min(delta, 0.1);
    speed.current = MathUtils.damp(speed.current, playing ? 1 : 0, 2.5, d);
    angle.current -= dt * speed.current * 3.49; // 33⅓ rpm
    if (platter.current) platter.current.rotation.y = angle.current;
    // swings in over the record (negative = clockwise from above): -0.44 rad puts the stylus on the
    // outer groove (~0.10 from the spindle); +0.42 used to swing it away from the platter
    if (arm.current) arm.current.rotation.y = MathUtils.damp(arm.current.rotation.y, playing ? ARM_PLAY : 0, 3, d);
    led.color.copy(ledBase).multiplyScalar(0.1 + speed.current * 2.6);
  });

  return (
    <group position={[x, y, z]} rotation={[0, 0.08, 0]}>
      {/* plinth: walnut with a dark top plate */}
      <RoundedBox args={[0.36, 0.06, 0.29]} radius={0.01} smoothness={2} position={[0, 0.03, 0]}>
        <Matte color={PALETTE.walnut} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.0605, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.34, 0.27]} />
        <Matte color="#C9C2B4" roughness={0.6} />
      </mesh>
      {/* platter + record */}
      <group ref={platter} position={[-0.04, 0.066, 0]}>
        <mesh>
          <cylinderGeometry args={[0.118, 0.118, 0.01, 40]} />
          <meshStandardMaterial color="#9A9A96" metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.0065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.112, 48]} />
          <meshStandardMaterial map={record} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.012, 8]} />
          <meshStandardMaterial color="#C9C6BF" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      {/* tonearm on its pivot (back right) */}
      <group ref={arm} position={[0.13, 0.075, -0.085]}>
        <mesh>
          <cylinderGeometry args={[0.014, 0.016, 0.02, 16]} />
          <meshStandardMaterial color="#C9C6BF" metalness={0.85} roughness={0.25} />
        </mesh>
        <Rod from={[0, 0.012, 0]} to={[-0.03, 0.012, 0.19]} radius={0.003} segments={6}>
          <meshStandardMaterial color="#C9C6BF" metalness={0.85} roughness={0.25} />
        </Rod>
        <mesh position={[-0.03, 0.008, 0.2]}>
          <boxGeometry args={[0.014, 0.008, 0.024]} />
          <Matte color={PALETTE.charcoal} />
        </mesh>
      </group>
      {/* knobs + power light on the front */}
      {[-0.13, -0.1].map((kx) => (
        <mesh key={kx} position={[kx, 0.03, 0.146]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.009, 0.009, 0.008, 14]} />
          <meshStandardMaterial color="#C9C6BF" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0.14, 0.03, 0.1455]} material={led}>
        <circleGeometry args={[0.004, 12]} />
      </mesh>
    </group>
  );
}
