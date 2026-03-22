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

const assistantActionSchema = z.object({
  action_type: z.enum(["update_profile", "update_preferences", "add_injury", "remove_injury", "generate_plans", "add_checklist_item"]).describe("The type of action to perform"),
  profile_fields: z.object({
    full_name: z.string().nullable().optional(),
  }).nullable().optional().describe("Only for update_profile actions"),
  preference_fields: z.object({
    age: z.number().nullable().optional(),
    sex: z.enum(["male", "female", "other"]).nullable().optional(),
    height_cm: z.number().nullable().optional(),
    weight_kg: z.number().nullable().optional(),
    target_weight_kg: z.number().nullable().optional(),
    fitness_goal: z.enum(["lose_fat", "build_muscle", "maintain", "recomp", "improve_health"]).nullable().optional(),
    experience_level: z.enum(["beginner", "intermediate", "advanced"]).nullable().optional(),
    activity_level: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).nullable().optional(),
    diet_type: z.enum(["flexible", "keto", "paleo", "vegan", "vegetarian", "mediterranean"]).nullable().optional(),
    workout_days_per_week: z.number().nullable().optional(),
    calorie_target: z.number().nullable().optional(),
    protein_target_g: z.number().nullable().optional(),
    carb_target_g: z.number().nullable().optional(),
    fat_target_g: z.number().nullable().optional(),
    dietary_restrictions: z.array(z.string()).nullable().optional(),
  }).nullable().optional().describe("Only for update_preferences actions"),
  injury_body_part: z.string().nullable().optional().describe("Body part for add_injury or remove_injury"),
  injury_severity: z.enum(["mild", "moderate", "severe"]).nullable().optional().describe("Severity for add_injury"),
  injury_description: z.string().nullable().optional().describe("Description for add_injury"),
  checklist_title: z.string().nullable().optional().describe("Title for add_checklist_item (e.g. 'Doctor appointment at 3pm')"),
  checklist_type: z.enum(["workout", "meal", "water", "sleep", "supplement", "custom"]).nullable().optional().describe("Category for add_checklist_item, default to custom"),
});

export const globalAssistantResponseSchema = z.object({
  message: z.string().describe("The assistant's conversational response to the user"),
  actions: z.array(assistantActionSchema).nullable().optional().describe("Actions to execute on the user's profile/preferences. Only include when the user explicitly provides info to save or asks to update something."),
  suggestions: z.array(z.string()).nullable().optional().describe("2-3 follow-up question suggestions to keep the conversation going"),
});

export type AssistantAction = z.infer<typeof assistantActionSchema>;
export type AIAssistantResponse = z.infer<typeof assistantResponseSchema>;
export type AIWorkoutAssistantResponse = z.infer<typeof workoutAssistantResponseSchema>;
export type AIMealAssistantResponse = z.infer<typeof mealAssistantResponseSchema>;
export type AIGlobalAssistantResponse = z.infer<typeof globalAssistantResponseSchema>;
