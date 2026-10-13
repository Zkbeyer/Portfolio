import { useEffect, useRef, type ReactNode } from "react";
import { BufferGeometry, Group, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const KEEP = new Set(["position", "normal", "uv"]);

/** Materials that look identical get one key, so their meshes can share one draw call. */
function materialKey(m: MeshStandardMaterial) {
  return [
    m.type,
    m.color.getHexString(),
    m.roughness.toFixed(3),
    m.metalness.toFixed(3),
    m.envMapIntensity.toFixed(3),
    m.map?.uuid ?? "",
    m.normalMap?.uuid ?? "",
    m.roughnessMap?.uuid ?? "",
    m.side,
    m.vertexColors,
    m.flatShading,
  ].join("|");
}

/** A mesh is mergeable if nothing about it can change after mount. */
function mergeable(o: Mesh): o is Mesh<BufferGeometry, MeshStandardMaterial> {
  const m = o.material;
  if (o instanceof InstancedMesh || Array.isArray(m) || !(m instanceof MeshStandardMaterial)) return false;
  if (o.userData.dynamic || m.transparent || m.emissive.getHex() !== 0 || m.emissiveMap) return false;
  const a = o.geometry.attributes;
  return !!(a.position && a.normal && a.uv) && !o.geometry.morphAttributes.position;
}

/**
 * Perf (P7): wraps purely static props and, once mounted, merges every mesh that shares a look
 * (same standard-material settings + textures) into one geometry → one draw call per material
 * instead of one per mesh. Originals are hidden, not removed, so React still owns them. Only for
 * subtrees with no animation, no hover glow and no emissive parts (those are skipped anyway).
 * Mark a mesh `userData={{ dynamic: true }}` to keep it out.
 */
export function StaticMerge({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null);

  useEffect(() => {
    const g = group.current;
    if (!g) return;
    const added: Mesh[] = [];
    const hidden: Mesh[] = [];
    // two frames: let children finish their own effects (textures, instanced matrices) first
    let raf = requestAnimationFrame(() => (raf = requestAnimationFrame(run)));

    function run() {
      if (!g) return;
      g.updateWorldMatrix(true, true);
      const toLocal = new Matrix4().copy(g.matrixWorld).invert();
      const buckets = new Map<string, { material: MeshStandardMaterial; meshes: Mesh[] }>();
      g.traverseVisible((o) => {
        if (!(o instanceof Mesh) || !mergeable(o)) return;
        const key = materialKey(o.material);
        const b = buckets.get(key) ?? { material: o.material, meshes: [] };
        b.meshes.push(o);
        buckets.set(key, b);
      });
      const m = new Matrix4();
      for (const { material, meshes } of buckets.values()) {
        if (meshes.length < 2) continue;
        const parts = meshes.map((mesh) => {
          const geo = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
          for (const name of Object.keys(geo.attributes)) if (!KEEP.has(name)) geo.deleteAttribute(name);
          geo.clearGroups();
          geo.applyMatrix4(m.multiplyMatrices(toLocal, mesh.matrixWorld));
          return geo;
        });
        const merged = mergeGeometries(parts, false);
        parts.forEach((p) => p.dispose());
        if (!merged) continue;
        const mesh = new Mesh(merged, material);
        mesh.name = "static-merged";
        g.add(mesh);
        added.push(mesh);
        for (const orig of meshes) {
          orig.visible = false;
          hidden.push(orig);
        }
      }
    }

    return () => {
      cancelAnimationFrame(raf);
      for (const mesh of added) {
        g.remove(mesh);
        mesh.geometry.dispose();
      }
      for (const mesh of hidden) mesh.visible = true;
    };
  }, []);

  return <group ref={group}>{children}</group>;
}
