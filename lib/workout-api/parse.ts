import type { WorkoutApiExercise } from "./types";

const API_ORIGIN = "https://api.workoutapi.com";

function pickString(v: unknown): string | null {
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function absolutizeMediaUrl(url: string): string {
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/")) return `${API_ORIGIN.replace(/\/$/, "")}${u}`;
  return u;
}

/** Best-effort image URL from an API object (field names vary by version). */
export function extractImageUrlFromRecord(
  obj: Record<string, unknown>
): string | null {
  const nestedKeys = [
    "illustration",
    "visual",
    "media",
    "imageAsset",
    "image_asset",
  ] as const;
  for (const nk of nestedKeys) {
    const inner = obj[nk];
    if (inner && typeof inner === "object") {
      const nested = extractImageUrlFromRecord(inner as Record<string, unknown>);
      if (nested) return nested;
    }
  }

  const keys = [
    "imageUrl",
    "image_url",
    "illustrationUrl",
    "illustration_url",
    "visualUrl",
    "visual_url",
    "gifUrl",
    "gif_url",
    "thumbnailUrl",
    "thumbnail_url",
    "image",
    "url",
    "src",
    "href",
  ] as const;
  for (const k of keys) {
    const u = pickString(obj[k]);
    if (!u) continue;
    const abs = absolutizeMediaUrl(u);
    if (/^https?:\/\//i.test(abs)) return abs;
  }
  return null;
}

function pickId(obj: Record<string, unknown>): string | null {
  return (
    pickString(obj.id) ??
    pickString(obj.uuid) ??
    pickString(obj.exerciseId) ??
    pickString(obj.exercise_id) ??
    pickString(obj.uniqueCode) ??
    pickString(obj.unique_code) ??
    pickString(obj.code) ??
    pickString(obj.slug) ??
    pickString(obj._id)
  );
}

function pickName(obj: Record<string, unknown>): string | null {
  return (
    pickString(obj.name) ??
    pickString(obj.title) ??
    pickString(obj.label) ??
    pickString(obj.nameEn) ??
    pickString(obj.name_en)
  );
}

export function parseWorkoutApiExercise(
  raw: unknown
): WorkoutApiExercise | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = pickId(o);
  const name = pickName(o);
  if (!id || !name) return null;
  return {
    id,
    name,
    imageUrl: extractImageUrlFromRecord(o),
    raw: o,
  };
}

export function parseExerciseListPayload(data: unknown): WorkoutApiExercise[] {
  let list: unknown[] = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    const inner =
      o.data ??
      o.exercises ??
      o.results ??
      o.items ??
      o.content ??
      o.payload ??
      o.response ??
      o.list ??
      o.body;
    if (Array.isArray(inner)) list = inner;
  }
  const out: WorkoutApiExercise[] = [];
  for (const item of list) {
    const ex = parseWorkoutApiExercise(item);
    if (ex) out.push(ex);
  }
  return out;
}
