import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, Group, Vector3 } from "three";
import { ANCHORS, SHELF, WALL_Z } from "../layout";
import { useSceneTime } from "../../hooks/useSceneTime";
import { Matte } from "./parts";
import { seeded } from "./seeded";

const LEAF = ["#5F7A4E", "#7C8F5A", "#4E6A44"];
const POT = "#E8DFD0"; // cream ceramic

type Leaf = { p: Vector3; rot: [number, number, number]; s: number; color: string };

function vineLeaves(curve: CatmullRomCurve3, count: number, rand: () => number): Leaf[] {
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

/** Trailing pothos in a cream ceramic pot at the end of the shelf; the vines sway very slightly. */
export function Plant() {
  const time = useSceneTime();
  const sway = useRef<Group>(null);
  const [x, y, z] = ANCHORS.plant;
  const potX = x + 0.03;
  const potH = 0.085;
  const front = SHELF.center[2] + SHELF.depth / 2;
  const shelfEnd = SHELF.center[0] + SHELF.width / 2;

  const { vines, crown } = useMemo(() => {
    const rand = seeded(11);
    const top = y + potH;
    const vineA = new CatmullRomCurve3([
      new Vector3(potX + 0.02, top, z + 0.03),
      new Vector3(potX + 0.03, top + 0.01, front - 0.01),
      new Vector3(potX + 0.035, y - 0.05, front + 0.015),
      new Vector3(potX + 0.02, y - 0.24, front + 0.01),
      new Vector3(potX + 0.04, y - 0.4, front + 0.005),
    ]);
    const vineB = new CatmullRomCurve3([
      new Vector3(potX + 0.04, top, z - 0.01),
      new Vector3(shelfEnd + 0.01, top - 0.01, z - 0.02),
      new Vector3(shelfEnd + 0.03, y - 0.12, WALL_Z + 0.04),
      new Vector3(shelfEnd + 0.02, y - 0.3, WALL_Z + 0.03),
    ]);
    const crownLeaves: Leaf[] = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + rand() * 0.4;
      const r = 0.02 + rand() * 0.03;
      crownLeaves.push({
        p: new Vector3(potX + Math.cos(a) * r, top + 0.03 + rand() * 0.06, z + Math.sin(a) * r),
        rot: [Math.sin(a) * 0.9, -a, Math.cos(a) * 0.9],
        s: 0.032 + rand() * 0.014,
        color: LEAF[i % LEAF.length],
      });
    }
    return {
      vines: [
        { curve: vineA, leaves: vineLeaves(vineA, 7, rand) },
        { curve: vineB, leaves: vineLeaves(vineB, 5, rand) },
      ],
      crown: crownLeaves,
    };
  }, [y, z, potX, front, shelfEnd]);

  useFrame(() => {
    const g = sway.current;
    if (!g) return;
    const t = time.current;
    g.rotation.z = Math.sin(t * 0.6) * 0.012;
    g.rotation.x = Math.sin(t * 0.43 + 1) * 0.008;
  });

  return (
    <group>
      <mesh position={[potX, y + potH / 2, z]}>
        <cylinderGeometry args={[0.055, 0.042, potH, 24]} />
        <Matte color={POT} roughness={0.9} />
      </mesh>
      <mesh position={[potX, y + potH - 0.006, z]}>
        <cylinderGeometry args={[0.058, 0.058, 0.014, 24]} />
        <Matte color="#CFC4B3" roughness={0.9} />
      </mesh>
      <mesh position={[potX, y + potH - 0.004, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.05, 20]} />
        <Matte color="#2A1E1A" />
      </mesh>
      {crown.map((l, i) => (
        <mesh key={i} position={l.p} rotation={l.rot} scale={[l.s, l.s * 0.18, l.s * 0.7]}>
          <sphereGeometry args={[1, 10, 6]} />
          <Matte color={l.color} roughness={0.7} />
        </mesh>
      ))}
      {/* vines pivot from the pot rim so the sway reads as weight, not wobble */}
      <group position={[potX, y + potH, z]}>
        <group ref={sway}>
          <group position={[-potX, -(y + potH), -z]}>
            {vines.map((v, i) => (
              <group key={i}>
                <mesh>
                  <tubeGeometry args={[v.curve, 24, 0.0025, 5, false]} />
                  <Matte color="#4D7A5C" />
                </mesh>
                {v.leaves.map((l, j) => (
                  <mesh key={j} position={l.p} rotation={l.rot} scale={[l.s, l.s * 0.18, l.s * 0.7]}>
                    <sphereGeometry args={[1, 10, 6]} />
                    <Matte color={l.color} roughness={0.7} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}
