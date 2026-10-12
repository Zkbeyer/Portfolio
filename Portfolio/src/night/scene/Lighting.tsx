import { useEffect, useMemo } from "react";
import { Environment } from "@react-three/drei";
import { Object3D } from "three";
import nightHdr from "@pmndrs/assets/hdri/night.exr";
import { PALETTE } from "../palette";
import { ANCHORS, WINDOW_CENTER } from "./layout";

/**
 * Dark room, small lamps only (Zack): the desk lamp is the key, moonlight from the window, monitor fill and a
 * very dim environment. The accent lamps (sunset projector, lava lamp, mushroom lamp) carry their own lights
 * in props/AccentLamps.tsx.
 */
export function Lighting() {
  const lampTarget = useMemo(() => new Object3D(), []);
  useEffect(() => {
    lampTarget.position.set(ANCHORS.lampHead[0] + 0.45, ANCHORS.lamp[1], ANCHORS.lampHead[2] + 0.1);
    lampTarget.updateMatrixWorld();
  }, [lampTarget]);

  return (
    <>
      <hemisphereLight args={["#6C7894", "#2A1C14", 0.16]} />

      {/* desk lamp key */}
      <primitive object={lampTarget} />
      <spotLight
        position={ANCHORS.lampHead}
        target={lampTarget}
        color={PALETTE.lamp}
        intensity={5}
        angle={0.8}
        penumbra={0.85}
        distance={6}
        decay={2}
      />
      <pointLight position={[ANCHORS.lampHead[0], ANCHORS.lampHead[1] - 0.15, ANCHORS.lampHead[2] + 0.1]} color={PALETTE.lamp} intensity={2.2} distance={2.6} decay={2} />

      {/* cool moonlight through the window */}
      <directionalLight position={[WINDOW_CENTER[0] + 0.4, WINDOW_CENTER[1] + 1.2, WINDOW_CENTER[2] - 2]} color="#A8B6E0" intensity={0.3} />
      <pointLight position={[WINDOW_CENTER[0], WINDOW_CENTER[1], WINDOW_CENTER[2] + 0.4]} color="#9FB0E0" intensity={1.1} distance={3.2} decay={2} />

      {/* glow from both monitors */}
      <pointLight position={[ANCHORS.monitorsCenter[0], ANCHORS.monitorsCenter[1], ANCHORS.monitorsCenter[2] + 0.35]} color={PALETTE.screen} intensity={2.2} distance={2.4} decay={2} />

      <Environment files={nightHdr} environmentIntensity={0.1} />
    </>
  );
}
