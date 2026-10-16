import { useFrame } from "@react-three/fiber";
import { Color, ShaderMaterial, Vector2 } from "three";
import { PALETTE } from "../../palette";
import { OUTSIDE, WALL_Z, WINDOW } from "../layout";
import { BASE_SHOT } from "../focus";
import { useSceneTime } from "../../hooks/useSceneTime";
import { useDisposable } from "../../hooks/useDisposable";
import { setUniform } from "./uniforms";
import { SKY_FRAG, UV_VERT } from "./shaders";
import { skyNow } from "../timeOfDay";

/** Sky backdrop: gradient, twinkling stars, moon with halo — coloured by the visitor's local time (timeOfDay.ts). */
export function Sky() {
  const time = useSceneTime();
  const { center, size } = OUTSIDE.sky;

  const material = useDisposable(() => {
    const [w, h] = size;
    const left = center[0] - w / 2;
    const bottom = center[1] - h / 2;
    // v range seen through the window from the base shot, so the gradient lands where it's visible
    const [, cy, cz] = BASE_SHOT.position;
    const k = (cz - center[2]) / (cz - WALL_Z);
    const vAt = (y: number) => (cy + (y - cy) * k - bottom) / h;
    return new ShaderMaterial({
      vertexShader: UV_VERT,
      fragmentShader: SKY_FRAG,
      depthWrite: false,
      toneMapped: false,
      uniforms: {
        uTop: { value: new Color(PALETTE.skyTop) },
        uMid: { value: new Color(PALETTE.skyMid) },
        uLow: { value: new Color(PALETTE.skyLow) },
        uMoon: { value: new Color(PALETTE.moon) },
        uMoonPos: {
          value: new Vector2((OUTSIDE.moon.position[0] - left) / w, (OUTSIDE.moon.position[1] - bottom) / h),
        },
        uMoonR: { value: OUTSIDE.moon.radius / h },
        uAspect: { value: w / h },
        uBand: { value: new Vector2(vAt(WINDOW.y0), vAt(WINDOW.y1)) },
        uTime: { value: 0 },
        uStars: { value: 1 },
        uMoonAmt: { value: 1 },
      },
    });
  }, [center, size]);

  useFrame(() => {
    setUniform(material, "uTime", time.current);
    const { sky } = skyNow();
    (material.uniforms.uTop.value as Color).copy(sky.top);
    (material.uniforms.uMid.value as Color).copy(sky.mid);
    (material.uniforms.uLow.value as Color).copy(sky.low);
    setUniform(material, "uStars", sky.stars);
    setUniform(material, "uMoonAmt", sky.moon);
  });

  return (
    <mesh position={center} material={material} renderOrder={-1}>
      <planeGeometry args={size} />
    </mesh>
  );
}
