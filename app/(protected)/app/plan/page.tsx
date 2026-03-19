"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { regenerateWorkout, regenerateMeal } from "@/actions/plan";
import { Dumbbell, UtensilsCrossed, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PlanPage() {
  const [workoutFeedback, setWorkoutFeedback] = useState("");
  const [mealFeedback, setMealFeedback] = useState("");
  const [loadingWorkout, setLoadingWorkout] = useState(false);
  const [loadingMeal, setLoadingMeal] = useState(false);

  async function handleRegenerateWorkout() {
    setLoadingWorkout(true);
    const result = await regenerateWorkout(workoutFeedback || undefined);
    if (result?.success) {
      toast.success("New workout plan generated!");
      setWorkoutFeedback("");
    } else {
      toast.error(result?.error || "Failed to regenerate");
    }
    setLoadingWorkout(false);
  }

  async function handleRegenerateMeal() {
    setLoadingMeal(true);
    const result = await regenerateMeal(mealFeedback || undefined);
    if (result?.success) {
      toast.success("New meal plan generated!");
      setMealFeedback("");
    } else {
      toast.error(result?.error || "Failed to regenerate");
    }
    setLoadingMeal(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Plan</h1>
      <p className="text-muted-foreground">
        Regenerate your workout or meal plan. Optionally provide feedback so the
        AI can make adjustments.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="h-5 w-5" />
            Workout Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Feedback (optional)</Label>
            <Textarea
              value={workoutFeedback}
              onChange={(e) => setWorkoutFeedback(e.target.value)}
              placeholder="e.g. I want more leg exercises, less shoulder work, shorter sessions..."
            />
          </div>
          <Button
            onClick={handleRegenerateWorkout}
            disabled={loadingWorkout}
            className="w-full"
          >
            {loadingWorkout ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {loadingWorkout ? "Generating..." : "Regenerate Workout Plan"}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UtensilsCrossed className="h-5 w-5" />
            Meal Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Feedback (optional)</Label>
            <Textarea
              value={mealFeedback}
              onChange={(e) => setMealFeedback(e.target.value)}
              placeholder="e.g. More variety, simpler recipes, more protein, less prep time..."
            />
          </div>
          <Button
            onClick={handleRegenerateMeal}
            disabled={loadingMeal}
            className="w-full"
          >
            {loadingMeal ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {loadingMeal ? "Generating..." : "Regenerate Meal Plan"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
