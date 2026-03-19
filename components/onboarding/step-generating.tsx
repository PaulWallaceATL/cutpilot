"use client";

import { Loader2, Dumbbell, UtensilsCrossed, Sparkles } from "lucide-react";

export function StepGenerating() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-8">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Generating your plan...</h2>
        <p className="text-muted-foreground max-w-sm">
          Our AI is crafting a personalized workout and meal plan tailored to
          your goals. This may take 30-60 seconds.
        </p>
      </div>

      <div className="space-y-3 w-full max-w-xs">
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span className="text-sm">Building workout plan...</span>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            <span className="text-sm">Creating meal plan...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
