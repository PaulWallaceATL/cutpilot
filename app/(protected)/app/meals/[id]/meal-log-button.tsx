"use client";

import { useState } from "react";
import { logMeal } from "@/actions/meals";
import { Check, Loader2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { GradientButton } from "@/components/react-bits/gradient-button";

interface MealLogButtonProps {
  mealId: string;
  isLogged: boolean;
}

export function MealLogButton({ mealId, isLogged }: MealLogButtonProps) {
  const [logged, setLogged] = useState(isLogged);
  const [loading, setLoading] = useState(false);

  async function handleLog() {
    if (logged) return;
    setLoading(true);
    const result = await logMeal(mealId);
    if (result?.success) {
      setLogged(true);
      toast.success("Meal logged!");
    } else {
      toast.error(result?.error || "Failed to log meal");
    }
    setLoading(false);
  }

  if (logged) {
    return (
      <GradientButton disabled className="w-full" gradient="primary" style={{ opacity: 0.6 }}>
        <Check className="mr-2 h-4 w-4 text-green-500" />
        Logged Today
      </GradientButton>
    );
  }

  return (
    <GradientButton onClick={handleLog} disabled={loading} className="w-full" gradient="purple">
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UtensilsCrossed className="mr-2 h-4 w-4" />
      )}
      Log This Meal
    </GradientButton>
  );
}
