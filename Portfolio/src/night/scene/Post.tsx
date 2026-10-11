import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";

/**
 * Bloom only catches emissives pushed above 1.0 (materials with toneMapped={false}),
 * so it stays selective without a Selection pass. Then tone map, vignette, film grain.
 */
export function Post({ multisampling = 4 }: { multisampling?: number }) {
  return (
    <EffectComposer multisampling={multisampling}>
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.85} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <Vignette offset={0.28} darkness={0.72} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.25} />
    </EffectComposer>
  );
}
