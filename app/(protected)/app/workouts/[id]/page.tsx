import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ExerciseCard } from "@/components/workout/exercise-card";
import { WorkoutChat } from "@/components/workout/workout-chat";
import { WorkoutActions } from "./workout-actions";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { WorkoutExercise } from "@/types/database";

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

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{workout.name}</h1>
          {workout.focus && <Badge variant="secondary">{workout.focus}</Badge>}
        </div>
        {workout.notes && (
          <p className="mt-1 text-muted-foreground">{workout.notes}</p>
        )}
      </div>

      <WorkoutActions
        workoutDayId={id}
        existingLogId={existingLog?.id || null}
      />

      <div className="space-y-4">
        {sortedExercises.map((exercise) => {
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

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-3">AI Assistant</h2>
        <WorkoutChat workoutDayId={id} initialMessages={chatMessages} />
      </div>
    </div>
  );
}
