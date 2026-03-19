import { z } from "zod";

export const mealIngredientSchema = z.object({
  name: z.string().describe("Ingredient name"),
  amount: z.string().describe("Amount, e.g. '200g' or '1 cup'"),
  unit: z.string().describe("Unit of measurement"),
  calories: z.number().describe("Calories for this amount"),
  protein_g: z.number().describe("Protein in grams"),
  carbs_g: z.number().describe("Carbs in grams"),
  fat_g: z.number().describe("Fat in grams"),
});

export const mealSchema = z.object({
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  name: z.string().describe("Meal name"),
  description: z.string().describe("Brief description of the meal"),
  calories: z.number().describe("Total calories"),
  protein_g: z.number().describe("Total protein in grams"),
  carbs_g: z.number().describe("Total carbs in grams"),
  fat_g: z.number().describe("Total fat in grams"),
  prep_time_minutes: z.number().describe("Preparation time in minutes"),
  ingredients: z.array(mealIngredientSchema),
});

export const mealDaySchema = z.object({
  day_number: z.number().min(1).max(7),
  total_calories: z.number(),
  total_protein_g: z.number(),
  total_carbs_g: z.number(),
  total_fat_g: z.number(),
  meals: z.array(mealSchema),
});

export const mealPlanSchema = z.object({
  name: z.string().describe("Meal plan name"),
  description: z.string().describe("Brief plan description"),
  daily_calories: z.number().describe("Daily calorie target"),
  protein_g: z.number().describe("Daily protein target"),
  carbs_g: z.number().describe("Daily carbs target"),
  fat_g: z.number().describe("Daily fat target"),
  days: z.array(mealDaySchema),
});

export const mealSubstitutionSchema = z.object({
  original_meal: z.string().describe("Name of the original meal"),
  substitute: mealSchema.describe("The replacement meal"),
  reasoning: z.string().describe("Why this substitution works"),
});

export type AIMealPlan = z.infer<typeof mealPlanSchema>;
export type AIMealDay = z.infer<typeof mealDaySchema>;
export type AIMeal = z.infer<typeof mealSchema>;
export type AIMealIngredient = z.infer<typeof mealIngredientSchema>;
export type AIMealSubstitution = z.infer<typeof mealSubstitutionSchema>;
