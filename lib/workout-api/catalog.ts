import { unstable_cache } from "next/cache";
import { fetchAllExercises } from "./client";
import type { WorkoutApiExercise } from "./types";

const loadCatalog = unstable_cache(
  async () => {
    if (!process.env.WORKOUT_API_KEY?.trim()) return [];
    return fetchAllExercises();
  },
  ["workout-api-exercise-catalog-v1"],
  { revalidate: 86_400 }
);

/**
 * Cached full exercise list (24h). Reduces API usage during onboarding / plan regeneration.
 */
export function getCachedWorkoutApiCatalog(): Promise<WorkoutApiExercise[]> {
  return loadCatalog();
}
