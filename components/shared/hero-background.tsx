"use client";

import dynamic from "next/dynamic";

const AuroraBlur = dynamic(
  () => import("@/components/react-bits/aurora-blur"),
  { ssr: false }
);

export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
      <AuroraBlur
        layers={[
          { color: "#14b8a6", speed: 0.35, intensity: 0.5 },
          { color: "#0d9488", speed: 0.15, intensity: 0.35 },
          { color: "#2dd4bf", speed: 0.25, intensity: 0.25 },
          { color: "#06b6d4", speed: 0.1, intensity: 0.15 },
        ]}
        skyLayers={[
          { color: "#f0fdfa", blend: 0.5 },
          { color: "#ccfbf1", blend: 0.3 },
        ]}
        speed={0.5}
        bloomIntensity={1.2}
        brightness={1.1}
        saturation={1.3}
        opacity={0.9}
      />
    </div>
  );
}
