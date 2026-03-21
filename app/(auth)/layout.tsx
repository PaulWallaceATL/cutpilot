"use client";

import dynamic from "next/dynamic";

const AuroraBlur = dynamic(
  () => import("@/components/react-bits/aurora-blur"),
  { ssr: false }
);

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <AuroraBlur
          layers={[
            { color: "#14b8a6", speed: 0.3, intensity: 0.5 },
            { color: "#0d9488", speed: 0.15, intensity: 0.35 },
            { color: "#2dd4bf", speed: 0.2, intensity: 0.2 },
            { color: "#0f766e", speed: 0.08, intensity: 0.15 },
          ]}
          skyLayers={[
            { color: "#0a1a1a", blend: 0.6 },
            { color: "#042f2e", blend: 0.4 },
          ]}
          speed={0.8}
          bloomIntensity={1.5}
          brightness={0.9}
          saturation={1.2}
          opacity={0.85}
        />
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
