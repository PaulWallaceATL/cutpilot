import { z } from "zod";

export const assistantResponseSchema = z.object({
  message: z.string().describe("The assistant's response message"),
  suggestions: z.array(z.string()).nullable().optional().describe("Optional follow-up suggestions"),
});

export const workoutAssistantResponseSchema = z.object({
  message: z.string().describe("The assistant's response about the workout"),
  exercise_modifications: z.array(
    z.object({
      exercise_name: z.string(),
      modification: z.string(),
      reason: z.string(),
    })
  ).nullable().optional().describe("Optional exercise modifications"),
  suggestions: z.array(z.string()).nullable().optional(),
});

export const mealAssistantResponseSchema = z.object({
  message: z.string().describe("The assistant's response about the meal"),
  nutrition_tips: z.array(z.string()).nullable().optional().describe("Optional nutrition tips"),
  suggestions: z.array(z.string()).nullable().optional(),
});

export type AIAssistantResponse = z.infer<typeof assistantResponseSchema>;
export type AIWorkoutAssistantResponse = z.infer<typeof workoutAssistantResponseSchema>;
export type AIMealAssistantResponse = z.infer<typeof mealAssistantResponseSchema>;
