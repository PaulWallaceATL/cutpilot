"use server";

import { createClient } from "@/lib/supabase/server";
import { regenerateWorkoutPlan } from "@/lib/openai/regenerate-workout";
import { regenerateMealPlan } from "@/lib/openai/regenerate-meal";
import type { UserPreferences, Injury } from "@/types/database";
import { revalidatePath } from "next/cache";

export async function regenerateWorkout(feedback?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!prefs) return { error: "Preferences not found" };

  const { data: injuries } = await supabase
    .from("injuries")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true);

  await supabase
    .from("workout_plans")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("is_active", true);

  const plan = await regenerateWorkoutPlan(
    prefs as UserPreferences,
    (injuries || []) as Injury[],
    feedback
  );

  const { data: workoutPlan, error: wpError } = await supabase
    .from("workout_plans")
    .insert({
      user_id: user.id,
      name: plan.name,
      description: plan.description,
      weeks: plan.weeks,
      days_per_week: plan.days_per_week,
      is_active: true,
    })
    .select("id")
    .single();

  if (wpError || !workoutPlan) return { error: "Failed to save plan" };

  for (const day of plan.days) {
    const { data: wDay } = await supabase
      .from("workout_days")
      .insert({
        user_id: user.id,
        workout_plan_id: workoutPlan.id,
        day_number: day.day_number,
        name: day.name,
        focus: day.focus,
      })
      .select("id")
      .single();

    if (!wDay) continue;

    const exercises = day.exercises.map((ex, idx) => ({
      user_id: user.id,
      workout_day_id: wDay.id,
      order_index: idx,
      name: ex.name,
      muscle_group: ex.muscle_group,
      sets: ex.sets,
      reps: ex.reps,
      rest_seconds: ex.rest_seconds,
      weight_suggestion: ex.weight_suggestion || null,
      notes: ex.notes || null,
    }));

    await supabase.from("workout_exercises").insert(exercises);
  }

  revalidatePath("/app/workouts");
  return { success: true };
}

export async function regenerateMeal(feedback?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!prefs) return { error: "Preferences not found" };

  await supabase
    .from("meal_plans")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("is_active", true);

  const plan = await regenerateMealPlan(prefs as UserPreferences, feedback);

  const { data: mealPlan, error: mpError } = await supabase
    .from("meal_plans")
    .insert({
      user_id: user.id,
      name: plan.name,
      description: plan.description,
      daily_calories: plan.daily_calories,
      protein_g: plan.protein_g,
      carbs_g: plan.carbs_g,
      fat_g: plan.fat_g,
      is_active: true,
    })
    .select("id")
    .single();

  if (mpError || !mealPlan) return { error: "Failed to save plan" };

  for (const day of plan.days) {
    const { data: mDay } = await supabase
      .from("meal_days")
      .insert({
        user_id: user.id,
        meal_plan_id: mealPlan.id,
        day_number: day.day_number,
        total_calories: day.total_calories,
        total_protein_g: day.total_protein_g,
        total_carbs_g: day.total_carbs_g,
        total_fat_g: day.total_fat_g,
      })
      .select("id")
      .single();

    if (!mDay) continue;

    for (let i = 0; i < day.meals.length; i++) {
      const meal = day.meals[i];
      const { data: mealRow } = await supabase
        .from("meals")
        .insert({
          user_id: user.id,
          meal_day_id: mDay.id,
          meal_type: meal.meal_type,
          name: meal.name,
          description: meal.description,
          calories: meal.calories,
          protein_g: meal.protein_g,
          carbs_g: meal.carbs_g,
          fat_g: meal.fat_g,
          prep_time_minutes: meal.prep_time_minutes,
          order_index: i,
        })
        .select("id")
        .single();

      if (!mealRow) continue;

      const ingredients = meal.ingredients.map((ing, idx) => ({
        user_id: user.id,
        meal_id: mealRow.id,
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
    }
  }

  revalidatePath("/app/meals");
  return { success: true };
}
