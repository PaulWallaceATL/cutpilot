import type { AIWorkoutExercise } from "@/lib/schemas/workout";
import { fetchExerciseIllustrationUrl, searchExercisesByQuery } from "@/lib/workout-api/client";
import { getCachedWorkoutApiCatalog } from "@/lib/workout-api/catalog";
import { bestMatchExercise, normalizeExerciseName } from "@/lib/workout-api/match";
import type { WorkoutApiExercise } from "@/lib/workout-api/types";

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

async function resolveMatch(
  aiName: string,
  catalog: WorkoutApiExercise[]
): Promise<WorkoutApiExercise | null> {
  const fromCatalog = bestMatchExercise(aiName, catalog);
  if (fromCatalog) return fromCatalog;

  const q = normalizeExerciseName(aiName).slice(0, 80);
  if (!q) return null;
  const searchHits = await searchExercisesByQuery(aiName.slice(0, 120));
  if (searchHits.length === 0) return null;
  return bestMatchExercise(aiName, searchHits);
}

async function resolveImageUrl(match: WorkoutApiExercise): Promise<string | null> {
  if (match.imageUrl) return match.imageUrl;
  return fetchExerciseIllustrationUrl(match.id);
}

export async function buildWorkoutExerciseInsertRows(
  userId: string,
  workoutDayId: string,
  exercises: AIWorkoutExercise[]
): Promise<WorkoutExerciseInsertRow[]> {
  const catalog = await getCachedWorkoutApiCatalog();

  const rows = await Promise.all(
    exercises.map(async (ex, idx) => {
      let workout_api_exercise_id: string | null = null;
      let exercise_image_url: string | null = null;

      if (catalog.length > 0 || process.env.WORKOUT_API_KEY?.trim()) {
        const match = await resolveMatch(ex.name, catalog);
        if (match) {
          workout_api_exercise_id = match.id;
          exercise_image_url = await resolveImageUrl(match);
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
