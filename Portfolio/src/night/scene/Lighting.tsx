import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { DirectionalLight, Object3D, PointLight } from "three";
import nightHdr from "@pmndrs/assets/hdri/night.exr";
import { PALETTE } from "../palette";
import { ANCHORS, WINDOW_CENTER } from "./layout";
import { Dimmable } from "./LightDriver";
import { skyNow } from "./timeOfDay";

/** Light through the window: colour + strength follow the time of day (moonlight at night, grey by day). */
function WindowLight() {
  const dir = useRef<DirectionalLight>(null);
  const fill = useRef<PointLight>(null);
  const seen = useRef(-1);
  useFrame(() => {
    const { sky, version } = skyNow();
    if (version === seen.current || !dir.current || !fill.current) return;
    seen.current = version;
    dir.current.color.copy(sky.light);
    fill.current.color.copy(sky.light);
    dir.current.intensity = 0.3 * sky.lightI;
    fill.current.intensity = 1.1 * sky.lightI;
  });
  return (
    <>
      <directionalLight ref={dir} position={[WINDOW_CENTER[0] + 0.4, WINDOW_CENTER[1] + 1.2, WINDOW_CENTER[2] - 2]} color="#A8B6E0" intensity={0.3} />
      <pointLight ref={fill} position={[WINDOW_CENTER[0], WINDOW_CENTER[1], WINDOW_CENTER[2] + 0.4]} color="#9FB0E0" intensity={1.1} distance={3.2} decay={2} />
    </>
  );
}

/**
 * Dark room, small lamps only (Zack): the desk lamp is the key, light from the window, monitor fill and a
 * very dim environment. The accent lamps carry their own lights in props/AccentLamps.tsx. Each group is
 * wrapped in <Dimmable> so the intro flicker and the light switch can drive it (LightDriver.tsx).
 */
export function Lighting() {
  const lampTarget = useMemo(() => new Object3D(), []);
  useEffect(() => {
    lampTarget.position.set(ANCHORS.lampHead[0] + 0.45, ANCHORS.lamp[1], ANCHORS.lampHead[2] + 0.1);
    lampTarget.updateMatrixWorld();
  }, [lampTarget]);

  return (
    <>
      <Dimmable group="ambient">
        <hemisphereLight args={["#6C7894", "#2A1C14", 0.16]} />
      </Dimmable>

      {/* desk lamp key */}
      <primitive object={lampTarget} />
      <Dimmable group="desk">
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
      </Dimmable>

      <WindowLight />

      {/* glow from both monitors */}
      <Dimmable group="screens">
        <pointLight position={[ANCHORS.monitorsCenter[0], ANCHORS.monitorsCenter[1], ANCHORS.monitorsCenter[2] + 0.35]} color={PALETTE.screen} intensity={2.2} distance={2.4} decay={2} />
      </Dimmable>

      <Environment files={nightHdr} environmentIntensity={0.1} />
    </>
  );
}
