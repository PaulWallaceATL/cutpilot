/** Normalized exercise row from Workout API list/search responses. */
export type WorkoutApiExercise = {
  id: string;
  name: string;
  imageUrl: string | null;
  raw: Record<string, unknown>;
};
