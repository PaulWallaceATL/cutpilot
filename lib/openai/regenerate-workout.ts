import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient, getTextModel } from "./client";
import { workoutPlanSchema, type AIWorkoutPlan } from "@/lib/schemas/workout";
import type { UserPreferences, Injury } from "@/types/database";

export async function regenerateWorkoutPlan(
  preferences: UserPreferences,
  injuries: Injury[],
  feedback?: string
): Promise<AIWorkoutPlan> {
  const client = getOpenAIClient();

  const systemPrompt = `You are CutPilot, an expert fitness coach. Generate a new workout plan based on the user's profile and any feedback they've provided about their previous plan.

Rules:
- Create a safe, progressive, and effective program
- Respect all injuries and limitations
- Match available equipment
- Vary exercises from common defaults to keep things fresh`;

  const userPrompt = `Generate a new workout plan:

Goals: ${preferences.fitness_goal}
Experience: ${preferences.experience_level}
Schedule: ${preferences.workout_days_per_week} days/week, ${preferences.workout_duration_minutes} min/session
Equipment: ${preferences.available_equipment.join(", ") || "Bodyweight only"}
Injuries: ${injuries.filter((i) => i.is_active).map((i) => `${i.body_part} (${i.severity})`).join("; ") || "None"}
${feedback ? `\nUser feedback on previous plan: ${feedback}` : ""}`;

  const response = await client.responses.create({
    model: getTextModel(),
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    text: {
      format: zodTextFormat(workoutPlanSchema, "workout_plan"),
    },
  });

  return JSON.parse(response.output_text) as AIWorkoutPlan;
}
