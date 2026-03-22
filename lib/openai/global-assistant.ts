import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient, getTextModel } from "./client";
import { globalAssistantResponseSchema, type AIGlobalAssistantResponse } from "@/lib/schemas/assistant";
import type { AiMessage } from "@/types/database";

interface UserContext {
  name: string | null;
  fitnessGoal: string | null;
  experienceLevel: string | null;
  dietType: string | null;
  calorieTarget: number | null;
  proteinTarget: number | null;
  carbTarget: number | null;
  fatTarget: number | null;
  currentWeight: number | null;
  targetWeight: number | null;
  workoutDaysPerWeek: number | null;
  injuries: string[];
}

export async function globalAssistant(
  userMessage: string,
  history: AiMessage[],
  context: UserContext
): Promise<AIGlobalAssistantResponse> {
  const client = getOpenAIClient();

  const contextLines: string[] = [];
  if (context.name) contextLines.push(`Name: ${context.name}`);
  if (context.fitnessGoal) contextLines.push(`Goal: ${context.fitnessGoal}`);
  if (context.experienceLevel) contextLines.push(`Experience: ${context.experienceLevel}`);
  if (context.dietType) contextLines.push(`Diet: ${context.dietType}`);
  if (context.calorieTarget) contextLines.push(`Daily calories: ${context.calorieTarget} kcal`);
  if (context.proteinTarget) contextLines.push(`Protein target: ${context.proteinTarget}g`);
  if (context.carbTarget) contextLines.push(`Carb target: ${context.carbTarget}g`);
  if (context.fatTarget) contextLines.push(`Fat target: ${context.fatTarget}g`);
  if (context.currentWeight) contextLines.push(`Current weight: ${context.currentWeight} kg`);
  if (context.targetWeight) contextLines.push(`Target weight: ${context.targetWeight} kg`);
  if (context.workoutDaysPerWeek) contextLines.push(`Workout days/week: ${context.workoutDaysPerWeek}`);
  if (context.injuries.length > 0) contextLines.push(`Active injuries: ${context.injuries.join(", ")}`);

  const systemPrompt = `You are CutPilot AI — a knowledgeable, encouraging fitness and nutrition assistant built into the CutPilot app. You help users with their complete health journey including workouts, nutrition, meal planning, progress tracking, motivation, and general wellness.

${contextLines.length > 0 ? `User Profile:\n${contextLines.join("\n")}` : ""}

Guidelines:
- Be concise, actionable, and supportive
- Personalize advice based on the user's goals, experience, and dietary preferences
- For workout questions: suggest form cues, progressions, alternatives for injuries
- For nutrition questions: consider their macro targets and diet type
- For motivation: be encouraging but authentic, reference their specific goals
- You can help with: workout form, exercise alternatives, meal ideas, macro calculations, progress interpretation, rest/recovery advice, supplement info, and general fitness questions
- Keep responses focused and practical — avoid walls of text
- If asked about medical conditions, recommend consulting a healthcare professional`;

  const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  for (const msg of history.slice(-12)) {
    messages.push({ role: msg.role, content: msg.content });
  }
  messages.push({ role: "user", content: userMessage });

  const response = await client.responses.create({
    model: getTextModel(),
    input: messages,
    text: {
      format: zodTextFormat(globalAssistantResponseSchema, "global_response"),
    },
  });

  return JSON.parse(response.output_text) as AIGlobalAssistantResponse;
}
