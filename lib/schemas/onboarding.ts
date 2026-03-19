import { z } from "zod";

export const onboardingSchema = z.object({
  fitness_goal: z.enum(["lose_fat", "build_muscle", "maintain", "recomp", "improve_health"]),
  experience_level: z.enum(["beginner", "intermediate", "advanced"]),
  age: z.coerce.number().min(13).max(100),
  sex: z.enum(["male", "female", "other"]),
  height_cm: z.coerce.number().min(100).max(250),
  weight_kg: z.coerce.number().min(30).max(300),
  target_weight_kg: z.coerce.number().min(30).max(300),
  activity_level: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  workout_days_per_week: z.coerce.number().min(1).max(7),
  workout_duration_minutes: z.coerce.number().min(15).max(180),
  available_equipment: z.array(z.string()).default([]),
  dietary_restrictions: z.array(z.string()).default([]),
  diet_type: z.enum(["flexible", "keto", "paleo", "vegan", "vegetarian", "mediterranean"]),
  meals_per_day: z.coerce.number().min(2).max(6),
  injuries: z.array(
    z.object({
      body_part: z.string().min(1),
      description: z.string().optional(),
      severity: z.enum(["mild", "moderate", "severe"]),
    })
  ).default([]),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const EQUIPMENT_OPTIONS = [
  "Full Gym",
  "Dumbbells",
  "Barbell",
  "Kettlebells",
  "Resistance Bands",
  "Pull-up Bar",
  "Bench",
  "Cable Machine",
  "Bodyweight Only",
] as const;

export const DIETARY_RESTRICTION_OPTIONS = [
  "Gluten-free",
  "Dairy-free",
  "Nut-free",
  "Soy-free",
  "Egg-free",
  "Shellfish-free",
  "Halal",
  "Kosher",
  "Low sodium",
] as const;

export const FITNESS_GOAL_LABELS: Record<string, string> = {
  lose_fat: "Lose Fat",
  build_muscle: "Build Muscle",
  maintain: "Maintain Weight",
  recomp: "Body Recomposition",
  improve_health: "Improve Health",
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Beginner (0-1 years)",
  intermediate: "Intermediate (1-3 years)",
  advanced: "Advanced (3+ years)",
};

export const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentary (desk job)",
  light: "Lightly Active",
  moderate: "Moderately Active",
  active: "Active",
  very_active: "Very Active (physical job)",
};
