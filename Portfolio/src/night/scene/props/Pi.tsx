import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { CanvasTexture, CatmullRomCurve3, Color, MathUtils, MeshBasicMaterial, PointLight, SRGBColorSpace, Vector3 } from "three";
import { PALETTE } from "../../palette";
import { ANCHORS, DESK, SHELF, WALL_Z } from "../layout";
import { useSceneTime } from "../../hooks/useSceneTime";
import { useDisposable } from "../../hooks/useDisposable";
import { Matte } from "./parts";
import { HOMELAB_PODS, PLAYLIST_SIZE, homelabScreen } from "./screenTextures";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

const CASE = { w: 0.13, h: 0.046, d: 0.095 } as const;
const LID_H = 0.013;
const LID = "#EFE6D6";
const PORT = "#161412";

/**
 * LED level: steady green with short bursts of "disk activity" (no live status — Zack, 2026-10-12),
 * plus `pulse`, a flash for each line the homelab terminal prints while the Pi is focused.
 */
function ledLevel(t: number, pulse: number) {
  const burst = Math.sin(t * 0.9) > 0.55 ? (Math.sin(t * 37) > 0 ? 0.45 : 1) : 1;
  return 2.6 * burst + 3 * pulse;
}

/** Handwritten sticky note for the shelf edge under the Pi. */
function stickyTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 220;
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  const draw = () => {
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#F2D27A";
    ctx.fillRect(0, 0, 256, 220);
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(0, 0, 256, 34);
    ctx.fillStyle = "#3A2E22";
    ctx.font = '600 44px "Caveat", "Segoe Print", cursive';
    ctx.fillText("homelab", 26, 92);
    ctx.font = '600 38px "Caveat", "Segoe Print", cursive';
    ctx.fillText("status: running", 22, 150);
    ctx.fillStyle = PALETTE.led;
    ctx.beginPath();
    ctx.arc(222, 138, 9, 0, Math.PI * 2);
    ctx.fill();
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.load('600 40px "Caveat"').then(draw).catch(() => {});
  return tex;
}

/**
 * The homelab: a Raspberry Pi 5 in the red-and-white case on the shelf with a little status display
 * beside it (kubectl get pods), a cable down the wall and a sticky note ("status: running") on the shelf edge. The LED is a steady green with activity flicker.
 */
/** Little 5" status display beside the Pi (the homelab's "look closer" content). */
const DISPLAY = { w: 0.14, x: -0.16, tilt: -0.22 } as const;

function PiDisplay({ focused }: { focused: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [screen] = useState(() => homelabScreen(HOMELAB_PODS.length));
  const material = useDisposable(
    () => new MeshBasicMaterial({ map: screen.texture, toneMapped: false, color: new Color(0.9, 0.9, 0.9) }),
    [],
  );
  useEffect(() => () => screen.dispose(), [screen]);

  // on focus the terminal "prints" again, one pod per beat (the Pi LED flashes with each line)
  useEffect(() => {
    if (!focused || reduced) {
      screen.draw(HOMELAB_PODS.length);
      return;
    }
    screen.draw(0);
    const timers = Array.from({ length: HOMELAB_PODS.length }, (_, i) =>
      window.setTimeout(() => {
        screen.draw(i + 1);
        window.dispatchEvent(new CustomEvent("night:pod-line"));
      }, 650 + i * 380),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [focused, reduced, screen]);

  const h = (DISPLAY.w * PLAYLIST_SIZE.h) / PLAYLIST_SIZE.w;
  return (
    <group position={[DISPLAY.x, 0, 0.01]} rotation={[0, 0.12, 0]}>
      {/* foot + tilted bezel */}
      <mesh position={[0, 0.006, 0.01]}>
        <boxGeometry args={[0.08, 0.012, 0.05]} />
        <Matte color="#2A2724" roughness={0.6} />
      </mesh>
      <group position={[0, 0.012 + h / 2 + 0.008, 0]} rotation={[DISPLAY.tilt, 0, 0]}>
        <mesh position={[0, 0, -0.006]}>
          <boxGeometry args={[DISPLAY.w + 0.014, h + 0.014, 0.01]} />
          <Matte color="#2A2724" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0, 0.0002]} material={material}>
          <planeGeometry args={[DISPLAY.w, h]} />
        </mesh>
      </group>
    </group>
  );
}

export function Pi({ focused = false }: { focused?: boolean }) {
  const time = useSceneTime();
  const [x, y, z] = ANCHORS.pi;
  const light = useRef<PointLight>(null);
  const pulse = useRef(0);

  const base = useMemo(() => new Color(PALETTE.led), []);
  const led = useDisposable(() => new MeshBasicMaterial({ toneMapped: false }), []);
  const sticky = useDisposable(stickyTexture, []);

  useEffect(() => {
    if (!focused) return;
    const onLine = () => (pulse.current = 1);
    window.addEventListener("night:pod-line", onLine);
    return () => window.removeEventListener("night:pod-line", onLine);
  }, [focused]);

  const cable = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(x + 0.035, y + 0.015, z - 0.04),
        new Vector3(x + 0.05, y + 0.012, WALL_Z + 0.02),
        new Vector3(x + 0.07, y - 0.06, WALL_Z + 0.012),
        new Vector3(x + 0.08, y - 0.5, WALL_Z + 0.012),
        new Vector3(x + 0.1, DESK.topY + 0.004, WALL_Z + 0.05),
      ]),
    [x, y, z],
  );

  useFrame((_, delta) => {
    pulse.current = MathUtils.damp(pulse.current, 0, 7, Math.min(delta, 0.1));
    const level = ledLevel(time.current, pulse.current);
    led.color.copy(base).multiplyScalar(level);
    const l = light.current;
    if (l) {
      l.color.copy(base);
      l.intensity = 0.022 * level;
    }
  });

  return (
    <group>
      <group position={[x, y, z]}>
        <PiDisplay focused={focused} />
      </group>
      <group position={[x, y, z]} rotation={[0, 0.22, 0]}>
        <RoundedBox args={[CASE.w, CASE.h - LID_H, CASE.d]} radius={0.006} smoothness={2} position={[0, (CASE.h - LID_H) / 2, 0]}>
          <Matte color={PALETTE.piRed} roughness={0.45} />
        </RoundedBox>
        <RoundedBox args={[CASE.w + 0.001, LID_H, CASE.d + 0.001]} radius={0.005} smoothness={2} position={[0, CASE.h - LID_H / 2, 0]}>
          <Matte color={LID} roughness={0.5} />
        </RoundedBox>
        {/* fan grille on the lid */}
        <mesh position={[0.012, CASE.h + 0.0006, -0.004]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.012, 0.022, 24]} />
          <Matte color="#CFC4B3" roughness={0.6} />
        </mesh>
        <mesh position={[0.012, CASE.h + 0.0005, -0.004]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.012, 20]} />
          <Matte color={PORT} />
        </mesh>
        {/* front ports: 2× USB stacks + ethernet */}
        {[-0.012, 0.016].map((px) => (
          <mesh key={px} position={[px, 0.015, CASE.d / 2 + 0.0006]}>
            <planeGeometry args={[0.016, 0.017]} />
            <Matte color={PORT} />
          </mesh>
        ))}
        <mesh position={[0.045, 0.015, CASE.d / 2 + 0.0006]}>
          <planeGeometry args={[0.019, 0.018]} />
          <Matte color={PORT} />
        </mesh>
        {/* status LED */}
        <mesh position={[-0.048, 0.017, CASE.d / 2 + 0.002]} material={led}>
          <sphereGeometry args={[0.0045, 10, 8]} />
        </mesh>
        <pointLight ref={light} position={[-0.048, 0.02, CASE.d / 2 + 0.03]} distance={0.45} decay={2} />
      </group>
      {/* sticky note on the shelf's front edge, just under the Pi */}
      <mesh position={[x - 0.02, SHELF.center[1] + 0.0225 - 0.037, SHELF.center[2] + SHELF.depth / 2 + 0.003]} rotation={[0, 0, -0.06]}>
        <planeGeometry args={[0.085, 0.073]} />
        <meshStandardMaterial map={sticky} roughness={0.9} emissiveMap={sticky} emissive="#ffffff" emissiveIntensity={0.18} />
      </mesh>
      <mesh>
        <tubeGeometry args={[cable, 32, 0.003, 6, false]} />
        <Matte color="#2A2724" roughness={0.6} />
      </mesh>
    </group>
  );
}
