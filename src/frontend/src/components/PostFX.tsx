import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useMemo } from "react";
import { Vector2 } from "three";
import { useGameStore } from "../store/gameStore";

// Scene post-processing. Bloom is the headline effect — it makes the cyan HUD
// world, weapon tracers, city lights, and explosions glow. Tuned for the
// "balanced" performance target (mipmap bloom, moderate intensity). A faint
// chromatic aberration ramps in only during high combos for a punchy moment.
export default function PostFX() {
  const combo = useGameStore((s) => s.combo);
  // 0 below the threshold, easing up to a small max as the combo climbs.
  const aberration = Math.min(0.0016, Math.max(0, (combo - 2) * 0.0004));
  const offset = useMemo(
    () => new Vector2(aberration, aberration),
    [aberration],
  );

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.85}
        luminanceThreshold={0.42}
        luminanceSmoothing={0.85}
        mipmapBlur
        radius={0.6}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={offset}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette eskil={false} offset={0.25} darkness={0.85} />
    </EffectComposer>
  );
}
