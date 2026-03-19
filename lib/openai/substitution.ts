import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient, getTextModel } from "./client";
import {
  mealSubstitutionSchema,
  type AIMealSubstitution,
} from "@/lib/schemas/meal";
import type { Meal, MealIngredient, UserPreferences } from "@/types/database";

export async function mealSubstitutionAssistant(
  meal: Meal & { meal_ingredients: MealIngredient[] },
  preferences: UserPreferences,
  reason?: string
): Promise<AIMealSubstitution> {
  const client = getOpenAIClient();

  const ingredientList = meal.meal_ingredients
    .map((i) => `${i.name} (${i.amount} ${i.unit})`)
    .join(", ");

  const systemPrompt = `You are CutPilot's meal substitution expert. Suggest a replacement meal that:
- Has similar macros (within 10% of the original)
- Respects the user's dietary restrictions
- Is practical and easy to prepare
- Uses commonly available ingredients
- Addresses the user's reason for wanting a substitution`;

  const userPrompt = `Replace this meal with something better:

Original: ${meal.name} (${meal.meal_type})
Macros: ${meal.calories} cal | ${meal.protein_g}g P | ${meal.carbs_g}g C | ${meal.fat_g}g F
Ingredients: ${ingredientList}

Diet Type: ${preferences.diet_type}
Restrictions: ${preferences.dietary_restrictions.join(", ") || "None"}
${reason ? `Reason for substitution: ${reason}` : "User wants variety"}`;

  const response = await client.responses.create({
    model: getTextModel(),
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    text: {
      format: zodTextFormat(mealSubstitutionSchema, "substitution"),
    },
  });

  return JSON.parse(response.output_text) as AIMealSubstitution;
}
