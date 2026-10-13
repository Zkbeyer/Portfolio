import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Color, InstancedMesh, MathUtils, Matrix4, MeshBasicMaterial, ShaderMaterial, Vector2, type Material } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { PALETTE } from "../../palette";
import { ANCHORS, DESK, RISER, type Vec3 } from "../layout";
import { useSceneTime } from "../../hooks/useSceneTime";
import { useDisposable } from "../../hooks/useDisposable";
import { setUniform } from "../window/uniforms";
import { UV_VERT } from "../window/shaders";
import { CODE_FRAG } from "./shaders";
import { Matte } from "./parts";
import { HOMELAB_PODS, type CanvasScreen, detailScreen, homelabScreen, playlistRowAt, playlistScreen } from "./screenTextures";
import { setProjectCursor, useProjectCursor } from "../../ui/projectCursor";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export const SCREEN = { width: 0.66, height: 0.39 } as const;
const SCREEN2 = { width: 0.34, height: 0.58 } as const;
const BEZEL_PAD = { side: 0.03, bottom: 0.03, depth: 0.035 } as const;
const BEZEL = "#2A2724";

type Scheme = { bg: string; hi: string; gutter: string; ident: string; key: string; str: string; num: string; comment: string };

// Main screen: an editor. Second screen: a terminal tailing logs (greens + ambers on near-black).
const EDITOR: Scheme = {
  bg: "#1A1B22",
  hi: "#121318",
  gutter: "#5B5A66",
  ident: PALETTE.cream,
  key: PALETTE.accentSoft,
  str: PALETTE.sage,
  num: PALETTE.mustard,
  comment: "#7A7468",
};
const TERMINAL: Scheme = {
  bg: "#121614",
  hi: "#0C0F0D",
  gutter: "#3E4A43",
  ident: "#B9D8C2",
  key: PALETTE.led,
  str: "#9FC9B0",
  num: PALETTE.mustard,
  comment: "#55665C",
};

function useCodeMaterial(grid: [number, number], s: Scheme, speed: number) {
  return useDisposable(
    () =>
      new ShaderMaterial({
        vertexShader: UV_VERT,
        fragmentShader: CODE_FRAG,
        toneMapped: false,
        uniforms: {
          uTime: { value: 0 },
          uSpeed: { value: speed },
          uGrid: { value: new Vector2(...grid) },
          uGain: { value: 1 },
          uBg: { value: new Color(s.bg) },
          uLineHi: { value: new Color(s.hi) },
          uGutter: { value: new Color(s.gutter) },
          uIdent: { value: new Color(s.ident).multiplyScalar(1.12) },
          uKey: { value: new Color(s.key).multiplyScalar(1.2) },
          uStr: { value: new Color(s.str).multiplyScalar(1.1) },
          uNum: { value: new Color(s.num).multiplyScalar(1.2) },
          uComment: { value: new Color(s.comment) },
        },
      }),
    [],
  );
}

/** One monitor: charcoal bezel, glowing code screen, slim stand with a round oak foot. */
function Screen({
  center,
  size,
  rotationY = 0,
  material,
  baseY,
  onPointerMove,
}: {
  center: Vec3;
  size: { width: number; height: number };
  rotationY?: number;
  material: Material;
  baseY: number;
  onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const bw = size.width + BEZEL_PAD.side * 2;
  const bh = size.height + BEZEL_PAD.side + BEZEL_PAD.bottom;
  const neckH = center[1] - size.height / 2 - baseY;
  return (
    <group position={center} rotation={[0, rotationY, 0]}>
      <RoundedBox args={[bw, bh, BEZEL_PAD.depth]} radius={0.012} smoothness={3} position={[0, (BEZEL_PAD.side - BEZEL_PAD.bottom) / 2, -BEZEL_PAD.depth / 2 - 0.004]}>
        <Matte color={BEZEL} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0005]} material={material} onPointerMove={onPointerMove}>
        <planeGeometry args={[size.width, size.height]} />
      </mesh>
      {/* neck + round oak foot */}
      <mesh position={[0, -size.height / 2 - neckH / 2, -0.05]}>
        <boxGeometry args={[0.04, neckH, 0.022]} />
        <Matte color={BEZEL} roughness={0.5} />
      </mesh>
      <mesh position={[0, -(center[1] - baseY) + 0.008, -0.05]}>
        <cylinderGeometry args={[0.09, 0.095, 0.016, 28]} />
        <Matte color={PALETTE.oakLight} roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Walnut riser board on two short blocks, spanning both monitors. */
function Riser() {
  const w = RISER.x1 - RISER.x0;
  const cx = (RISER.x0 + RISER.x1) / 2;
  const top = DESK.topY + RISER.height;
  return (
    <group>
      <RoundedBox args={[w, 0.028, RISER.depth]} radius={0.008} smoothness={2} position={[cx, top - 0.014, RISER.z]}>
        <Matte color={PALETTE.walnut} roughness={0.6} />
      </RoundedBox>
      {[RISER.x0 + 0.08, RISER.x1 - 0.08].map((x) => (
        <mesh key={x} position={[x, DESK.topY + (RISER.height - 0.028) / 2, RISER.z]}>
          <boxGeometry args={[0.05, RISER.height - 0.028, RISER.depth - 0.04]} />
          <Matte color={PALETTE.walnutDark} roughness={0.65} />
        </mesh>
      ))}
    </group>
  );
}

/** What the screens show: idle code, the project playlist (monitor focused) or the homelab terminal (Pi focused). */
export type MonitorMode = "code" | "projects" | "homelab";

/** Canvas screen in a basic material (unlit, like a real display; kept under the bloom threshold). */
function useScreenMaterial<T>(make: () => CanvasScreen<T>) {
  const [screen] = useState(make);
  const material = useDisposable(() => new MeshBasicMaterial({ map: screen.texture, toneMapped: false, color: new Color(0.92, 0.92, 0.92) }), []);
  useEffect(() => () => screen.dispose(), [screen]);
  return { screen, material };
}

/**
 * Dual-monitor setup (→ projects): editor on the landscape main screen, a log-tailing terminal on the
 * portrait second screen angled in from the right, on a walnut riser; keyboard + mouse on a felt mat.
 * Focused, the main screen becomes the project playlist (hover a row or use ↑/↓ to highlight it) and
 * the portrait screen shows the highlighted project; with the Pi focused, the main screen runs the
 * homelab terminal.
 */
export function Monitor({ active = false, mode = "code" }: { active?: boolean; mode?: MonitorMode }) {
  const time = useSceneTime();
  const reduced = usePrefersReducedMotion();
  const gain = useRef(1);
  const editor = useCodeMaterial([52, 19], EDITOR, 1);
  const terminal = useCodeMaterial([28, 44], TERMINAL, 1.7);
  const cursor = useProjectCursor();
  const playlist = useScreenMaterial(() => playlistScreen(cursor));
  const detail = useScreenMaterial(() => detailScreen(cursor));
  const homelab = useScreenMaterial(() => homelabScreen(0));
  const baseY = DESK.topY + RISER.height;

  useEffect(() => {
    playlist.screen.draw(cursor);
    detail.screen.draw(cursor);
  }, [cursor, playlist.screen, detail.screen]);

  // homelab terminal "prints" one pod per beat after the camera arrives
  useEffect(() => {
    if (mode !== "homelab") {
      homelab.screen.draw(0);
      return;
    }
    if (reduced) {
      homelab.screen.draw(HOMELAB_PODS.length);
      return;
    }
    const timers = Array.from({ length: HOMELAB_PODS.length }, (_, i) =>
      window.setTimeout(() => {
        homelab.screen.draw(i + 1);
        window.dispatchEvent(new CustomEvent("night:pod-line"));
      }, 700 + i * 380),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [mode, reduced, homelab.screen]);

  useFrame((_, delta) => {
    gain.current = MathUtils.damp(gain.current, active ? 1.35 : 1, 6, Math.min(delta, 0.1));
    for (const m of [editor, terminal]) {
      setUniform(m, "uTime", time.current);
      setUniform(m, "uGain", gain.current);
    }
  });

  const main = mode === "projects" ? playlist.material : mode === "homelab" ? homelab.material : editor;
  const side = mode === "projects" ? detail.material : terminal;
  const pick = (e: ThreeEvent<PointerEvent>) => {
    if (mode !== "projects" || !e.uv) return;
    const row = playlistRowAt(e.uv.x, e.uv.y);
    if (row !== null) setProjectCursor(row);
  };

  return (
    <group>
      <Riser />
      <Screen center={ANCHORS.monitorScreen} size={SCREEN} material={main} baseY={baseY} onPointerMove={pick} />
      <Screen center={ANCHORS.monitor2Screen} size={SCREEN2} rotationY={-0.42} material={side} baseY={baseY} />
      <DeskMat />
      <Keyboard />
      <Mouse />
    </group>
  );
}

const MAT = { x: ANCHORS.monitor[0] + 0.18, z: -0.88, w: 0.82, d: 0.32 } as const;

function DeskMat() {
  return (
    <RoundedBox args={[MAT.w, 0.004, MAT.d]} radius={0.002} smoothness={2} position={[MAT.x, DESK.topY + 0.002, MAT.z]}>
      <Matte color="#4A4540" roughness={1} />
    </RoundedBox>
  );
}

const KEY_ROWS = 4;
const KEY_COLS = 13;
const SPACE = { from: 4, to: 8 } as const; // bottom-row columns replaced by the space bar
const KEYCAP = "#E6DDCC";
const KEYCAP_DARK = "#A79E8E";

/** Retro keyboard: cream keycaps, greige modifiers, reddish-orange Esc and Enter. One instanced draw call. */
function Keyboard() {
  const x = ANCHORS.monitor[0] + 0.05;
  const keys = useRef<InstancedMesh>(null);
  const count = KEY_ROWS * KEY_COLS - (SPACE.to - SPACE.from + 1);

  useLayoutEffect(() => {
    const mesh = keys.current;
    if (!mesh) return;
    const m = new Matrix4();
    const c = new Color();
    let i = 0;
    for (let r = 0; r < KEY_ROWS; r++) {
      for (let col = 0; col < KEY_COLS; col++) {
        if (r === KEY_ROWS - 1 && col >= SPACE.from && col <= SPACE.to) continue;
        m.makeTranslation(-0.198 + col * 0.033, 0.019, -0.045 + r * 0.03);
        mesh.setMatrixAt(i, m);
        const edge = col === 0 || col === KEY_COLS - 1 || r === KEY_ROWS - 1;
        if ((r === 0 && col === 0) || (r === 2 && col === KEY_COLS - 1)) c.set(PALETTE.accent);
        else c.set(edge ? KEYCAP_DARK : KEYCAP);
        mesh.setColorAt(i, c);
        i++;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  return (
    <group position={[x, DESK.topY + 0.004, -0.88]} rotation={[0.04, 0, 0]}>
      <RoundedBox args={[0.44, 0.016, 0.14]} radius={0.006} smoothness={2} position={[0, 0.008, 0]}>
        <Matte color={PALETTE.greige} roughness={0.7} />
      </RoundedBox>
      <instancedMesh ref={keys} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.027, 0.009, 0.024]} />
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
      <mesh position={[-0.198 + ((SPACE.from + SPACE.to) / 2) * 0.033, 0.019, -0.045 + (KEY_ROWS - 1) * 0.03]}>
        <boxGeometry args={[(SPACE.to - SPACE.from) * 0.033 + 0.027, 0.009, 0.024]} />
        <Matte color={KEYCAP} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Mouse() {
  return (
    <mesh position={[MAT.x + MAT.w / 2 - 0.12, DESK.topY + 0.016, MAT.z + 0.02]} scale={[0.6, 0.32, 1]}>
      <sphereGeometry args={[0.05, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <Matte color={PALETTE.cream} roughness={0.5} />
    </mesh>
  );
}
