import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Color,
  HalfFloatType,
  LinearFilter,
  LinearMipmapLinearFilter,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
} from "three";
import { WALL_Z, WINDOW, WINDOW_CENTER } from "../layout";
import { useSceneTime } from "../../hooks/useSceneTime";
import { useDisposable } from "../../hooks/useDisposable";
import { setUniform } from "./uniforms";
import { RAIN_FRAG, UV_VERT } from "./shaders";

/** The outside world renders at this fraction of the drawing buffer (it's mostly blurred anyway). */
const RESOLUTION_SCALE = 0.5;
/** Mip level used for fogged glass. */
const FOG_BLUR = 1.4;

/**
 * The window pane. Each frame renders `outside` (sky, skyline, plane) with the main camera into a
 * half-res, mip-mapped HDR target, then draws the glass sampling it with rain refraction.
 * HalfFloat keeps the moon and plane lights above 1.0 so Bloom still catches them through the glass.
 */
export function RainGlass({ outside }: { outside: Scene }) {
  const time = useSceneTime();
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const target = useDisposable(
    () =>
      new WebGLRenderTarget(1, 1, {
        type: HalfFloatType,
        generateMipmaps: true,
        minFilter: LinearMipmapLinearFilter,
        magFilter: LinearFilter,
        depthBuffer: true,
      }),
    [],
  );

  const material = useDisposable(
    () =>
      new ShaderMaterial({
        vertexShader: UV_VERT,
        fragmentShader: RAIN_FRAG,
        toneMapped: false,
        uniforms: {
          uScene: { value: target.texture },
          uResolution: { value: new Vector2(1, 1) },
          uGlass: { value: new Vector2(WINDOW.x1 - WINDOW.x0, WINDOW.y1 - WINDOW.y0) },
          uTime: { value: 0 },
          uBlur: { value: FOG_BLUR },
          uTint: { value: new Color("#B9B2E8") },
        },
      }),
    [target],
  );

  useEffect(() => {
    const w = Math.max(1, Math.round(size.width * dpr * RESOLUTION_SCALE));
    const h = Math.max(1, Math.round(size.height * dpr * RESOLUTION_SCALE));
    target.setSize(w, h);
  }, [target, size.width, size.height, dpr]);

  const drawing = useMemo(() => new Vector2(), []);
  useFrame((state) => {
    setUniform(material, "uTime", time.current);
    // gl_FragCoord is in the composer's buffer, which matches the drawing buffer size
    setUniform(material, "uResolution", gl.getDrawingBufferSize(drawing));

    const previous = gl.getRenderTarget();
    gl.setRenderTarget(target);
    gl.clear(true, true, false); // the EffectComposer turns autoClear off
    gl.render(outside, state.camera);
    gl.setRenderTarget(previous);
  });

  return (
    <mesh position={[WINDOW_CENTER[0], WINDOW_CENTER[1], WALL_Z - 0.06]} material={material}>
      <planeGeometry args={[WINDOW.x1 - WINDOW.x0, WINDOW.y1 - WINDOW.y0]} />
    </mesh>
  );
}
