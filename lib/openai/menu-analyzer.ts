import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient, getVisionModel } from "./client";
import { menuAnalysisSchema, type AIMenuAnalysis } from "@/lib/schemas/menu";
import type { UserPreferences } from "@/types/database";

export async function menuImageAnalyzer(
  imageBase64: string,
  preferences?: UserPreferences | null
): Promise<AIMenuAnalysis> {
  const client = getOpenAIClient();

  const dietContext = preferences
    ? `\nUser's diet: ${preferences.diet_type}, Restrictions: ${preferences.dietary_restrictions.join(", ") || "None"}, Goal: ${preferences.fitness_goal}, Daily calories: ${preferences.calorie_target || "not set"}`
    : "";

  const systemPrompt = `You are CutPilot's menu analysis expert. Analyze the restaurant menu in the image and rank items from healthiest to least healthy.${dietContext}

For each item:
- Estimate calories and macros as accurately as possible
- Score health from 1-10 based on the user's goals
- Suggest modifications to make items healthier
- Consider portion sizes typical for restaurants`;

  const response = await client.responses.create({
    model: getVisionModel(),
    input: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Analyze this menu and recommend the healthiest options for my goals.",
          },
          {
            type: "input_image",
            image_url: `data:image/jpeg;base64,${imageBase64}`,
            detail: "high",
          },
        ],
      },
    ],
    text: {
      format: zodTextFormat(menuAnalysisSchema, "menu_analysis"),
    },
  });

  return JSON.parse(response.output_text) as AIMenuAnalysis;
}
