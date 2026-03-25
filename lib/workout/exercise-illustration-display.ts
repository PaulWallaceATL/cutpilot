import type { WorkoutExercise } from "@/types/database";

/** URLs that only work with x-api-key — browsers and next/image cannot load them directly. */
export function isWorkoutApiAuthenticatedAssetUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("workoutapi.com")) return false;
    return /\/exercises\/[^/]+\/image/i.test(u.pathname);
  } catch {
    return false;
  }
}

/**
 * Prefer a public CDN URL in the DB; otherwise use our proxy (adds API key server-side).
 */
export function getExerciseIllustrationDisplay(
  exercise: WorkoutExercise
): { src: string; unoptimized: boolean } | null {
  const raw = exercise.exercise_image_url?.trim() || null;
  const id = exercise.workout_api_exercise_id?.trim() || null;

  if (raw && !isWorkoutApiAuthenticatedAssetUrl(raw)) {
    return { src: raw, unoptimized: false };
  }

  if (id) {
    return {
      src: `/api/workout-illustration/${encodeURIComponent(id)}`,
      unoptimized: true,
    };
  }

  if (raw && isWorkoutApiAuthenticatedAssetUrl(raw)) {
    const m = raw.match(/\/exercises\/([^/]+)\/image/i);
    if (m?.[1]) {
      return {
        src: `/api/workout-illustration/${encodeURIComponent(m[1])}`,
        unoptimized: true,
      };
    }
  }

  return null;
}

/** Persist only URLs that clients can load without the Workout API key. */
export function sanitizeExerciseImageUrlForStorage(
  url: string | null | undefined
): string | null {
  const t = url?.trim();
  if (!t) return null;
  if (isWorkoutApiAuthenticatedAssetUrl(t)) return null;
  return t;
}
