import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ExerciseCard } from "@/components/workout/exercise-card";
import { WorkoutChat } from "@/components/workout/workout-chat";
import { WorkoutActions } from "./workout-actions";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import type { WorkoutExercise } from "@/types/database";
import { enrichMissingExerciseImages } from "@/lib/workout/enrich-existing-exercises";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: workout } = await supabase
    .from("workout_days")
    .select("*, workout_exercises(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!workout) notFound();

  const today = new Date().toISOString().split("T")[0];
  const { data: existingLog } = await supabase
    .from("workout_logs")
    .select("*, workout_set_logs(*)")
    .eq("workout_day_id", id)
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  const { data: thread } = await supabase
    .from("ai_threads")
    .select("*")
    .eq("user_id", user.id)
    .eq("context_type", "workout")
    .eq("context_id", id)
    .single();

  let chatMessages: Array<{ id: string; role: "user" | "assistant"; content: string; thread_id: string; user_id: string; created_at: string }> = [];
  if (thread) {
    const { data } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("thread_id", thread.id)
      .order("created_at", { ascending: true });
    chatMessages = (data || []).map((m) => ({
      ...m,
      role: m.role as "user" | "assistant",
    }));
  }

  const exercises = (workout.workout_exercises || []) as WorkoutExercise[];
  const sortedExercises = [...exercises].sort(
    (a, b) => a.order_index - b.order_index
  );

  const enrichedExercises = await enrichMissingExerciseImages(
    supabase,
    user.id,
    sortedExercises
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/[0.1] via-card/90 to-primary/[0.04] p-6 shadow-soft backdrop-blur-sm sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-primary/6 blur-3xl" />
        <div className="relative space-y-3">
          <Link
            href="/app/workouts"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to workouts
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-page-title text-2xl sm:text-3xl">{workout.name}</h1>
            {workout.focus && (
              <Badge variant="secondary" className="font-medium">{workout.focus}</Badge>
            )}
          </div>
          {workout.notes && (
            <p className="text-muted-foreground">{workout.notes}</p>
          )}
        </div>
      </div>

      <WorkoutActions
        workoutDayId={id}
        existingLogId={existingLog?.id || null}
      />

      <div className="space-y-5">
        {enrichedExercises.map((exercise) => {
          const setLogs = (existingLog?.workout_set_logs || []).filter(
            (s: { exercise_id: string }) => s.exercise_id === exercise.id
          );
          return (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              workoutLogId={existingLog?.id || null}
              existingSets={setLogs}
            />
          );
        })}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div>
        <h2 className="text-section-title mb-3">Workout coach</h2>
        <WorkoutChat workoutDayId={id} initialMessages={chatMessages} />
      </div>
    </div>
  );
}
