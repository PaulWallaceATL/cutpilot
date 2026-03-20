"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { regenerateWorkout, regenerateMeal } from "@/actions/plan";
import { createClient } from "@/lib/supabase/client";
import { Dumbbell, UtensilsCrossed, RefreshCw, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { AnimatedCard, CardContent, CardHeader, CardTitle } from "@/components/react-bits/animated-card";
import { GradientButton } from "@/components/react-bits/gradient-button";
import { StaggeredText } from "@/components/react-bits/staggered-text";
import { AnimatedList } from "@/components/react-bits/animated-list";

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

      // Load workout plan
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

      // Load meal plan
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
      // Reload plans
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
      // Reload plans
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
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Plan</h1>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          <StaggeredText text="My Plan" as="span" />
        </h1>
        <p className="text-muted-foreground">
          View and regenerate your workout or meal plan. Optionally provide feedback so the
          AI can make adjustments.
        </p>
      </div>

      <AnimatedCard hoverEffect="glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="h-5 w-5 transition-transform hover:scale-110" />
            Workout Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                    <Label className="text-xs">Workout Days</Label>
                    <AnimatedList className="space-y-2" animation="slide" staggerDelay={50}>
                      {workoutDays.map((day) => (
                        <Link
                          key={day.id}
                          href={`/app/workouts/${day.id}`}
                          className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-muted transition-all hover:scale-[1.02]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 transition-transform hover:scale-110">
                              <span className="text-xs font-bold text-primary">
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
                          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </Link>
                      ))}
                    </AnimatedList>
                  </div>
                )}
              </div>
              <Separator />
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
            />
          </div>
          <GradientButton
            onClick={handleRegenerateWorkout}
            disabled={loadingWorkout}
            className="w-full"
            gradient="rainbow"
          >
            {loadingWorkout ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {loadingWorkout ? "Generating..." : "Regenerate Workout Plan"}
          </GradientButton>
        </CardContent>
      </AnimatedCard>

      <Separator />

      <AnimatedCard hoverEffect="glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UtensilsCrossed className="h-5 w-5 transition-transform hover:scale-110" />
            Meal Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Calories:</span>
                        <span className="ml-2 font-medium">{mealPlan.daily_calories}</span>
                      </div>
                      {mealPlan.protein_g && (
                        <div>
                          <span className="text-muted-foreground">Protein:</span>
                          <span className="ml-2 font-medium">{mealPlan.protein_g}g</span>
                        </div>
                      )}
                      {mealPlan.carbs_g && (
                        <div>
                          <span className="text-muted-foreground">Carbs:</span>
                          <span className="ml-2 font-medium">{mealPlan.carbs_g}g</span>
                        </div>
                      )}
                      {mealPlan.fat_g && (
                        <div>
                          <span className="text-muted-foreground">Fat:</span>
                          <span className="ml-2 font-medium">{mealPlan.fat_g}g</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Link
                  href="/app/meals"
                  className="inline-flex items-center text-sm text-primary hover:underline mt-2"
                >
                  View full meal plan <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <Separator />
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
            />
          </div>
          <GradientButton
            onClick={handleRegenerateMeal}
            disabled={loadingMeal}
            className="w-full"
            gradient="purple"
          >
            {loadingMeal ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {loadingMeal ? "Generating..." : "Regenerate Meal Plan"}
          </GradientButton>
        </CardContent>
      </AnimatedCard>
    </div>
  );
}
