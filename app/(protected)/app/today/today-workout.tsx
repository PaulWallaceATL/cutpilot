import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ArrowRight } from "lucide-react";

export async function TodayWorkout({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("workout_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (!plan) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Dumbbell className="h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">No workout plan yet</p>
        </CardContent>
      </Card>
    );
  }

  const dayOfWeek = new Date().getDay() || 7;

  const { data: workoutDay } = await supabase
    .from("workout_days")
    .select("*, workout_exercises(*)")
    .eq("workout_plan_id", plan.id)
    .eq("day_number", dayOfWeek)
    .single();

  if (!workoutDay) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Dumbbell className="h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">Rest day today</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Today&apos;s Workout
          </CardTitle>
          <Badge variant="secondary">{workoutDay.focus}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold">{workoutDay.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {workoutDay.workout_exercises?.length ?? 0} exercises
        </p>
        <div className="mt-3 space-y-1">
          {workoutDay.workout_exercises?.slice(0, 3).map((ex: { id: string; name: string; sets: number; reps: string }) => (
            <div key={ex.id} className="text-sm text-muted-foreground">
              {ex.name} — {ex.sets}x{ex.reps}
            </div>
          ))}
          {(workoutDay.workout_exercises?.length ?? 0) > 3 && (
            <div className="text-xs text-muted-foreground">
              +{workoutDay.workout_exercises.length - 3} more
            </div>
          )}
        </div>
        <Link
          href={`/app/workouts/${workoutDay.id}`}
          className="mt-4 w-full inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 h-8 text-sm font-medium hover:bg-muted transition-all"
        >
          Start Workout
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
