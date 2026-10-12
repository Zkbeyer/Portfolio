import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, Color, MeshBasicMaterial, PointsMaterial } from "three";
import { PALETTE } from "../../palette";
import { OUTSIDE } from "../layout";
import { useDisposable } from "../../hooks/useDisposable";
import { seeded } from "../props/seeded";

type Ridge = {
  z: number;
  /** Baseline height of the ridge and how far peaks rise above it. */
  base: number;
  amp: number;
  /** Feature size: higher = busier ridge. */
  freq: number;
  color: string;
  /** How much the layer fades toward the horizon glow (atmospheric perspective). */
  haze: number;
  seed: number;
  /** Ridged noise: sharp mountain peaks instead of rolling hills. */
  peaky?: boolean;
  /** Warm lights scattered below the ridge (a few houses / a small town). */
  lights?: { count: number; clusters: number; depth: number };
};

// Far → near. Tuned so each ridge shows above the next from the base shot, all inside the window.
const RIDGES: Ridge[] = [
  { z: -7.6, base: 2.2, amp: 1.25, freq: 0.5, color: "#3A2622", haze: 0.32, seed: 2, peaky: true },
  { z: -6.0, base: 1.85, amp: 0.8, freq: 0.75, color: "#2A1C1A", haze: 0.14, seed: 5, peaky: true },
  { z: -4.6, base: 1.5, amp: 0.45, freq: 1.1, color: "#1A1312", haze: 0.04, seed: 9, lights: { count: 22, clusters: 3, depth: 0.3 } },
  { z: -3.3, base: 1.15, amp: 0.32, freq: 1.5, color: "#0D0A0A", haze: 0, seed: 13, lights: { count: 14, clusters: 2, depth: 0.25 } },
];

const X0 = -3;
const X1 = 9;
const SEGMENTS = 220;

/** 1D value noise + fbm, deterministic per seed. */
function makeNoise(seed: number) {
  const rnd = seeded(seed * 7919);
  const table = Array.from({ length: 256 }, () => rnd());
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const value = (x: number) => {
    const i = Math.floor(x);
    const f = x - i;
    const a = table[((i % 256) + 256) % 256];
    const b = table[(((i + 1) % 256) + 256) % 256];
    return a + (b - a) * smooth(f);
  };
  return (x: number) => {
    let sum = 0;
    let amp = 0.55;
    let freq = 1;
    for (let o = 0; o < 4; o++) {
      sum += amp * value(x * freq);
      amp *= 0.5;
      freq *= 2.1;
    }
    return sum; // ~0..1
  };
}

function buildRidge(r: Ridge) {
  const noise = makeNoise(r.seed);
  const heightAt = (x: number) => {
    const n = noise(x * r.freq + r.seed * 10);
    const shaped = r.peaky ? 1 - Math.abs(2 * n - 1) : n; // ridged → peaks
    return r.base + r.amp * (shaped - (r.peaky ? 0.55 : 0.35));
  };
  const pos = new Float32Array((SEGMENTS + 1) * 2 * 3);
  const index: number[] = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const x = X0 + ((X1 - X0) * i) / SEGMENTS;
    pos.set([x, OUTSIDE.ground, 0], i * 6);
    pos.set([x, heightAt(x), 0], i * 6 + 3);
    if (i < SEGMENTS) {
      const a = i * 2;
      index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(pos, 3));
  geometry.setIndex(index);
  geometry.computeBoundingSphere();

  let lights: BufferGeometry | null = null;
  if (r.lights) {
    const rnd = seeded(r.seed * 31 + 1);
    const { count, clusters, depth } = r.lights;
    // Towns sit in the part of the ridge seen through the window (x ≈ 0.5…3.5).
    const centres = Array.from({ length: clusters }, () => 0.6 + rnd() * 3);
    const lp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const cx = centres[i % clusters] + (rnd() - 0.5) * (i % 4 === 0 ? 1.4 : 0.45);
      const top = heightAt(cx) - 0.05;
      const y = top - Math.pow(rnd(), 1.6) * depth;
      lp.set([cx, y, 0.01], i * 3);
    }
    lights = new BufferGeometry();
    lights.setAttribute("position", new BufferAttribute(lp, 3));
  }
  return { geometry, lights };
}

function RidgeLayer({ ridge }: { ridge: Ridge }) {
  const built = useMemo(() => buildRidge(ridge), [ridge]);
  const geometry = useDisposable(() => built.geometry, [built]);
  const material = useDisposable(() => {
    const c = new Color(ridge.color).lerp(new Color(PALETTE.skyLow), ridge.haze);
    return new MeshBasicMaterial({ color: c, toneMapped: false });
  }, [ridge]);
  const lightMat = useDisposable(
    () =>
      new PointsMaterial({
        color: new Color(PALETTE.lamp).multiplyScalar(ridge.z < -4 ? 1.4 : 2.1),
        size: ridge.z < -4 ? 0.016 : 0.022,
        sizeAttenuation: true,
        toneMapped: false,
      }),
    [ridge],
  );
  return (
    <group position={[0, 0, ridge.z]}>
      <mesh geometry={geometry} material={material} />
      {built.lights && <points geometry={built.lights} material={lightMat} />}
    </group>
  );
}

/**
 * Layered mountain ridges fading into the dusty-rose horizon glow, with a few warm village lights
 * on the nearer hills (mid-century modern × Japandi restyle; replaces the city skyline).
 */
export function Hills() {
  return (
    <group>
      {RIDGES.map((r) => (
        <RidgeLayer key={r.seed} ridge={r} />
      ))}
    </group>
  );
}
