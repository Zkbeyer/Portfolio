import { useEffect, useRef, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Color, Group, MathUtils, Mesh, MeshStandardMaterial } from "three";
import { PALETTE } from "../palette";
import { Html } from "@react-three/drei";
import type { Vec3 } from "./layout";
import { useFocus } from "./focus";
import {
  HOTSPOTS,
  activateHotspot,
  clearHovered,
  setHovered,
  useHotspotActive,
  type HotspotId,
} from "./hotspots";

/** Invisible box that catches the pointer: props are small and fiddly, the hit area shouldn't be. */
export type HitBox = { center: Vec3; size: Vec3 };

// Proxy material: raycastable but never drawn (no colour or depth writes, so no sorting issues).
const proxyMaterial = { transparent: true, opacity: 0, depthWrite: false, colorWrite: false } as const;

const GLOW = new Color(PALETTE.lamp);
/** Emissive added at full hover: enough to read as "lamp-lit", not enough to trip Bloom (>1.0). */
const GLOW_STRENGTH = 0.1;

type Lit = { material: MeshStandardMaterial; emissive: Color; intensity: number };

/** Standard materials under `group`, with their original emissive so the glow can be blended on top. */
function collectLit(group: Group): Lit[] {
  const seen = new Set<MeshStandardMaterial>();
  group.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) if (m instanceof MeshStandardMaterial) seen.add(m);
  });
  return [...seen].map((material) => ({
    material,
    emissive: material.emissive.clone(),
    intensity: material.emissiveIntensity,
  }));
}

export function HotspotLabel({ id, position, text, active }: { id: HotspotId; position: Vec3; text?: string; active: boolean }) {
  const focused = useFocus() === id;
  const label = text ?? (focused ? HOTSPOTS[id].focusLabel : undefined) ?? HOTSPOTS[id].label;
  return (
    <Html position={position} center zIndexRange={[20, 0]} pointerEvents="none" className="night-label-anchor">
      <span className={`night-label hand${active ? " is-active" : ""}`} data-hotspot={id}>
        {label}
      </span>
    </Html>
  );
}

/**
 * Wraps a prop and makes it navigation: hover glow (a warm emissive lift on the wrapped props'
 * materials — a post-processing Outline pass rendered nothing in testing and cost extra passes), handwritten label, click → activateHotspot (camera focus + scroll, resume, or audio).
 * Keyboard and screen-reader users get the same destinations from the hidden nav in NightApp.
 */
export function Hotspot({
  id,
  hit,
  labelAt,
  labelText,
  children,
}: {
  id: HotspotId;
  hit: HitBox;
  /** Label position in world space. */
  labelAt: Vec3;
  labelText?: string;
  children: ReactNode;
}) {
  const active = useHotspotActive(id);
  const group = useRef<Group>(null);
  const lit = useRef<Lit[] | null>(null);
  const glow = useRef(0);

  useFrame((_, delta) => {
    const target = active ? 1 : 0;
    if (glow.current === target) return;
    glow.current = MathUtils.damp(glow.current, target, 8, Math.min(delta, 0.1));
    if (Math.abs(glow.current - target) < 0.002) glow.current = target;
    // Collected lazily: props build some materials in effects, after this component's first render.
    if (!lit.current && group.current) lit.current = collectLit(group.current);
    for (const l of lit.current ?? []) {
      l.material.emissive.copy(l.emissive).lerp(GLOW, glow.current);
      l.material.emissiveIntensity = MathUtils.lerp(l.intensity, GLOW_STRENGTH, glow.current);
    }
  });

  // Never leave a stale hover (and pointer cursor) behind on unmount.
  useEffect(() => () => clearHovered(id), [id]);

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation(); // nearest hotspot wins
    setHovered(id);
  };
  const out = () => clearHovered(id);
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    activateHotspot(id);
  };

  return (
    <group>
      <group ref={group}>{children}</group>
      <mesh position={hit.center} onPointerOver={over} onPointerOut={out} onClick={click}>
        <boxGeometry args={hit.size} />
        <meshBasicMaterial {...proxyMaterial} />
      </mesh>
      <HotspotLabel id={id} position={labelAt} text={labelText} active={active} />
    </group>
  );
}
