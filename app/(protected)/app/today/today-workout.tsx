import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, ArrowRight } from "lucide-react";
import type { WorkoutExercise } from "@/types/database";
import { enrichMissingExerciseImages } from "@/lib/workout/enrich-existing-exercises";
import { getExerciseIllustrationDisplay } from "@/lib/workout/exercise-illustration-display";

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
      <Card variant="glass" className="overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-2xl bg-muted/60 p-4 ring-1 ring-border/40">
            <Dumbbell className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No workout plan yet
          </p>
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
      <Card variant="glass" className="overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-2xl bg-muted/60 p-4 ring-1 ring-border/40">
            <Dumbbell className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Rest day today</p>
        </CardContent>
      </Card>
    );
  }

  const exercises = (workoutDay.workout_exercises || []) as WorkoutExercise[];
  const sorted = [...exercises].sort(
    (a, b) => a.order_index - b.order_index
  );
  const sortedPreview = await enrichMissingExerciseImages(
    supabase,
    userId,
    sorted
  );

  return (
    <Card
      variant="elevated"
      className="overflow-hidden transition-[box-shadow,transform] duration-200 hover:-translate-y-px"
    >
      <CardHeader className="border-b border-border/40 bg-gradient-to-r from-primary/[0.07] to-transparent pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-section-title flex items-center gap-2 text-base">
            <div className="rounded-xl bg-primary/12 p-1.5 ring-1 ring-primary/15">
              <Dumbbell className="h-4 w-4 text-primary" />
            </div>
            Today&apos;s workout
          </CardTitle>
          <Badge variant="secondary" className="font-medium">
            {workoutDay.focus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <h3 className="font-semibold tracking-tight">{workoutDay.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {exercises.length} exercises
        </p>
        <div className="mt-3 space-y-1.5">
          {sortedPreview.slice(0, 3).map((ex) => {
            const thumb = getExerciseIllustrationDisplay(ex);
            return (
            <div
              key={ex.id}
              className="flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-border/50 hover:bg-muted/40 hover:text-foreground"
            >
              {thumb ? (
                <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border/50 bg-muted/40">
                  <Image
                    src={thumb.src}
                    alt={`${ex.name} illustration`}
                    fill
                    className="object-contain p-0.5"
                    sizes="36px"
                    unoptimized={thumb.unoptimized}
                  />
                </span>
              ) : (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
              )}
              <span className="min-w-0 truncate">{ex.name}</span>
              <span className="ml-auto shrink-0 text-xs tabular-nums">
                {ex.sets}x{ex.reps}
              </span>
            </div>
          );
          })}
          {exercises.length > 3 && (
            <div className="px-3 text-xs text-muted-foreground">
              +{exercises.length - 3} more
            </div>
          )}
        </div>
        <Link
          href={`/app/workouts/${workoutDay.id}`}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-[box-shadow,filter] hover:shadow-elevated hover:brightness-[1.03]"
        >
          Start workout
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
