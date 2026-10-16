import { useEffect, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  Group,
  Light,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  ShaderMaterial,
  type Material,
} from "three";
import { isLightsOn, setIntroState, subscribeLights } from "./lights";
import { LEVELS, type LightGroup } from "./lightLevels";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";


/** When each group starts its flicker, in seconds after the intro begins. */
const STARTS = { screens: 0.1, desk: 0.75, floor: 1.35, accent: 1.9 } as const;
const INTRO_DELAY = 0.35; // let shaders compile / the first frames settle before the show starts
const INTRO_LENGTH = 2.7;

/** A bulb catching: a couple of stutters, then a quick ramp to full. `t` = seconds since its start. */
function flicker(t: number, seed: number) {
  if (t <= 0) return 0;
  const steps: [number, number][] = [
    [0.05, 0.85],
    [0.11, 0.02],
    [0.16 + seed * 0.03, 0.6],
    [0.27 + seed * 0.02, 0.05],
    [0.33, 1],
    [0.39, 0.35],
  ];
  for (const [end, v] of steps) if (t < end) return v;
  return Math.min(1, 0.35 + (t - 0.39) * 3.5);
}

export function LightDriver() {
  const reduced = usePrefersReducedMotion();
  const started = useRef<number | null>(null);
  const done = useRef(false);
  const sw = useRef(isLightsOn() ? 1 : 0);
  // when the switch last flipped, and the level it started from (fades are time-based, not per frame)
  const flipped = useRef({ at: -10, from: 1 });

  useEffect(
    () =>
      subscribeLights(() => {
        flipped.current = { at: performance.now() / 1000, from: sw.current };
      }),
    [],
  );

  useFrame((state) => {
    const now = performance.now() / 1000;
    if (started.current === null) {
      started.current = now + (reduced ? 0 : INTRO_DELAY);
      setIntroState("running");
    }
    const t = now - started.current;
    const intro = (start: number, seed: number) =>
      reduced ? Math.min(1, Math.max(0, t / 0.5)) : flicker(t - start, seed);

    // light switch: fade off; back on with a short flicker (none under reduced motion)
    const since = now - flipped.current.at;
    if (!isLightsOn()) sw.current = Math.max(0, flipped.current.from - since * 4);
    else sw.current = reduced ? Math.min(1, flipped.current.from + since * 4) : since < 0.6 ? flicker(since, 0.5) : 1;

    LEVELS.screens = intro(STARTS.screens, 0.2);
    LEVELS.desk = intro(STARTS.desk, 0) * sw.current;
    LEVELS.floor = intro(STARTS.floor, 1) * sw.current;
    LEVELS.accent = intro(STARTS.accent, 0.6);
    LEVELS.ambient = 0.35 + 0.65 * ((LEVELS.desk + LEVELS.floor) / 2);
    state.scene.environmentIntensity = 0.1 * LEVELS.ambient;

    if (!done.current && t > (reduced ? 0.5 : INTRO_LENGTH)) {
      done.current = true;
      setIntroState("done");
    }
  });
  return null;
}

type Tracked =
  | { kind: "light"; o: Light; base: number }
  | { kind: "emissive"; m: MeshStandardMaterial; base: number }
  | { kind: "basic"; m: MeshBasicMaterial; base: Color; off: Color }
  | { kind: "additive"; o: Mesh };

/**
 * Scales every light and glowing material inside it by LEVELS[group] (with a floor of `min`):
 * light intensity, standard-material emissive, unlit glowing colours (bulbs) and additive glow
 * planes (hidden when dark). Collected lazily on the first frame, after children have built their
 * materials (and after StaticMerge has run — merged meshes are never emissive, so nothing is lost).
 */
export function Dimmable({ group, min = 0, children }: { group: LightGroup; min?: number; children: ReactNode }) {
  const ref = useRef<Group>(null);
  const tracked = useRef<Tracked[] | null>(null);
  const last = useRef(-1);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    if (!tracked.current) {
      const list: Tracked[] = [];
      const seen = new Set<Material>();
      g.traverse((o) => {
        if (o instanceof Light) list.push({ kind: "light", o, base: o.intensity });
        if (!(o instanceof Mesh)) return;
        const mats = (Array.isArray(o.material) ? o.material : [o.material]) as Material[];
        for (const m of mats) {
          if (seen.has(m)) continue;
          seen.add(m);
          if (m instanceof MeshStandardMaterial && m.emissive.getHex() !== 0 && m.emissiveIntensity > 0)
            list.push({ kind: "emissive", m, base: m.emissiveIntensity });
          else if (m instanceof MeshBasicMaterial && !m.toneMapped)
            list.push({ kind: "basic", m, base: m.color.clone(), off: m.color.clone().multiplyScalar(0.05) });
          else if (m instanceof ShaderMaterial && m.blending === AdditiveBlending) list.push({ kind: "additive", o });
        }
      });
      tracked.current = list;
    }
    const level = min + (1 - min) * LEVELS[group];
    if (Math.abs(level - last.current) < 0.002) return;
    last.current = level;
    for (const t of tracked.current) {
      if (t.kind === "light") t.o.intensity = t.base * level;
      else if (t.kind === "emissive") t.m.emissiveIntensity = t.base * level;
      else if (t.kind === "basic") t.m.color.copy(t.off).lerp(t.base, level);
      else t.o.visible = level > 0.25;
    }
  });
  return <group ref={ref}>{children}</group>;
}
