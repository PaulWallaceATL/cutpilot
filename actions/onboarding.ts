"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { onboardingSchema, type OnboardingFormData } from "@/lib/schemas/onboarding";
import { generateInitialPlan } from "@/lib/openai/generate-plan";

export async function completeOnboarding(data: OnboardingFormData) {
  const parsed = onboardingSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { injuries, ...prefs } = parsed.data;

  const { error: prefError } = await supabase
    .from("user_preferences")
    .upsert({
      user_id: user.id,
      ...prefs,
    });

  if (prefError) {
    return { error: "Failed to save preferences" };
  }

  if (injuries.length > 0) {
    const { error: injError } = await supabase.from("injuries").insert(
      injuries.map((inj) => ({
        user_id: user.id,
        body_part: inj.body_part,
        description: inj.description || null,
        severity: inj.severity,
      }))
    );
    if (injError) {
      return { error: "Failed to save injuries" };
    }
  }

  let plan;
  try {
    plan = await generateInitialPlan(parsed.data);
  } catch {
    return { error: "Failed to generate plan. Please try again." };
  }

  const { error: prefUpdateError } = await supabase
    .from("user_preferences")
    .update({
      calorie_target: plan.calorie_target,
      protein_target_g: plan.protein_target_g,
      carb_target_g: plan.carb_target_g,
      fat_target_g: plan.fat_target_g,
    })
    .eq("user_id", user.id);

  if (prefUpdateError) {
    return { error: "Failed to update macro targets" };
  }

  const { data: workoutPlan, error: wpError } = await supabase
    .from("workout_plans")
    .insert({
      user_id: user.id,
      name: plan.workout_plan.name,
      description: plan.workout_plan.description,
      weeks: plan.workout_plan.weeks,
      days_per_week: plan.workout_plan.days_per_week,
      is_active: true,
    })
    .select("id")
    .single();

  if (wpError || !workoutPlan) {
    return { error: "Failed to save workout plan" };
  }

  for (const day of plan.workout_plan.days) {
    const { data: wDay, error: wdError } = await supabase
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

    if (wdError || !wDay) continue;

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

  const { data: mealPlan, error: mpError } = await supabase
    .from("meal_plans")
    .insert({
      user_id: user.id,
      name: plan.meal_plan.name,
      description: plan.meal_plan.description,
      daily_calories: plan.meal_plan.daily_calories,
      protein_g: plan.meal_plan.protein_g,
      carbs_g: plan.meal_plan.carbs_g,
      fat_g: plan.meal_plan.fat_g,
      is_active: true,
    })
    .select("id")
    .single();

  if (mpError || !mealPlan) {
    return { error: "Failed to save meal plan" };
  }

  for (const day of plan.meal_plan.days) {
    const { data: mDay, error: mdError } = await supabase
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

    if (mdError || !mDay) continue;

    for (let i = 0; i < day.meals.length; i++) {
      const meal = day.meals[i];
      const { data: mealRow, error: mError } = await supabase
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

      if (mError || !mealRow) continue;

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

  await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  redirect("/app/today");
}
