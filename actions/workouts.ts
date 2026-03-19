"use server";

import { createClient } from "@/lib/supabase/server";
import { contextualWorkoutAssistant } from "@/lib/openai/workout-assistant";
import type { WorkoutDayWithExercises } from "@/types/database";

export async function logWorkoutSet(data: {
  workout_log_id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("workout_set_logs").upsert(
    {
      user_id: user.id,
      workout_log_id: data.workout_log_id,
      exercise_id: data.exercise_id,
      set_number: data.set_number,
      reps: data.reps,
      weight: data.weight,
      completed: true,
    },
    { onConflict: "workout_log_id,exercise_id,set_number" }
  );

  if (error) return { error: "Failed to log set" };
  return { success: true };
}

export async function startWorkout(workoutDayId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("workout_logs")
    .insert({
      user_id: user.id,
      workout_day_id: workoutDayId,
      date: new Date().toISOString().split("T")[0],
    })
    .select("id")
    .single();

  if (error) return { error: "Failed to start workout" };
  return { data };
}

export async function completeWorkout(
  workoutLogId: string,
  durationMinutes: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("workout_logs")
    .update({
      completed: true,
      duration_minutes: durationMinutes,
    })
    .eq("id", workoutLogId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to complete workout" };
  return { success: true };
}

export async function askWorkoutAssistant(
  workoutDayId: string,
  message: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: workout } = await supabase
    .from("workout_days")
    .select("*, workout_exercises(*)")
    .eq("id", workoutDayId)
    .single();

  if (!workout) return { error: "Workout not found" };

  let { data: thread } = await supabase
    .from("ai_threads")
    .select("*")
    .eq("user_id", user.id)
    .eq("context_type", "workout")
    .eq("context_id", workoutDayId)
    .single();

  if (!thread) {
    const { data: newThread } = await supabase
      .from("ai_threads")
      .insert({
        user_id: user.id,
        context_type: "workout",
        context_id: workoutDayId,
        title: `Workout: ${workout.name}`,
      })
      .select("*")
      .single();
    thread = newThread;
  }

  if (!thread) return { error: "Failed to create thread" };

  await supabase.from("ai_messages").insert({
    user_id: user.id,
    thread_id: thread.id,
    role: "user",
    content: message,
  });

  const { data: history } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true });

  const response = await contextualWorkoutAssistant(
    workout as WorkoutDayWithExercises,
    message,
    history || []
  );

  await supabase.from("ai_messages").insert({
    user_id: user.id,
    thread_id: thread.id,
    role: "assistant",
    content: response.message,
  });

  return { data: response };
}
