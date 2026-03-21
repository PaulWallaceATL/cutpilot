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
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-3">
            <Dumbbell className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">No workout plan yet</p>
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
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-3">
            <Dumbbell className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Rest day today</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/8 to-transparent pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Dumbbell className="h-4 w-4 text-primary" />
            </div>
            Today&apos;s Workout
          </CardTitle>
          <Badge variant="secondary" className="font-medium">
            {workoutDay.focus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <h3 className="font-semibold">{workoutDay.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {workoutDay.workout_exercises?.length ?? 0} exercises
        </p>
        <div className="mt-3 space-y-1.5">
          {workoutDay.workout_exercises?.slice(0, 3).map((ex: { id: string; name: string; sets: number; reps: string }) => (
            <div
              key={ex.id}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
              <span>{ex.name}</span>
              <span className="ml-auto text-xs tabular-nums">{ex.sets}x{ex.reps}</span>
            </div>
          ))}
          {(workoutDay.workout_exercises?.length ?? 0) > 3 && (
            <div className="px-3 text-xs text-muted-foreground">
              +{workoutDay.workout_exercises.length - 3} more
            </div>
          )}
        </div>
        <Link
          href={`/app/workouts/${workoutDay.id}`}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-110"
        >
          Start Workout
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
