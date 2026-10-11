import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Color, Group, MathUtils, MeshBasicMaterial } from "three";
import { PALETTE } from "../../palette";
import { ANCHORS } from "../layout";
import { useSceneTime } from "../../hooks/useSceneTime";
import { useDisposable } from "../../hooks/useDisposable";
import { Matte } from "./parts";

const BODY = { w: 0.2, h: 0.128, d: 0.05 } as const;
const BODY_COLOR = "#5B4A8A";
const TAPE = "#2A1A14";

function Reel({ tape, spin }: { tape: number; spin: (g: Group | null) => void }) {
  return (
    <group>
      {/* wound tape */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[tape, tape, 0.004, 28]} />
        <Matte color={TAPE} roughness={0.35} />
      </mesh>
      <group ref={spin} position={[0, 0, 0.0025]}>
        <mesh>
          <ringGeometry args={[0.006, 0.0105, 20]} />
          <Matte color={PALETTE.cream} roughness={0.6} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} rotation={[0, 0, (i / 6) * Math.PI * 2]} position={[0, 0, 0.0004]}>
            <planeGeometry args={[0.0018, 0.012]} />
            <Matte color={PALETTE.cream} roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/**
 * Portable cassette player (→ audio toggle). With `playing`, the reels turn and the LED glows.
 */
export function Cassette({ playing = false }: { playing?: boolean }) {
  const time = useSceneTime();
  const reels = useRef<(Group | null)[]>([]);
  const speed = useRef(0);
  const angle = useRef(0);
  const lastT = useRef(0);
  const [x, y, z] = ANCHORS.cassette;

  const ledBase = useMemo(() => new Color(PALETTE.lamp), []);
  const led = useDisposable(() => new MeshBasicMaterial({ toneMapped: false }), []);

  useFrame((_, delta) => {
    const t = time.current;
    const dt = Math.max(0, t - lastT.current); // 0 under reduced motion: reels hold still
    lastT.current = t;
    speed.current = MathUtils.damp(speed.current, playing ? 1 : 0, 3, Math.min(delta, 0.1));
    angle.current -= dt * speed.current * 2.4;
    reels.current.forEach((r, i) => {
      // the take-up reel (less tape) spins a bit faster
      if (r) r.rotation.z = angle.current * (i === 0 ? 0.85 : 1.15);
    });
    led.color.copy(ledBase).multiplyScalar(0.12 + speed.current * 2.6);
  });

  const windowY = 0.074;
  const frontZ = BODY.d / 2;

  return (
    <group position={[x, y, z]} rotation={[0, -0.32, 0]}>
      <RoundedBox args={[BODY.w, BODY.h, BODY.d]} radius={0.012} smoothness={3} position={[0, BODY.h / 2, 0]}>
        <Matte color={BODY_COLOR} roughness={0.55} />
      </RoundedBox>
      {/* cassette window */}
      <group position={[0, windowY, frontZ + 0.0008]}>
        <mesh>
          <planeGeometry args={[0.152, 0.072]} />
          <meshStandardMaterial color="#17122A" roughness={0.15} metalness={0.2} />
        </mesh>
        {/* cassette shell + label */}
        <mesh position={[0, 0, 0.0005]}>
          <planeGeometry args={[0.14, 0.062]} />
          <Matte color="#2B2340" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.021, 0.001]}>
          <planeGeometry args={[0.13, 0.016]} />
          <Matte color={PALETTE.cream} />
        </mesh>
        <mesh position={[0, 0.021, 0.0012]}>
          <planeGeometry args={[0.13, 0.003]} />
          <Matte color={PALETTE.piRed} />
        </mesh>
        <group position={[-0.036, -0.006, 0.001]}>
          <Reel tape={0.02} spin={(g) => (reels.current[0] = g)} />
        </group>
        <group position={[0.036, -0.006, 0.001]}>
          <Reel tape={0.015} spin={(g) => (reels.current[1] = g)} />
        </group>
      </group>
      {/* speaker grille dots */}
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={i} position={[-0.075 + (i % 9) * 0.0185, 0.018 + Math.floor(i / 9) * 0.012, frontZ + 0.0006]}>
          <circleGeometry args={[0.003, 8]} />
          <Matte color="#2E2548" />
        </mesh>
      ))}
      {/* transport buttons on top; play sits pressed while playing */}
      {["#C4505E", "#E6D3B3", "#E6D3B3", "#E6D3B3"].map((c, i) => (
        <mesh key={i} position={[-0.05 + i * 0.033, BODY.h + (i === 0 && playing ? 0.002 : 0.006), 0.004]}>
          <boxGeometry args={[0.027, 0.012, 0.03]} />
          <Matte color={c} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[BODY.w / 2 - 0.018, BODY.h - 0.016, frontZ + 0.001]} material={led}>
        <circleGeometry args={[0.004, 12]} />
      </mesh>
    </group>
  );
}
