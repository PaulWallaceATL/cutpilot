import { resolveWorkoutApiMediaForName } from "@/lib/workout-api/resolve-media";
import { getCachedWorkoutApiCatalog } from "@/lib/workout-api/catalog";
import type { WorkoutExercise } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Fills Workout API ids and illustration URLs for rows created before enrichment
 * (or when the API was unavailable). Updates Supabase and returns merged objects
 * for the current request.
 */
export async function enrichMissingExerciseImages(
  supabase: SupabaseClient,
  userId: string,
  exercises: WorkoutExercise[]
): Promise<WorkoutExercise[]> {
  if (!process.env.WORKOUT_API_KEY?.trim()) {
    return exercises;
  }

  const catalog = await getCachedWorkoutApiCatalog();
  const next = [...exercises];

  for (let i = 0; i < next.length; i++) {
    const ex = next[i];
    if (ex.exercise_image_url?.trim()) continue;

    const resolved = await resolveWorkoutApiMediaForName(ex.name, catalog);
    if (!resolved?.imageUrl?.trim()) continue;

    const { error } = await supabase
      .from("workout_exercises")
      .update({
        workout_api_exercise_id: resolved.id,
        exercise_image_url: resolved.imageUrl,
      })
      .eq("id", ex.id)
      .eq("user_id", userId);

    if (error) {
      console.warn(
        "[workout] Could not persist exercise_image_url (run DB migration?):",
        error.message
      );
    }

    next[i] = {
      ...ex,
      workout_api_exercise_id: resolved.id,
      exercise_image_url: resolved.imageUrl,
    };
  }

  return next;
}
