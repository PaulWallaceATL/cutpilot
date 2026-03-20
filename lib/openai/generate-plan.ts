import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient, getTextModel } from "./client";
import { initialPlanSchema, type AIInitialPlan } from "@/lib/schemas/plan";
import type { OnboardingFormData } from "@/lib/schemas/onboarding";

export async function generateInitialPlan(
  data: OnboardingFormData
): Promise<AIInitialPlan> {
  const client = getOpenAIClient();

  const systemPrompt = `You are CutPilot, an expert fitness and nutrition coach. Generate a complete, personalized workout and meal plan based on the user's profile.

Rules:
- Create realistic, safe, and effective plans
- Consider injuries and limitations
- Match the user's equipment availability
- Respect dietary restrictions
- Provide accurate macro calculations
- Workout days should match the requested frequency
- Meal days should cover 7 days
- Each meal day should have the requested number of meals
- Keep meals practical and easy to prepare
- Use common, accessible ingredients`;

  const userPrompt = `Create a complete fitness and nutrition plan for this user:

Goals: ${data.fitness_goal}
Experience: ${data.experience_level}
Age: ${data.age}, Sex: ${data.sex}
Height: ${data.height_cm}cm, Weight: ${data.weight_kg}kg, Target: ${data.target_weight_kg}kg
Activity Level: ${data.activity_level}
Workout Schedule: ${data.workout_days_per_week} days/week, ${data.workout_duration_minutes} min/session
Equipment: ${data.available_equipment.join(", ") || "Bodyweight only"}
Diet Type: ${data.diet_type}
Dietary Restrictions: ${data.dietary_restrictions.join(", ") || "None"}
Meals Per Day: ${data.meals_per_day}
Injuries: ${data.injuries.length > 0 ? data.injuries.map((i) => `${i.body_part} (${i.severity}): ${i.description || "no details"}`).join("; ") : "None"}

Generate a complete workout plan with ${data.workout_days_per_week} training days and a 7-day meal plan with ${data.meals_per_day} meals per day.`;

  try {
    const response = await client.responses.create({
      model: getTextModel(),
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      text: {
        format: zodTextFormat(initialPlanSchema, "initial_plan"),
      },
    });

    return JSON.parse(response.output_text) as AIInitialPlan;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("timeout") || error.message.includes("TIMEOUT")) {
        throw new Error("Plan generation timed out. Please check your OpenAI API key and try again.");
      }
      if (error.message.includes("API key") || error.message.includes("authentication")) {
        throw new Error("Invalid OpenAI API key. Please check your environment variables.");
      }
      throw new Error(`Failed to generate plan: ${error.message}`);
    }
    throw error;
  }
}
