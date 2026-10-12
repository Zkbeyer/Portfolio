import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { Color, DoubleSide, ShaderMaterial, Vector2 } from "three";
import { PALETTE } from "../../palette";
import { ANCHORS } from "../layout";
import { useSceneTime } from "../../hooks/useSceneTime";
import { useDisposable } from "../../hooks/useDisposable";
import { setUniform } from "../window/uniforms";
import { UV_VERT } from "../window/shaders";
import { STEAM_FRAG } from "./shaders";
import { Matte } from "./parts";

const H = 0.1;
const R = 0.044;

/** Hollow ceramic mug of coffee with steam curling off it. */
export function Mug() {
  const time = useSceneTime();
  const [x, y, z] = ANCHORS.mug;

  const profile = useMemo(
    () =>
      [
        [0, 0],
        [R - 0.004, 0],
        [R, 0.004],
        [R + 0.001, H],
        [R - 0.005, H],
        [R - 0.006, 0.012],
        [0, 0.012],
      ].map(([px, py]) => new Vector2(px, py)),
    [],
  );

  const steam = useDisposable(
    () =>
      new ShaderMaterial({
        vertexShader: UV_VERT,
        fragmentShader: STEAM_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new Color(PALETTE.cream) },
          uOpacity: { value: 0.5 },
        },
      }),
    [],
  );

  useFrame(() => setUniform(steam, "uTime", time.current));

  return (
    <group position={[x, y, z]} rotation={[0, -0.5, 0]}>
      <mesh>
        <latheGeometry args={[profile, 32]} />
        <meshStandardMaterial color="#E8DFD0" roughness={0.6} side={DoubleSide} />
      </mesh>
      {/* glaze band */}
      <mesh position={[0, H * 0.62, 0]}>
        <cylinderGeometry args={[R + 0.0018, R + 0.0016, 0.016, 32, 1, true]} />
        <Matte color={PALETTE.accent} roughness={0.4} />
      </mesh>
      <mesh position={[0, H - 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R - 0.005, 24]} />
        <meshStandardMaterial color="#3A2218" roughness={0.15} />
      </mesh>
      <mesh position={[R + 0.002, H * 0.5, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.027, 0.007, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#E8DFD0" roughness={0.6} />
      </mesh>
      <Billboard position={[0, H + 0.13, 0]} lockX lockZ>
        <mesh material={steam}>
          <planeGeometry args={[0.16, 0.28]} />
        </mesh>
      </Billboard>
    </group>
  );
}
