import {
  fetchExerciseById,
  fetchExerciseIllustrationUrl,
  searchExercisesByQuery,
} from "./client";
import { getCachedWorkoutApiCatalog } from "./catalog";
import { bestMatchExercise, normalizeExerciseName } from "./match";
import { extractImageUrlFromRecord, parseWorkoutApiExercise } from "./parse";
import type { WorkoutApiExercise } from "./types";

async function resolveImageForMatch(match: WorkoutApiExercise): Promise<string | null> {
  if (match.imageUrl) return match.imageUrl;

  const detail = await fetchExerciseById(match.id);
  if (detail?.imageUrl) return detail.imageUrl;
  if (detail) {
    const fromRaw = extractImageUrlFromRecord(detail.raw);
    if (fromRaw) return fromRaw;
  }

  return fetchExerciseIllustrationUrl(match.id);
}

function firstSearchToken(name: string): string | null {
  const parts = normalizeExerciseName(name).split(" ").filter((p) => p.length > 2);
  return parts[0] ?? null;
}

async function resolveMatchFromCatalogOrSearch(
  aiName: string,
  catalog: WorkoutApiExercise[]
): Promise<WorkoutApiExercise | null> {
  const trimmed = aiName.trim();
  if (!trimmed) return null;

  const fromCatalog = bestMatchExercise(trimmed, catalog);
  if (fromCatalog) return fromCatalog;

  const searches: string[] = [trimmed.slice(0, 120)];
  const norm = normalizeExerciseName(trimmed).slice(0, 80);
  if (norm && norm !== trimmed.toLowerCase()) searches.push(norm);

  const token = firstSearchToken(trimmed);
  if (token && !searches.some((s) => s.toLowerCase().startsWith(token))) {
    searches.push(token);
  }

  const seen = new Set<string>();
  for (const q of searches) {
    const key = q.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const hits = await searchExercisesByQuery(q);
    if (hits.length === 0) continue;
    const best = bestMatchExercise(trimmed, hits);
    if (best) return best;
    if (hits.length === 1) return hits[0];
  }

  return null;
}

/**
 * Match an AI/free-text exercise name to Workout API and resolve a public image URL.
 */
export async function resolveWorkoutApiMediaForName(
  aiName: string,
  catalog?: WorkoutApiExercise[]
): Promise<{ id: string; imageUrl: string | null } | null> {
  if (!process.env.WORKOUT_API_KEY?.trim()) return null;

  const list = catalog ?? (await getCachedWorkoutApiCatalog());
  const match = await resolveMatchFromCatalogOrSearch(aiName, list);
  if (!match) return null;

  const imageUrl = await resolveImageForMatch(match);
  return { id: match.id, imageUrl };
}
