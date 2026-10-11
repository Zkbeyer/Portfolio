import { useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Color, InstancedMesh, MathUtils, Matrix4, ShaderMaterial, Vector2 } from "three";
import { PALETTE } from "../../palette";
import { ANCHORS } from "../layout";
import { useSceneTime } from "../../hooks/useSceneTime";
import { useDisposable } from "../../hooks/useDisposable";
import { setUniform } from "../window/uniforms";
import { UV_VERT } from "../window/shaders";
import { CODE_FRAG } from "./shaders";
import { Matte } from "./parts";

export const SCREEN = { width: 0.66, height: 0.39 } as const;
const BEZEL = { width: 0.72, height: 0.45, depth: 0.04 } as const;

/** Monitor on a stand with a self-typing code editor, plus the keyboard in front of it. */
export function Monitor({ active = false }: { active?: boolean }) {
  const time = useSceneTime();
  const gain = useRef(1);
  const [sx, sy, sz] = ANCHORS.monitorScreen;
  const [mx, my, mz] = ANCHORS.monitor;
  const bezelZ = sz - 0.006 - BEZEL.depth / 2;

  const material = useDisposable(
    () =>
      new ShaderMaterial({
        vertexShader: UV_VERT,
        fragmentShader: CODE_FRAG,
        toneMapped: false,
        uniforms: {
          uTime: { value: 0 },
          uGrid: { value: new Vector2(52, 19) },
          uGain: { value: 1 },
          uBg: { value: new Color("#121735") },
          uLineHi: { value: new Color("#0B0E26") },
          uGutter: { value: new Color("#4C5590") },
          uIdent: { value: new Color(PALETTE.cream).multiplyScalar(1.15) },
          uKey: { value: new Color("#FF8FB1").multiplyScalar(1.2) },
          uStr: { value: new Color(PALETTE.led).multiplyScalar(1.1) },
          uNum: { value: new Color(PALETTE.lamp).multiplyScalar(1.2) },
          uComment: { value: new Color("#6F68A0") },
        },
      }),
    [],
  );

  useFrame((_, delta) => {
    gain.current = MathUtils.damp(gain.current, active ? 1.35 : 1, 6, Math.min(delta, 0.1));
    setUniform(material, "uTime", time.current);
    setUniform(material, "uGain", gain.current);
  });

  return (
    <group>
      {/* stand */}
      <RoundedBox args={[0.26, 0.016, 0.17]} radius={0.007} smoothness={2} position={[mx, my + 0.008, mz - 0.02]}>
        <Matte color={PALETTE.ink} roughness={0.6} />
      </RoundedBox>
      <mesh position={[mx, my + 0.16, bezelZ - 0.035]}>
        <boxGeometry args={[0.045, 0.3, 0.025]} />
        <Matte color={PALETTE.ink} roughness={0.6} />
      </mesh>
      {/* bezel + screen */}
      <RoundedBox args={[BEZEL.width, BEZEL.height, BEZEL.depth]} radius={0.014} smoothness={3} position={[sx, sy, bezelZ]}>
        <Matte color="#1B1630" roughness={0.5} />
      </RoundedBox>
      <mesh position={[sx, sy, sz - 0.004]} material={material}>
        <planeGeometry args={[SCREEN.width, SCREEN.height]} />
      </mesh>
      {/* power LED */}
      <mesh position={[sx + BEZEL.width / 2 - 0.035, sy - BEZEL.height / 2 + 0.014, sz - 0.005]}>
        <circleGeometry args={[0.004, 10]} />
        <meshBasicMaterial color={new Color(PALETTE.screen).multiplyScalar(2)} toneMapped={false} />
      </mesh>
      <Keyboard />
    </group>
  );
}

const KEY_ROWS = 4;
const KEY_COLS = 13;
const SPACE = { from: 4, to: 8 } as const; // bottom-row columns replaced by the space bar

/** Low keyboard: one instanced mesh for the keys so it costs a single draw call. */
function Keyboard() {
  const [mx, my] = ANCHORS.monitor;
  const keys = useRef<InstancedMesh>(null);
  const count = KEY_ROWS * KEY_COLS - (SPACE.to - SPACE.from + 1);

  useLayoutEffect(() => {
    const mesh = keys.current;
    if (!mesh) return;
    const m = new Matrix4();
    let i = 0;
    for (let r = 0; r < KEY_ROWS; r++) {
      for (let c = 0; c < KEY_COLS; c++) {
        if (r === KEY_ROWS - 1 && c >= SPACE.from && c <= SPACE.to) continue;
        m.makeTranslation(-0.198 + c * 0.033, 0.019, -0.045 + r * 0.03);
        mesh.setMatrixAt(i++, m);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group position={[mx, my, -0.88]} rotation={[0.04, 0, 0]}>
      <RoundedBox args={[0.44, 0.016, 0.14]} radius={0.006} smoothness={2} position={[0, 0.008, 0]}>
        <Matte color="#2E2548" roughness={0.7} />
      </RoundedBox>
      <instancedMesh ref={keys} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.027, 0.008, 0.024]} />
        <Matte color="#3E3360" roughness={0.75} />
      </instancedMesh>
      <mesh position={[-0.198 + ((SPACE.from + SPACE.to) / 2) * 0.033, 0.019, -0.045 + (KEY_ROWS - 1) * 0.03]}>
        <boxGeometry args={[(SPACE.to - SPACE.from) * 0.033 + 0.027, 0.008, 0.024]} />
        <Matte color="#4B3B66" roughness={0.75} />
      </mesh>
    </group>
  );
}
