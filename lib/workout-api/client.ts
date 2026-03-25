import { parseExerciseListPayload } from "./parse";
import type { WorkoutApiExercise } from "./types";

const DEFAULT_BASE = "https://api.workoutapi.com";

function getBaseUrl(): string {
  return (process.env.WORKOUT_API_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");
}

function getApiKey(): string | null {
  const k = process.env.WORKOUT_API_KEY;
  return k && k.trim().length > 0 ? k.trim() : null;
}

async function workoutApiFetch(
  path: string,
  init?: RequestInit & { searchParams?: Record<string, string> }
): Promise<Response> {
  const key = getApiKey();
  if (!key) {
    return new Response(null, { status: 401, statusText: "Missing WORKOUT_API_KEY" });
  }
  const url = new URL(path.startsWith("http") ? path : `${getBaseUrl()}${path}`);
  if (init?.searchParams) {
    for (const [k, v] of Object.entries(init.searchParams)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
  }
  const { searchParams: _s, ...rest } = init || {};
  return fetch(url.toString(), {
    ...rest,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "x-api-key": key,
      ...rest.headers,
    },
  });
}

export async function fetchAllExercises(): Promise<WorkoutApiExercise[]> {
  const res = await workoutApiFetch("/exercises");
  if (!res.ok) {
    console.warn(
      "[workout-api] fetchAllExercises failed:",
      res.status,
      await res.text().catch(() => "")
    );
    return [];
  }
  const data: unknown = await res.json().catch(() => null);
  return parseExerciseListPayload(data);
}

export async function searchExercisesByQuery(
  q: string
): Promise<WorkoutApiExercise[]> {
  const trimmed = q.trim();
  if (!trimmed) return [];
  const res = await workoutApiFetch("/exercises/search", {
    searchParams: { q: trimmed },
  });
  if (!res.ok) {
    console.warn(
      "[workout-api] searchExercisesByQuery failed:",
      res.status,
      await res.text().catch(() => "")
    );
    return [];
  }
  const data: unknown = await res.json().catch(() => null);
  return parseExerciseListPayload(data);
}

/**
 * Resolve illustration URL when it is not embedded in the exercise JSON.
 * Tries JSON body or final URL after redirects for image/* responses.
 */
export async function fetchExerciseIllustrationUrl(
  exerciseId: string
): Promise<string | null> {
  const res = await workoutApiFetch(`/exercises/${encodeURIComponent(exerciseId)}/image`, {
    headers: { Accept: "application/json, image/*, */*" },
    redirect: "follow",
  });
  if (!res.ok) return null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data: unknown = await res.json().catch(() => null);
    if (data && typeof data === "object") {
      const o = data as Record<string, unknown>;
      const u =
        (typeof o.url === "string" && o.url) ||
        (typeof o.imageUrl === "string" && o.imageUrl) ||
        (typeof o.image_url === "string" && o.image_url) ||
        null;
      if (u && /^https?:\/\//i.test(u)) return u;
    }
    return null;
  }
  if (ct.startsWith("image/")) {
    const finalUrl = res.url;
    if (finalUrl && /^https?:\/\//i.test(finalUrl)) return finalUrl;
  }
  return null;
}

export function isWorkoutApiConfigured(): boolean {
  return getApiKey() !== null;
}
