import type { WorkoutApiExercise } from "./types";

/** Expand common abbreviations before matching catalog names. */
const NAME_ALIASES: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\bdb\b/gi, replacement: "dumbbell" },
  { pattern: /\bbb\b/gi, replacement: "barbell" },
  { pattern: /\bohp\b/gi, replacement: "overhead press" },
  { pattern: /\brdl\b/gi, replacement: "romanian deadlift" },
  { pattern: /\bleg ext\b/gi, replacement: "leg extension" },
  { pattern: /\bleg curl\b/gi, replacement: "leg curl" },
];

export function normalizeExerciseName(name: string): string {
  let s = name.toLowerCase();
  for (const { pattern, replacement } of NAME_ALIASES) {
    s = s.replace(pattern, replacement);
  }
  return s
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandedTokenSet(s: string): Set<string> {
  const n = normalizeExerciseName(s);
  const tokens = n.split(" ").filter((t) => t.length > 1);
  const set = new Set<string>();
  for (const t of tokens) {
    set.add(t);
    if (t.endsWith("s") && t.length > 3) set.add(t.slice(0, -1));
    else if (t.length > 2) set.add(`${t}s`);
  }
  return set;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const t of a) {
    if (b.has(t)) inter++;
  }
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function levenshteinRatio(a: string, b: string): number {
  const s = normalizeExerciseName(a);
  const t = normalizeExerciseName(b);
  if (s === t) return 1;
  if (!s.length || !t.length) return 0;
  const matrix: number[][] = [];
  for (let i = 0; i <= t.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= t.length; i++) {
    for (let j = 1; j <= s.length; j++) {
      const cost = s[j - 1] === t[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  const dist = matrix[t.length][s.length];
  const maxLen = Math.max(s.length, t.length);
  return 1 - dist / maxLen;
}

function scoreMatch(aiName: string, candidate: WorkoutApiExercise): number {
  const a = normalizeExerciseName(aiName);
  const b = normalizeExerciseName(candidate.name);
  if (!a.length || !b.length) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.92;
  const tsA = expandedTokenSet(aiName);
  const tsB = expandedTokenSet(candidate.name);
  const jac = jaccard(tsA, tsB);
  const lev = levenshteinRatio(aiName, candidate.name);
  return Math.max(jac * 0.95, lev * 0.85);
}

const MIN_SCORE = 0.42;

export function bestMatchExercise(
  aiExerciseName: string,
  catalog: WorkoutApiExercise[]
): WorkoutApiExercise | null {
  if (!aiExerciseName.trim() || catalog.length === 0) return null;
  let best: WorkoutApiExercise | null = null;
  let bestScore = 0;
  for (const c of catalog) {
    const sc = scoreMatch(aiExerciseName, c);
    if (sc > bestScore) {
      bestScore = sc;
      best = c;
    }
  }
  if (best && bestScore >= MIN_SCORE) return best;
  return null;
}
