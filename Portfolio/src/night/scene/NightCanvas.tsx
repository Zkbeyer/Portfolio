import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import type { Camera, Scene, WebGLRenderer } from "three";
import { PALETTE } from "../palette";
import { BASE_SHOT } from "./focus";
import { CameraRig } from "./CameraRig";
import { Room } from "./Room";
import { WindowView } from "./WindowView";
import { Props } from "./props/Props";
import { Lighting } from "./Lighting";
import { Post } from "./Post";
import { setHovered } from "./hotspots";

/**
 * `?perf` in the URL exposes the renderer + scene + camera as `window.__night` so draw calls and triangle
 * counts can be read from devtools or a headless check (`__night.gl.info.render`). No-op otherwise.
 */
function exposeForPerfChecks({ gl, scene, camera }: { gl: WebGLRenderer; scene: Scene; camera: Camera }) {
  if (!new URLSearchParams(window.location.search).has("perf")) return;
  (window as unknown as { __night?: unknown }).__night = { gl, scene, camera };
}

/** The single real-time 3D room behind the hero. Lazy-loaded so three.js never blocks first paint. */
export default function NightCanvas() {
  const coarse = useMemo(() => typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches, []);

  return (
    <Canvas
      className="night-canvas"
      dpr={coarse ? 1 : [1, 1.75]}
      shadows={false}
      flat // renderer tone mapping off; ToneMapping runs in the post chain (Post.tsx)
      camera={{ fov: 42, near: 0.05, far: 40, position: BASE_SHOT.position }}
      onPointerMissed={() => setHovered(null)}
      onCreated={exposeForPerfChecks}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[PALETTE.deep]} />
      <Suspense fallback={null}>
        <CameraRig />
        <Lighting />
        <Room />
        <WindowView />
        <Props />
        <Post multisampling={coarse ? 0 : 4} />
      </Suspense>
    </Canvas>
  );
}
