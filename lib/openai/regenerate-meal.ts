import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient, getTextModel } from "./client";
import { mealPlanSchema, type AIMealPlan } from "@/lib/schemas/meal";
import type { UserPreferences } from "@/types/database";

export async function regenerateMealPlan(
  preferences: UserPreferences,
  feedback?: string
): Promise<AIMealPlan> {
  const client = getOpenAIClient();

  const systemPrompt = `You are CutPilot, an expert nutritionist. Generate a new 7-day meal plan based on the user's dietary preferences and goals.

Rules:
- Meet the calorie and macro targets
- Respect all dietary restrictions
- Use practical, accessible ingredients
- Keep prep times reasonable
- Provide variety across the week
- Include accurate macro counts for every ingredient`;

  const userPrompt = `Generate a new 7-day meal plan:

Goals: ${preferences.fitness_goal}
Diet Type: ${preferences.diet_type}
Restrictions: ${preferences.dietary_restrictions.join(", ") || "None"}
Meals Per Day: ${preferences.meals_per_day}
Calorie Target: ${preferences.calorie_target || "Calculate based on goals"}
Protein Target: ${preferences.protein_target_g || "Calculate"}g
Carb Target: ${preferences.carb_target_g || "Calculate"}g
Fat Target: ${preferences.fat_target_g || "Calculate"}g
${feedback ? `\nUser feedback on previous plan: ${feedback}` : ""}`;

  const response = await client.responses.create({
    model: getTextModel(),
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    text: {
      format: zodTextFormat(mealPlanSchema, "meal_plan"),
    },
  });

  return JSON.parse(response.output_text) as AIMealPlan;
}
