import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color, Object3D, ShaderMaterial, SpotLight, Vector2 } from "three";
import { PALETTE } from "../../palette";
import { ANCHORS, CONSOLE, SHELF, WALL_Z, type Vec3 } from "../layout";
import { useSceneTime } from "../../hooks/useSceneTime";
import { useDisposable } from "../../hooks/useDisposable";
import { setUniform } from "../window/uniforms";
import { UV_VERT } from "../window/shaders";
import { Matte } from "./parts";


/** Accent-lamp positions (world space). */
const ACCENT = {
  /** Sunset projector on the floor left of the desk, throwing its disc onto the plaster wall. */
  sunsetLamp: [-1.72, 0, -0.78] as Vec3,
  sunsetDisc: { center: [-2.05, 1.2, WALL_Z + 0.004] as Vec3, radius: 0.42 },
  lava: [-1.86, SHELF.center[1] + 0.022, SHELF.center[2] + 0.01] as Vec3,
  mushroom: [2.16, CONSOLE.topY, -1.38] as Vec3,
} as const;
const SUNSET_HEAD: Vec3 = [ACCENT.sunsetLamp[0], ACCENT.sunsetLamp[1] + 0.3, ACCENT.sunsetLamp[2]];

// ── sunset projector ────────────────────────────────────────────────────────────

const SUNSET_FRAG = /* glsl */ `
uniform vec3 uCore;
uniform vec3 uMid;
uniform vec3 uEdge;
uniform float uTime;
varying vec2 vUv;
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  // projected disc: hot core → orange → deep red rim, soft edge, faint outer halo
  float disc = smoothstep(0.97, 0.93, r); // crisp edge like a real projector lens
  vec3 col = mix(uCore, uMid, smoothstep(0.0, 0.55, r));
  col = mix(col, uEdge, smoothstep(0.5, 0.95, r));
  // the lens' horizontal gradient: lighter at the top like a real sunset lamp
  col *= 0.85 + 0.25 * vUv.y;
  float halo = exp(-pow(max(r - 0.9, 0.0) * 4.0, 2.0)) * 0.35 * (1.0 - disc);
  float breathe = 0.97 + 0.03 * sin(uTime * 0.6);
  gl_FragColor = vec4(col * (disc + halo) * breathe, 1.0);
}
`;

function SunsetLamp() {
  const time = useSceneTime();
  const { center, radius } = ACCENT.sunsetDisc;
  const [lx, ly, lz] = ACCENT.sunsetLamp;
  const spot = useRef<SpotLight>(null);
  const target = useMemo(() => new Object3D(), []);
  useEffect(() => {
    target.position.set(...center);
    target.updateMatrixWorld();
    if (spot.current) spot.current.target = target;
  }, [target, center]);

  const material = useDisposable(
    () =>
      new ShaderMaterial({
        vertexShader: UV_VERT,
        fragmentShader: SUNSET_FRAG,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        uniforms: {
          uCore: { value: new Color("#FFB070").multiplyScalar(1.5) },
          uMid: { value: new Color(PALETTE.accent).multiplyScalar(1.3) },
          uEdge: { value: new Color("#7A1A10") },
          uTime: { value: 0 },
        },
      }),
    [],
  );
  useFrame(() => setUniform(material, "uTime", time.current));

  // body aims from the lamp head at the disc
  const head = SUNSET_HEAD;
  const aim = useMemo(() => {
    const o = new Object3D();
    o.position.set(...head);
    o.lookAt(...center);
    return o.quaternion.clone();
  }, [head, center]);

  return (
    <group>
      <mesh position={center} material={material} renderOrder={1}>
        <planeGeometry args={[radius * 2.4, radius * 2.4]} />
      </mesh>
      {/* the lamp: weighted base, stem, round projector head with a glowing lens */}
      <mesh position={[lx, ly + 0.008, lz]}>
        <cylinderGeometry args={[0.055, 0.06, 0.016, 24]} />
        <Matte color={PALETTE.charcoal} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[lx, ly + 0.15, lz]}>
        <cylinderGeometry args={[0.007, 0.007, 0.28, 8]} />
        <Matte color={PALETTE.charcoal} roughness={0.4} metalness={0.5} />
      </mesh>
      <group position={head} quaternion={aim}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.07, 24]} />
          <Matte color={PALETTE.charcoal} roughness={0.4} metalness={0.5} />
        </mesh>
        {/* lens faces the wall (Object3D.lookAt points +z at the disc) */}
        <mesh position={[0, 0, 0.036]}>
          <circleGeometry args={[0.034, 24]} />
          <meshBasicMaterial color={new Color("#FF7A3A").multiplyScalar(3)} toneMapped={false} />
        </mesh>
      </group>
      <spotLight ref={spot} position={head} color="#FF5A2A" intensity={1.4} angle={0.3} penumbra={0.7} distance={3} decay={2} />
    </group>
  );
}

// ── lava lamp ─────────────────────────────────────────────────────────────────

const LAVA_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uLiquid;
uniform vec3 uWax;
varying vec2 vUv;
float blob(vec2 p, vec2 c, float r) { return r * r / max(dot(p - c, p - c), 1e-4); }
void main() {
  // vUv.x wraps around the glass; use a 2D slice so blobs read as round from the front
  vec2 p = vec2(abs(fract(vUv.x * 2.0) - 0.5) * 0.9, vUv.y);
  float t = uTime * 0.12;
  float f = 0.0;
  f += blob(p, vec2(0.18, fract(t) * 1.2 - 0.1), 0.09);
  f += blob(p, vec2(0.25, fract(t * 0.7 + 0.4) * 1.2 - 0.1), 0.07);
  f += blob(p, vec2(0.1, 1.0 - fract(t * 0.55 + 0.2) * 1.2 + 0.1), 0.08);
  f += blob(p, vec2(0.2, 0.04), 0.14); // pool at the bottom
  float wax = smoothstep(0.9, 1.15, f);
  vec3 col = mix(uLiquid * (0.6 + 0.6 * vUv.y), uWax, wax);
  gl_FragColor = vec4(col, 1.0);
}
`;

function LavaLamp() {
  const time = useSceneTime();
  const [x, y, z] = ACCENT.lava;
  const material = useDisposable(
    () =>
      new ShaderMaterial({
        vertexShader: UV_VERT,
        fragmentShader: LAVA_FRAG,
        toneMapped: false,
        uniforms: {
          uTime: { value: 0 },
          uLiquid: { value: new Color("#5A1A10").multiplyScalar(1.2) },
          uWax: { value: new Color(PALETTE.accentSoft).multiplyScalar(1.6) },
        },
      }),
    [],
  );
  useFrame(() => setUniform(material, "uTime", time.current));
  return (
    <group position={[x, y, z]}>
      {/* base cone, glass, cap — the classic rocket silhouette */}
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.028, 0.048, 0.09, 24]} />
        <meshStandardMaterial color={PALETTE.brass} metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.17, 0]} material={material}>
        <cylinderGeometry args={[0.018, 0.032, 0.16, 24, 1, true]} />
      </mesh>
      <mesh position={[0, 0.265, 0]}>
        <cylinderGeometry args={[0.008, 0.018, 0.03, 20]} />
        <meshStandardMaterial color={PALETTE.brass} metalness={0.8} roughness={0.35} />
      </mesh>
      <pointLight position={[0, 0.17, 0.08]} color={PALETTE.accentSoft} intensity={0.9} distance={1.1} decay={2} />
    </group>
  );
}

// ── vintage mushroom lamp ───────────────────────────────────────────────────────

function MushroomLamp() {
  const [x, y, z] = ACCENT.mushroom;
  const glow = useMemo(() => new Color("#FF8A4A").multiplyScalar(1.25), []);
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.026, 0.05, 0.12, 24]} />
        <meshStandardMaterial color={PALETTE.accent} roughness={0.35} emissive={glow} emissiveIntensity={0.15} />
      </mesh>
      {/* glowing dome shade */}
      <mesh position={[0, 0.118, 0]}>
        <sphereGeometry args={[0.085, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={PALETTE.accentSoft} emissive={glow} emissiveIntensity={0.95} roughness={0.3} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.118, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.085, 32]} />
        <meshBasicMaterial color={new Color("#FFC08A").multiplyScalar(2)} toneMapped={false} side={2} />
      </mesh>
      <pointLight position={[0, 0.1, 0.06]} color="#FF8A4A" intensity={1.1} distance={1.4} decay={2} />
    </group>
  );
}

// ── monitor bias glow on the slats ───────────────────────────────────────────────

const GLOW_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec2 uAspect;
varying vec2 vUv;
void main() {
  vec2 p = (vUv - 0.5) * uAspect;
  float g = exp(-dot(p, p) * 5.0);
  gl_FragColor = vec4(uColor * g, 1.0);
}
`;

function BiasGlow() {
  const [x, y] = ANCHORS.monitorsCenter;
  const size: [number, number] = [2.0, 1.1];
  const material = useDisposable(
    () =>
      new ShaderMaterial({
        vertexShader: UV_VERT,
        fragmentShader: GLOW_FRAG,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        uniforms: {
          uColor: { value: new Color(PALETTE.accent).multiplyScalar(0.4) },
          uAspect: { value: new Vector2(size[0] / size[1], 1) },
        },
      }),
    [],
  );
  return (
    <mesh position={[x, y + 0.05, WALL_Z + 0.05]} material={material} renderOrder={1}>
      <planeGeometry args={size} />
    </mesh>
  );
}

/** Accent lighting for the dark room: sunset projector, lava lamp, mushroom lamp, LED bias glow behind the monitors. */
export function AccentLamps() {
  return (
    <group>
      <SunsetLamp />
      <LavaLamp />
      <MushroomLamp />
      <BiasGlow />
    </group>
  );
}
