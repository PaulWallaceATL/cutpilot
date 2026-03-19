import { z } from "zod";

export const menuRecommendationSchema = z.object({
  item_name: z.string().describe("Name of the menu item"),
  health_score: z.number().min(1).max(10).describe("Health score from 1-10"),
  estimated_calories: z.number().describe("Estimated total calories"),
  estimated_protein_g: z.number().describe("Estimated protein in grams"),
  estimated_carbs_g: z.number().describe("Estimated carbs in grams"),
  estimated_fat_g: z.number().describe("Estimated fat in grams"),
  reasoning: z.string().describe("Why this item is recommended or not"),
  modifications: z.array(z.string()).describe("Suggested modifications to make it healthier"),
});

export const menuAnalysisSchema = z.object({
  restaurant_name: z.string().optional().describe("Detected restaurant name if visible"),
  summary: z.string().describe("Overall summary of the menu analysis"),
  recommendations: z.array(menuRecommendationSchema)
    .min(1)
    .max(10)
    .describe("Ranked menu items from healthiest to least healthy"),
});

export type AIMenuAnalysis = z.infer<typeof menuAnalysisSchema>;
export type AIMenuRecommendation = z.infer<typeof menuRecommendationSchema>;
