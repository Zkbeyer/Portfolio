import { CatmullRomCurve3, Vector3 } from "three";

/** Leaf colours + leaves along a trailing vine (shared by the shelf pothos and the hanging planter). */
export const LEAF = ["#5F7A4E", "#7C8F5A", "#4E6A44"];

export type Leaf = { p: Vector3; rot: [number, number, number]; s: number; color: string };

export function vineLeaves(curve: CatmullRomCurve3, count: number, rand: () => number): Leaf[] {
  const leaves: Leaf[] = [];
  for (let i = 1; i <= count; i++) {
    const p = curve.getPoint(i / (count + 0.5));
    const side = i % 2 ? 1 : -1;
    leaves.push({
      p: p.add(new Vector3(side * 0.012, 0, 0.008)),
      rot: [0.5 + rand() * 0.4, rand() * 0.8 - 0.4, side * (0.7 + rand() * 0.5)],
      s: 0.028 + rand() * 0.012,
      color: LEAF[i % LEAF.length],
    });
  }
  return leaves;
}

