"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { regenerateWorkout, regenerateMeal } from "@/actions/plan";
import { createClient } from "@/lib/supabase/client";
import { Dumbbell, UtensilsCrossed, RefreshCw, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WorkoutPlan {
  id: string;
  name: string;
  description: string | null;
  weeks: number;
  days_per_week: number;
}

interface MealPlan {
  id: string;
  name: string;
  description: string | null;
  daily_calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}

export default function PlanPage() {
  const router = useRouter();
  const [workoutFeedback, setWorkoutFeedback] = useState("");
  const [mealFeedback, setMealFeedback] = useState("");
  const [loadingWorkout, setLoadingWorkout] = useState(false);
  const [loadingMeal, setLoadingMeal] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [workoutDays, setWorkoutDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: wp } = await supabase
        .from("workout_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (wp) {
        setWorkoutPlan(wp);
        const { data: days } = await supabase
          .from("workout_days")
          .select("*, workout_exercises(count)")
          .eq("workout_plan_id", wp.id)
          .order("day_number");
        setWorkoutDays(days || []);
      }

      const { data: mp } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (mp) {
        setMealPlan(mp);
      }

      setLoading(false);
    }

    loadPlans();
  }, []);

  async function handleRegenerateWorkout() {
    setLoadingWorkout(true);
    const result = await regenerateWorkout(workoutFeedback || undefined);
    if (result?.success) {
      toast.success("New workout plan generated!");
      setWorkoutFeedback("");
      router.refresh();
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: wp } = await supabase
          .from("workout_plans")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();
        if (wp) {
          setWorkoutPlan(wp);
          const { data: days } = await supabase
            .from("workout_days")
            .select("*, workout_exercises(count)")
            .eq("workout_plan_id", wp.id)
            .order("day_number");
          setWorkoutDays(days || []);
        }
      }
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
      router.refresh();
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: mp } = await supabase
          .from("meal_plans")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();
        if (mp) {
          setMealPlan(mp);
        }
      }
    } else {
      toast.error(result?.error || "Failed to regenerate");
    }
    setLoadingMeal(false);
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
          <div className="relative">
            <h1 className="text-3xl font-bold tracking-tight font-heading">My Plan</h1>
            <p className="mt-1 text-muted-foreground">View and regenerate your plans</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight font-heading">My Plan</h1>
          <p className="mt-1 text-muted-foreground">
            View and regenerate your workout or meal plan. Optionally provide feedback so the
            AI can make adjustments.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-base font-heading">
            <Dumbbell className="h-5 w-5 text-primary" />
            Workout Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {workoutPlan ? (
            <>
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold">{workoutPlan.name}</h3>
                  {workoutPlan.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {workoutPlan.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{workoutPlan.weeks} weeks</span>
                    <span>•</span>
                    <span>{workoutPlan.days_per_week} days/week</span>
                  </div>
                </div>
                {workoutDays.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label className="text-xs text-muted-foreground">Workout Days</Label>
                    <div className="space-y-2">
                      {workoutDays.map((day) => (
                        <Link
                          key={day.id}
                          href={`/app/workouts/${day.id}`}
                          className="group flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-sm">
                              <span className="text-xs font-bold text-primary-foreground">
                                D{day.day_number}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium">{day.name}</div>
                              {day.focus && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {day.focus}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              No workout plan yet. Complete onboarding or generate a new plan.
            </p>
          )}
          <div className="space-y-2">
            <Label>Feedback (optional)</Label>
            <Textarea
              value={workoutFeedback}
              onChange={(e) => setWorkoutFeedback(e.target.value)}
              placeholder="e.g. I want more leg exercises, less shoulder work, shorter sessions..."
              className="border-border/50"
            />
          </div>
          <Button
            onClick={handleRegenerateWorkout}
            disabled={loadingWorkout}
            className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
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

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <Card className="overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-base font-heading">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            Meal Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {mealPlan ? (
            <>
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold">{mealPlan.name}</h3>
                  {mealPlan.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {mealPlan.description}
                    </p>
                  )}
                  {mealPlan.daily_calories && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                        <span className="text-xs text-muted-foreground block">Calories</span>
                        <span className="text-sm font-semibold">{mealPlan.daily_calories}</span>
                      </div>
                      {mealPlan.protein_g && (
                        <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                          <span className="text-xs text-muted-foreground block">Protein</span>
                          <span className="text-sm font-semibold">{mealPlan.protein_g}g</span>
                        </div>
                      )}
                      {mealPlan.carbs_g && (
                        <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                          <span className="text-xs text-muted-foreground block">Carbs</span>
                          <span className="text-sm font-semibold">{mealPlan.carbs_g}g</span>
                        </div>
                      )}
                      {mealPlan.fat_g && (
                        <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                          <span className="text-xs text-muted-foreground block">Fat</span>
                          <span className="text-sm font-semibold">{mealPlan.fat_g}g</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Link
                  href="/app/meals"
                  className="group inline-flex items-center text-sm text-primary hover:underline mt-2"
                >
                  View full meal plan <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              No meal plan yet. Complete onboarding or generate a new plan.
            </p>
          )}
          <div className="space-y-2">
            <Label>Feedback (optional)</Label>
            <Textarea
              value={mealFeedback}
              onChange={(e) => setMealFeedback(e.target.value)}
              placeholder="e.g. More variety, simpler recipes, more protein, less prep time..."
              className="border-border/50"
            />
          </div>
          <Button
            onClick={handleRegenerateMeal}
            disabled={loadingMeal}
            className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
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
