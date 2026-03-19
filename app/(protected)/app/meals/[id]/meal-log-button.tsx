"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { logMeal } from "@/actions/meals";
import { Check, Loader2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

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
      <Button disabled className="w-full" variant="secondary">
        <Check className="mr-2 h-4 w-4 text-green-500" />
        Logged Today
      </Button>
    );
  }

  return (
    <Button onClick={handleLog} disabled={loading} className="w-full">
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UtensilsCrossed className="mr-2 h-4 w-4" />
      )}
      Log This Meal
    </Button>
  );
}
