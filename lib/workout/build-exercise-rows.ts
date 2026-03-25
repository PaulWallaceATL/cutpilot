import type { AIWorkoutExercise } from "@/lib/schemas/workout";
import { getCachedWorkoutApiCatalog } from "@/lib/workout-api/catalog";
import { resolveWorkoutApiMediaForName } from "@/lib/workout-api/resolve-media";

export type WorkoutExerciseInsertRow = {
  user_id: string;
  workout_day_id: string;
  order_index: number;
  name: string;
  muscle_group: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  weight_suggestion: string | null;
  notes: string | null;
  workout_api_exercise_id: string | null;
  exercise_image_url: string | null;
};

export async function buildWorkoutExerciseInsertRows(
  userId: string,
  workoutDayId: string,
  exercises: AIWorkoutExercise[]
): Promise<WorkoutExerciseInsertRow[]> {
  const catalog =
    process.env.WORKOUT_API_KEY?.trim() ?
      await getCachedWorkoutApiCatalog()
    : [];

  const rows = await Promise.all(
    exercises.map(async (ex, idx) => {
      let workout_api_exercise_id: string | null = null;
      let exercise_image_url: string | null = null;

      if (process.env.WORKOUT_API_KEY?.trim()) {
        const resolved = await resolveWorkoutApiMediaForName(ex.name, catalog);
        if (resolved) {
          workout_api_exercise_id = resolved.id;
          exercise_image_url = resolved.imageUrl?.trim() || null;
        }
      }

      return {
        user_id: userId,
        workout_day_id: workoutDayId,
        order_index: idx,
        name: ex.name,
        muscle_group: ex.muscle_group,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        weight_suggestion: ex.weight_suggestion ?? null,
        notes: ex.notes ?? null,
        workout_api_exercise_id,
        exercise_image_url,
      };
    })
  );

  return rows;
}
