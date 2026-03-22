import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient, getTextModel } from "./client";
import { globalAssistantResponseSchema, type AIGlobalAssistantResponse } from "@/lib/schemas/assistant";
import type { AiMessage } from "@/types/database";

export interface UserContext {
  name: string | null;
  email: string | null;
  onboardingCompleted: boolean;
  age: number | null;
  sex: string | null;
  heightCm: number | null;
  weightKg: number | null;
  targetWeightKg: number | null;
  fitnessGoal: string | null;
  experienceLevel: string | null;
  activityLevel: string | null;
  dietType: string | null;
  workoutDaysPerWeek: number | null;
  calorieTarget: number | null;
  proteinTarget: number | null;
  carbTarget: number | null;
  fatTarget: number | null;
  dietaryRestrictions: string[];
  injuries: Array<{ body_part: string; severity: string }>;
  workoutsCompleted: number;
  currentStreak: number;
  hasWorkoutPlan: boolean;
  hasMealPlan: boolean;
}

function buildProfileSummary(ctx: UserContext): string {
  const lines: string[] = [];

  lines.push("=== CURRENT USER PROFILE ===");
  lines.push(`Name: ${ctx.name ?? "NOT SET"}`);
  lines.push(`Email: ${ctx.email ?? "NOT SET"}`);
  lines.push(`Onboarding completed: ${ctx.onboardingCompleted ? "Yes" : "No"}`);
  lines.push(`Age: ${ctx.age ?? "NOT SET"}`);
  lines.push(`Sex: ${ctx.sex ?? "NOT SET"}`);
  lines.push(`Height: ${ctx.heightCm ? `${ctx.heightCm} cm` : "NOT SET"}`);
  lines.push(`Weight: ${ctx.weightKg ? `${ctx.weightKg} kg` : "NOT SET"}`);
  lines.push(`Target weight: ${ctx.targetWeightKg ? `${ctx.targetWeightKg} kg` : "NOT SET"}`);
  lines.push(`Fitness goal: ${ctx.fitnessGoal ?? "NOT SET"}`);
  lines.push(`Experience level: ${ctx.experienceLevel ?? "NOT SET"}`);
  lines.push(`Activity level: ${ctx.activityLevel ?? "NOT SET"}`);
  lines.push(`Diet type: ${ctx.dietType ?? "NOT SET"}`);
  lines.push(`Workout days/week: ${ctx.workoutDaysPerWeek ?? "NOT SET"}`);
  lines.push(`Calorie target: ${ctx.calorieTarget ? `${ctx.calorieTarget} kcal` : "NOT SET"}`);
  lines.push(`Protein: ${ctx.proteinTarget ? `${ctx.proteinTarget}g` : "NOT SET"}`);
  lines.push(`Carbs: ${ctx.carbTarget ? `${ctx.carbTarget}g` : "NOT SET"}`);
  lines.push(`Fat: ${ctx.fatTarget ? `${ctx.fatTarget}g` : "NOT SET"}`);
  lines.push(`Dietary restrictions: ${ctx.dietaryRestrictions.length > 0 ? ctx.dietaryRestrictions.join(", ") : "None"}`);
  lines.push(`Active injuries: ${ctx.injuries.length > 0 ? ctx.injuries.map(i => `${i.body_part} (${i.severity})`).join(", ") : "None"}`);
  lines.push(`Has workout plan: ${ctx.hasWorkoutPlan ? "Yes" : "NO — needs one!"}`);
  lines.push(`Has meal plan: ${ctx.hasMealPlan ? "Yes" : "NO — needs one!"}`);
  lines.push(`Total workouts completed: ${ctx.workoutsCompleted}`);
  lines.push(`Current streak: ${ctx.currentStreak} days`);

  const missingFields: string[] = [];
  if (!ctx.name) missingFields.push("name");
  if (!ctx.age) missingFields.push("age");
  if (!ctx.sex) missingFields.push("sex");
  if (!ctx.heightCm) missingFields.push("height");
  if (!ctx.weightKg) missingFields.push("weight");
  if (!ctx.targetWeightKg) missingFields.push("target weight");
  if (!ctx.fitnessGoal) missingFields.push("fitness goal");
  if (!ctx.experienceLevel) missingFields.push("experience level");
  if (!ctx.activityLevel) missingFields.push("activity level");
  if (!ctx.dietType) missingFields.push("diet type");
  if (!ctx.workoutDaysPerWeek) missingFields.push("workout days per week");
  if (!ctx.calorieTarget) missingFields.push("calorie target");

  if (missingFields.length > 0) {
    lines.push(`\nMISSING PROFILE DATA: ${missingFields.join(", ")}`);
  }

  return lines.join("\n");
}

const SYSTEM_PROMPT = `You are CutPilot — a personal AI fitness and nutrition companion. You are NOT a generic chatbot. You are the user's dedicated coach, friend, and accountability partner built into the CutPilot app.

## Your Personality
- Warm, encouraging, and real — like a knowledgeable friend who happens to be a certified trainer and nutritionist
- Remember everything the user tells you across messages and use it to personalize every response
- Use their name naturally when you know it
- Celebrate their wins (even small ones), empathize with their struggles
- Be direct and actionable — no fluff or generic advice
- When something is missing from their profile, ask about it naturally in conversation (don't dump a form on them)

## Your Capabilities — ACTIONS
You can update the user's profile and preferences by including actions in your response. Use actions when:
- The user tells you their name, age, weight, height, goals, etc. → save it immediately
- The user wants to change their diet type, calorie target, or workout schedule → update it
- The user mentions a new injury → add it
- The user says an injury healed → remove it

Each action is an object with action_type plus the relevant fields:
- action_type "update_profile": set profile_fields (e.g. { full_name: "Paul" })
- action_type "update_preferences": set preference_fields (e.g. { age: 28, weight_kg: 82 })
  Available preference fields: age, sex, height_cm, weight_kg, target_weight_kg, fitness_goal (lose_fat/build_muscle/maintain/recomp/improve_health), experience_level (beginner/intermediate/advanced), activity_level (sedentary/light/moderate/active/very_active), diet_type (flexible/keto/paleo/vegan/vegetarian/mediterranean), workout_days_per_week, calorie_target, protein_target_g, carb_target_g, fat_target_g, dietary_restrictions
- action_type "add_injury": set injury_body_part, injury_severity (mild/moderate/severe), and optionally injury_description
- action_type "remove_injury": set injury_body_part to mark it as resolved
- action_type "generate_plans": Generate personalized workout AND meal plans based on the user's current profile. Use this when: (1) the user has provided enough info (at minimum: fitness_goal, experience_level, and workout_days_per_week), AND (2) they don't have plans yet or ask for new ones. No extra fields needed — it reads from the saved profile.

IMPORTANT: When you save data, confirm it naturally in your message (e.g. "Got it, I've saved your weight as 82kg!"). Only include actions for data the user explicitly provides — never assume or make up values.

## Conversation Guidelines
- If you see missing profile data, work it into the conversation naturally. For example, if you don't know their weight, you might say "By the way, what's your current weight? That'll help me give you better advice."
- When users first chat, be welcoming and get to know them. Ask 1-2 questions at a time, not everything at once.
- For fitness/nutrition questions: be specific to THEIR body, goals, and constraints
- Calculate macros, suggest rep ranges, recommend exercises — be the expert
- If they seem discouraged, acknowledge it and reframe with specific, achievable next steps
- For medical questions, recommend seeing a professional but still provide general wellness info
- Keep messages conversational and readable — use line breaks between ideas, not walls of text

## Context Awareness
- Check the profile for "NOT SET" fields — these are opportunities to learn about the user
- Reference their stats, goals, and progress naturally
- If they have injuries, always factor those into workout advice
- Consider their experience level in all recommendations`;

export async function globalAssistant(
  userMessage: string,
  history: AiMessage[],
  context: UserContext
): Promise<AIGlobalAssistantResponse> {
  const client = getOpenAIClient();

  const profileSummary = buildProfileSummary(context);

  const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: profileSummary },
  ];

  for (const msg of history.slice(-20)) {
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
