"use client";

import dynamic from "next/dynamic";
import { Loader2, Dumbbell, UtensilsCrossed, Sparkles } from "lucide-react";

const SilkWaves = dynamic(() => import("@/components/react-bits/silk-waves"), {
  ssr: false,
});

export function StepGenerating() {
  return (
    <div className="relative flex flex-col items-center justify-center py-16 space-y-8 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-30">
        <SilkWaves
          speed={0.8}
          scale={1.5}
          distortion={0.6}
          brightness={1.2}
          opacity={0.8}
          colors={[
            "#0d1326",
            "#162a52",
            "#1e407e",
            "#2657aa",
            "#2e6ed5",
            "#3785ff",
            "#5092ff",
            "#69a0ff",
          ]}
          className="h-full w-full"
        />
      </div>

      <div className="relative z-10">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 animate-ping" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg shadow-primary/10">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Generating your plan...
        </h2>
        <p className="text-muted-foreground max-w-sm">
          Our AI is crafting a personalized workout and meal plan tailored to
          your goals. This may take 30-60 seconds.
        </p>
      </div>

      <div className="relative z-10 space-y-3 w-full max-w-xs">
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-background/80 backdrop-blur-sm p-3.5 shadow-sm">
          <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 p-1.5">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-primary/70" />
            <span className="text-sm font-medium">Building workout plan...</span>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-background/80 backdrop-blur-sm p-3.5 shadow-sm">
          <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 p-1.5">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-primary/70" />
            <span className="text-sm font-medium">Creating meal plan...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
