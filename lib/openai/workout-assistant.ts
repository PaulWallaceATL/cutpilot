import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient, getTextModel } from "./client";
import {
  workoutAssistantResponseSchema,
  type AIWorkoutAssistantResponse,
} from "@/lib/schemas/assistant";
import type { WorkoutDayWithExercises, AiMessage } from "@/types/database";

export async function contextualWorkoutAssistant(
  workout: WorkoutDayWithExercises,
  userMessage: string,
  history: AiMessage[]
): Promise<AIWorkoutAssistantResponse> {
  const client = getOpenAIClient();

  const exerciseList = workout.workout_exercises
    .map(
      (e, i) =>
        `${i + 1}. ${e.name} - ${e.sets}x${e.reps} (${e.muscle_group})`
    )
    .join("\n");

  const systemPrompt = `You are CutPilot's workout assistant. The user is currently doing this workout:

Workout: ${workout.name}
Focus: ${workout.focus}
Exercises:
${exerciseList}

Help them with form tips, exercise modifications, weight suggestions, motivation, and any workout-related questions. Be concise and actionable. If suggesting exercise modifications, specify which exercise and why.`;

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
      format: zodTextFormat(workoutAssistantResponseSchema, "workout_response"),
    },
  });

  return JSON.parse(response.output_text) as AIWorkoutAssistantResponse;
}
