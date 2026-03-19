import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient, getTextModel } from "./client";
import {
  mealAssistantResponseSchema,
  type AIMealAssistantResponse,
} from "@/lib/schemas/assistant";
import type { Meal, MealIngredient, AiMessage } from "@/types/database";

export async function contextualMealAssistant(
  meal: Meal & { meal_ingredients: MealIngredient[] },
  userMessage: string,
  history: AiMessage[]
): Promise<AIMealAssistantResponse> {
  const client = getOpenAIClient();

  const ingredientList = meal.meal_ingredients
    .map((i) => `- ${i.name}: ${i.amount} ${i.unit} (${i.calories} cal)`)
    .join("\n");

  const systemPrompt = `You are CutPilot's nutrition assistant. The user is looking at this meal:

Meal: ${meal.name} (${meal.meal_type})
Description: ${meal.description}
Macros: ${meal.calories} cal | ${meal.protein_g}g protein | ${meal.carbs_g}g carbs | ${meal.fat_g}g fat
Prep Time: ${meal.prep_time_minutes} minutes

Ingredients:
${ingredientList}

Help with cooking tips, ingredient questions, portion adjustments, and nutrition advice. Be concise and practical.`;

  const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  for (const msg of history.slice(-10)) {
    messages.push({ role: msg.role, content: msg.content });
  }
  messages.push({ role: "user", content: userMessage });

  const response = await client.responses.create({
    model: getTextModel(),
    input: messages,
    text: {
      format: zodTextFormat(mealAssistantResponseSchema, "meal_response"),
    },
  });

  return JSON.parse(response.output_text) as AIMealAssistantResponse;
}
