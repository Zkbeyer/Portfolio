import { useMemo } from "react";
import { ANCHORS, SHELF } from "../layout";
import { Matte } from "./parts";
import { seeded } from "./seeded";

const SPINES = ["#C0623E", "#7C7F45", "#D9A441", "#2F5D62", "#E8DFD0", "#8C8275", "#5E3F2B", "#9DA88C"];

type Book = { x: number; w: number; h: number; d: number; color: string; lean: number };

/** A row of books on the shelf, the last one leaning on its neighbour. Seeded, so always the same row. */
export function Books() {
  const books = useMemo(() => {
    const rand = seeded(7);
    const out: Book[] = [];
    let x = 0;
    for (let i = 0; i < 8; i++) {
      const w = 0.03 + rand() * 0.025;
      const h = 0.17 + rand() * 0.09;
      const d = Math.min(SHELF.depth - 0.04, 0.15 + rand() * 0.06);
      out.push({ x: x + w / 2, w, h, d, color: SPINES[i % SPINES.length], lean: 0 });
      x += w + 0.002;
    }
    // last book leans left until its face touches the neighbour's top corner
    const last = out[out.length - 1];
    const prev = out[out.length - 2];
    last.lean = 0.32;
    last.x += Math.min(prev.h, last.h * Math.cos(last.lean)) * Math.tan(last.lean);
    return out;
  }, []);

  const [x0, y, z] = ANCHORS.books;
  return (
    <group position={[x0 - 0.2, y, z]}>
      {books.map((b, i) => (
        <group key={i} position={[b.x - (b.lean ? b.w / 2 : 0), 0, 0]} rotation={[0, 0, b.lean]}>
          <mesh position={[b.lean ? b.w / 2 : 0, b.h / 2, 0]}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <Matte color={b.color} roughness={0.8} />
          </mesh>
          {/* spine band */}
          <mesh position={[b.lean ? b.w / 2 : 0, b.h * 0.78, b.d / 2 + 0.0005]}>
            <planeGeometry args={[b.w * 0.9, 0.012]} />
            <Matte color="#F4E9D8" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
