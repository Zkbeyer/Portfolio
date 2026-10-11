import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { CatmullRomCurve3, Color, MeshBasicMaterial, PointLight, Vector3 } from "three";
import { PALETTE } from "../../palette";
import { ANCHORS, DESK, WALL_Z } from "../layout";
import { useSceneTime } from "../../hooks/useSceneTime";
import { useDisposable } from "../../hooks/useDisposable";
import { LED_COLORS, useHomelabStatus, type HomelabState } from "../../status/homelabStatus";
import { Matte } from "./parts";

const CASE = { w: 0.13, h: 0.046, d: 0.095 } as const;
const LID_H = 0.013;
const LID = "#EFE6D6";
const PORT = "#141022";

/** LED brightness over time for each state: steady with activity flicker, slow breathe, or alarm blink. */
function ledLevel(state: HomelabState, t: number) {
  switch (state) {
    case "healthy": {
      // mostly steady, with short bursts of "disk activity"
      const burst = Math.sin(t * 0.9) > 0.55 ? (Math.sin(t * 37) > 0 ? 0.45 : 1) : 1;
      return 2.6 * burst;
    }
    case "unknown":
      return 0.9 + 1.4 * (0.5 + 0.5 * Math.sin(t * 1.6));
    case "down":
      return (t % 1) < 0.5 ? 3.2 : 0.15;
  }
}

/**
 * The homelab: a Raspberry Pi 5 in the red-and-white case on the shelf. Its status LED follows the
 * live status endpoint — green healthy, amber unknown (or unreachable), red down.
 */
export function Pi() {
  const time = useSceneTime();
  const { state } = useHomelabStatus();
  const [x, y, z] = ANCHORS.pi;
  const light = useRef<PointLight>(null);

  const base = useMemo(() => new Color(LED_COLORS[state]), [state]);
  const led = useDisposable(() => new MeshBasicMaterial({ toneMapped: false }), []);

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

  useFrame(() => {
    const level = ledLevel(state, time.current);
    led.color.copy(base).multiplyScalar(level);
    const l = light.current;
    if (l) {
      l.color.copy(base);
      l.intensity = 0.022 * level;
    }
  });

  return (
    <group>
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
      <mesh>
        <tubeGeometry args={[cable, 32, 0.003, 6, false]} />
        <Matte color="#17122A" roughness={0.6} />
      </mesh>
    </group>
  );
}
