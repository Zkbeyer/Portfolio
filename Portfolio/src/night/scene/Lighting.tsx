import { useEffect, useMemo } from "react";
import { Environment } from "@react-three/drei";
import { Object3D } from "three";
import nightHdr from "@pmndrs/assets/hdri/night.exr";
import { PALETTE } from "../palette";
import { ANCHORS, LANTERN, WINDOW_CENTER } from "./layout";

/** Warm lamp key + paper-lantern glow, cool moonlight from the window, monitor fill, dim night environment. */
export function Lighting() {
  const lampTarget = useMemo(() => new Object3D(), []);
  useEffect(() => {
    lampTarget.position.set(ANCHORS.lampHead[0] + 0.45, ANCHORS.lamp[1], ANCHORS.lampHead[2] + 0.1);
    lampTarget.updateMatrixWorld();
  }, [lampTarget]);

  return (
    <>
      <hemisphereLight args={["#7D8AA8", "#3A2A1E", 0.55]} />

      {/* desk lamp key */}
      <primitive object={lampTarget} />
      <spotLight
        position={ANCHORS.lampHead}
        target={lampTarget}
        color={PALETTE.lamp}
        intensity={7.5}
        angle={0.95}
        penumbra={0.85}
        distance={6}
        decay={2}
      />
      <pointLight position={[ANCHORS.lampHead[0], ANCHORS.lampHead[1] - 0.15, ANCHORS.lampHead[2] + 0.1]} color={PALETTE.lamp} intensity={4} distance={3.4} decay={2} />

      {/* paper lantern: soft warm pool over the room */}
      <pointLight position={[LANTERN.position[0], LANTERN.position[1] - 0.05, LANTERN.position[2]]} color="#FFD3A0" intensity={2.6} distance={5} decay={2} />

      {/* cool moonlight through the window */}
      <directionalLight position={[WINDOW_CENTER[0] + 0.4, WINDOW_CENTER[1] + 1.2, WINDOW_CENTER[2] - 2]} color="#A8B6E0" intensity={0.55} />
      <pointLight position={[WINDOW_CENTER[0], WINDOW_CENTER[1], WINDOW_CENTER[2] + 0.4]} color="#9FB0E0" intensity={1.8} distance={3.2} decay={2} />

      {/* monitor glow */}
      <pointLight position={[ANCHORS.monitorScreen[0], ANCHORS.monitorScreen[1], ANCHORS.monitorScreen[2] + 0.35]} color={PALETTE.screen} intensity={3} distance={2.6} decay={2} />

      <Environment files={nightHdr} environmentIntensity={0.3} />
    </>
  );
}
