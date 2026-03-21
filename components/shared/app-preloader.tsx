"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Preloader = dynamic(
  () => import("@/components/react-bits/preloader"),
  { ssr: false }
);

export function AppPreloader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Preloader
        loading={loading}
        variant="curtain"
        duration={1500}
        bgColor="hsl(var(--background))"
        loadingText="CutPilot"
        textClassName="text-2xl font-bold tracking-tight text-primary"
        zIndex={9999}
      />
      {children}
    </>
  );
}
