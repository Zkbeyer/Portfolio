import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, Color, Mesh, MeshBasicMaterial, ShaderMaterial, Vector2 } from "three";
import { PALETTE } from "../../palette";
import { OUTSIDE } from "../layout";
import { useSceneTime } from "../../hooks/useSceneTime";
import { useDisposable } from "../../hooks/useDisposable";
import { setUniform } from "./uniforms";
import { SKYLINE_FRAG, SKYLINE_VERT } from "./shaders";

type LayerSpec = {
  z: number;
  x: [number, number];
  top: [number, number];
  width: [number, number];
  base: string;
  fog: number;
  lit: number;
  bright: number;
  cell: [number, number];
  seed: number;
  /** Number of tallest buildings that get an antenna with a blinking red beacon. */
  beacons: number;
};

// Far → near. Heights are tuned so each layer peeks over the one in front from the base shot.
const LAYERS: LayerSpec[] = [
  { z: -6.6, x: [-3, 9], top: [1.9, 2.9], width: [0.4, 0.9], base: "#2A2148", fog: 0.3, lit: 0.16, bright: 0.85, cell: [0.075, 0.1], seed: 3, beacons: 0 },
  { z: -4.8, x: [-2.5, 8], top: [1.5, 2.45], width: [0.35, 0.8], base: "#1B1636", fog: 0.12, lit: 0.2, bright: 1.15, cell: [0.09, 0.12], seed: 7, beacons: 1 },
  { z: -3.2, x: [-2, 7], top: [1.15, 1.95], width: [0.4, 0.85], base: "#110D22", fog: 0, lit: 0.26, bright: 1.6, cell: [0.11, 0.14], seed: 11, beacons: 1 },
];

type Block = { cx: number; w: number; y0: number; y1: number; seed: number };

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Lay buildings side by side (no overlap → no z-fighting), plus rooftop blocks and antennas. */
function buildLayer(spec: LayerSpec) {
  const rand = mulberry32(spec.seed * 7919);
  const blocks: Block[] = [];
  let x = spec.x[0];
  while (x < spec.x[1]) {
    const w = lerp(spec.width[0], spec.width[1], rand());
    const top = lerp(spec.top[0], spec.top[1], Math.pow(rand(), 1.4));
    blocks.push({ cx: x + w / 2, w, y0: OUTSIDE.ground, y1: top, seed: rand() * 100 });
    if (rand() < 0.35) {
      const pw = w * lerp(0.35, 0.6, rand());
      blocks.push({ cx: x + w / 2 + (rand() - 0.5) * (w - pw) * 0.6, w: pw, y0: top, y1: top + lerp(0.08, 0.22, rand()), seed: rand() * 100 });
    }
    x += w + rand() * 0.06;
  }

  const beacons: [number, number, number][] = [];
  const tallest = [...blocks].sort((a, b) => b.y1 - a.y1).slice(0, spec.beacons);
  for (const b of tallest) {
    const mastH = 0.28;
    blocks.push({ cx: b.cx, w: 0.014, y0: b.y1, y1: b.y1 + mastH, seed: 0 });
    beacons.push([b.cx, b.y1 + mastH + 0.012, spec.z + 0.01]);
  }

  const n = blocks.length;
  const pos = new Float32Array(n * 12);
  const uv = new Float32Array(n * 8);
  const size = new Float32Array(n * 8);
  const seed = new Float32Array(n * 4);
  const index: number[] = [];
  const corners: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
  blocks.forEach((b, i) => {
    const h = b.y1 - b.y0;
    corners.forEach(([u, v], k) => {
      const vi = i * 4 + k;
      pos.set([b.cx + (u - 0.5) * b.w, b.y0 + v * h, 0], vi * 3);
      uv.set([u, v], vi * 2);
      size.set([b.w, h], vi * 2);
      seed[vi] = b.seed;
    });
    const o = i * 4;
    index.push(o, o + 1, o + 2, o, o + 2, o + 3);
  });

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(pos, 3));
  geometry.setAttribute("uv", new BufferAttribute(uv, 2));
  geometry.setAttribute("aSize", new BufferAttribute(size, 2));
  geometry.setAttribute("aSeed", new BufferAttribute(seed, 1));
  geometry.setIndex(index);
  geometry.computeBoundingSphere();
  return { geometry, beacons };
}

function Beacon({ position, phase }: { position: [number, number, number]; phase: number }) {
  const time = useSceneTime();
  const ref = useRef<Mesh>(null);
  const base = useMemo(() => new Color("#FF4A4A"), []);
  const material = useDisposable(() => new MeshBasicMaterial({ color: base.clone(), toneMapped: false }), [base]);
  useFrame(() => {
    const p = (time.current * 0.55 + phase) % 1;
    const pulse = Math.exp(-Math.pow((p - 0.15) * 9, 2));
    material.color.copy(base).multiplyScalar(0.25 + 3.2 * pulse);
  });
  return (
    <mesh ref={ref} position={position} material={material}>
      <sphereGeometry args={[0.016, 10, 8]} />
    </mesh>
  );
}

function SkylineLayer({ spec }: { spec: LayerSpec }) {
  const time = useSceneTime();
  const layer = useMemo(() => buildLayer(spec), [spec]);
  const geometry = useDisposable(() => layer.geometry, [layer]);
  const beacons = layer.beacons;
  const material = useDisposable(
    () =>
      new ShaderMaterial({
        vertexShader: SKYLINE_VERT,
        fragmentShader: SKYLINE_FRAG,
        toneMapped: false,
        uniforms: {
          uBase: { value: new Color(spec.base) },
          uFog: { value: new Color(PALETTE.skyLow) },
          uFogAmt: { value: spec.fog },
          uLit: { value: new Color(PALETTE.cityLight) },
          uCool: { value: new Color("#9DB8FF") },
          uLitAmt: { value: spec.lit },
          uBright: { value: spec.bright },
          uCell: { value: new Vector2(...spec.cell) },
          uTime: { value: 0 },
        },
      }),
    [spec],
  );
  useFrame(() => {
    setUniform(material, "uTime", time.current);
  });

  return (
    <group>
      <mesh position={[0, 0, spec.z]} geometry={geometry} material={material} />
      {beacons.map((p, i) => (
        <Beacon key={i} position={p} phase={spec.seed * 0.37 + i * 0.5} />
      ))}
    </group>
  );
}

/** Three parallax layers of procedural buildings with lit windows. */
export function Skyline() {
  return (
    <group>
      {LAYERS.map((spec) => (
        <SkylineLayer key={spec.seed} spec={spec} />
      ))}
    </group>
  );
}
