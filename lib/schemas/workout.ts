import { z } from "zod";

export const workoutExerciseSchema = z.object({
  name: z.string().describe("Exercise name"),
  muscle_group: z.string().describe("Primary muscle group targeted"),
  sets: z.number().min(1).max(10).describe("Number of sets"),
  reps: z.string().describe("Rep range or scheme, e.g. '8-12' or '5x5'"),
  rest_seconds: z.number().min(15).max(300).describe("Rest time between sets in seconds"),
  weight_suggestion: z.string().nullable().optional().describe("Suggested weight or intensity"),
  notes: z.string().nullable().optional().describe("Form cues or notes"),
});

export const workoutDaySchema = z.object({
  day_number: z.number().min(1).max(7),
  name: z.string().describe("Day name, e.g. 'Upper Body Push'"),
  focus: z.string().describe("Primary focus area"),
  exercises: z.array(workoutExerciseSchema).min(3).max(12),
});

export const workoutPlanSchema = z.object({
  name: z.string().describe("Plan name"),
  description: z.string().describe("Brief plan description"),
  weeks: z.number().min(1).max(12),
  days_per_week: z.number().min(1).max(7),
  days: z.array(workoutDaySchema),
});

export type AIWorkoutPlan = z.infer<typeof workoutPlanSchema>;
export type AIWorkoutDay = z.infer<typeof workoutDaySchema>;
export type AIWorkoutExercise = z.infer<typeof workoutExerciseSchema>;
