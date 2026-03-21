"use client";

import dynamic from "next/dynamic";

const SilkWaves = dynamic(
  () => import("@/components/react-bits/silk-waves"),
  { ssr: false }
);

export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <SilkWaves
        speed={0.8}
        scale={1.5}
        distortion={0.6}
        curve={1.2}
        contrast={0.9}
        brightness={1.1}
        opacity={0.35}
        complexity={1.2}
        frequency={1.0}
        colors={[
          "#0d9488",
          "#14b8a6",
          "#2dd4bf",
          "#5eead4",
          "#99f6e4",
          "#ccfbf1",
          "#f0fdfa",
          "#ffffff",
        ]}
        className="h-full w-full"
      />
    </div>
  );
}
