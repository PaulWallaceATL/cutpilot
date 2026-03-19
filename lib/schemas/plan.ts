import { z } from "zod";
import { workoutPlanSchema } from "./workout";
import { mealPlanSchema } from "./meal";

export const initialPlanSchema = z.object({
  workout_plan: workoutPlanSchema,
  meal_plan: mealPlanSchema,
  calorie_target: z.number().describe("Recommended daily calorie target"),
  protein_target_g: z.number().describe("Recommended daily protein target"),
  carb_target_g: z.number().describe("Recommended daily carb target"),
  fat_target_g: z.number().describe("Recommended daily fat target"),
  plan_summary: z.string().describe("Brief overview of the generated plan and rationale"),
});

export type AIInitialPlan = z.infer<typeof initialPlanSchema>;
