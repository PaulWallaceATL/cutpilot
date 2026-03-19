"use server";

import { createClient } from "@/lib/supabase/server";
import { contextualMealAssistant } from "@/lib/openai/meal-assistant";
import { mealSubstitutionAssistant } from "@/lib/openai/substitution";
import type { Meal, MealIngredient, UserPreferences } from "@/types/database";

export async function logMeal(mealId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("meal_logs").insert({
    user_id: user.id,
    meal_id: mealId,
    date: new Date().toISOString().split("T")[0],
    completed: true,
  });

  if (error) return { error: "Failed to log meal" };
  return { success: true };
}

export async function askMealAssistant(mealId: string, message: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: meal } = await supabase
    .from("meals")
    .select("*, meal_ingredients(*)")
    .eq("id", mealId)
    .single();

  if (!meal) return { error: "Meal not found" };

  let { data: thread } = await supabase
    .from("ai_threads")
    .select("*")
    .eq("user_id", user.id)
    .eq("context_type", "meal")
    .eq("context_id", mealId)
    .single();

  if (!thread) {
    const { data: newThread } = await supabase
      .from("ai_threads")
      .insert({
        user_id: user.id,
        context_type: "meal",
        context_id: mealId,
        title: `Meal: ${meal.name}`,
      })
      .select("*")
      .single();
    thread = newThread;
  }

  if (!thread) return { error: "Failed to create thread" };

  await supabase.from("ai_messages").insert({
    user_id: user.id,
    thread_id: thread.id,
    role: "user",
    content: message,
  });

  const { data: history } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true });

  const response = await contextualMealAssistant(
    meal as Meal & { meal_ingredients: MealIngredient[] },
    message,
    history || []
  );

  await supabase.from("ai_messages").insert({
    user_id: user.id,
    thread_id: thread.id,
    role: "assistant",
    content: response.message,
  });

  return { data: response };
}

export async function requestSubstitution(mealId: string, reason?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: meal } = await supabase
    .from("meals")
    .select("*, meal_ingredients(*)")
    .eq("id", mealId)
    .single();

  if (!meal) return { error: "Meal not found" };

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!prefs) return { error: "Preferences not found" };

  const substitution = await mealSubstitutionAssistant(
    meal as Meal & { meal_ingredients: MealIngredient[] },
    prefs as UserPreferences,
    reason
  );

  const { data: newMeal, error: mealError } = await supabase
    .from("meals")
    .update({
      name: substitution.substitute.name,
      description: substitution.substitute.description,
      calories: substitution.substitute.calories,
      protein_g: substitution.substitute.protein_g,
      carbs_g: substitution.substitute.carbs_g,
      fat_g: substitution.substitute.fat_g,
      prep_time_minutes: substitution.substitute.prep_time_minutes,
    })
    .eq("id", mealId)
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (mealError || !newMeal) return { error: "Failed to update meal" };

  await supabase
    .from("meal_ingredients")
    .delete()
    .eq("meal_id", mealId);

  const ingredients = substitution.substitute.ingredients.map((ing, idx) => ({
    user_id: user.id,
    meal_id: mealId,
    name: ing.name,
    amount: ing.amount,
    unit: ing.unit,
    calories: ing.calories,
    protein_g: ing.protein_g,
    carbs_g: ing.carbs_g,
    fat_g: ing.fat_g,
    order_index: idx,
  }));

  await supabase.from("meal_ingredients").insert(ingredients);

  return { data: substitution };
}
