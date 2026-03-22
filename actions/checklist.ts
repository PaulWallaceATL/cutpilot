"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getOrCreateDailyChecklist() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const today = new Date().toISOString().split("T")[0];

  let { data: checklist } = await supabase
    .from("daily_checklists")
    .select("*, checklist_items(*)")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  if (!checklist) {
    const { data: newChecklist, error } = await supabase
      .from("daily_checklists")
      .insert({ user_id: user.id, date: today })
      .select("id")
      .single();

    if (error || !newChecklist) return { error: "Failed to create checklist" };

    const { data: workoutPlan } = await supabase
      .from("workout_plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    const dayOfWeek = new Date().getDay() || 7;

    const items: Array<{
      user_id: string;
      checklist_id: string;
      title: string;
      item_type: string;
      reference_id?: string;
      order_index: number;
    }> = [];

    if (workoutPlan) {
      const { data: workoutDay } = await supabase
        .from("workout_days")
        .select("id, name")
        .eq("workout_plan_id", workoutPlan.id)
        .eq("day_number", dayOfWeek)
        .single();

      if (workoutDay) {
        items.push({
          user_id: user.id,
          checklist_id: newChecklist.id,
          title: `Complete workout: ${workoutDay.name}`,
          item_type: "workout",
          reference_id: workoutDay.id,
          order_index: 0,
        });
      }
    }

    const { data: mealPlan } = await supabase
      .from("meal_plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (mealPlan) {
      const { data: mealDay } = await supabase
        .from("meal_days")
        .select("id, meals(id, name, meal_type)")
        .eq("meal_plan_id", mealPlan.id)
        .eq("day_number", dayOfWeek)
        .single();

      if (mealDay?.meals) {
        const mealArray = Array.isArray(mealDay.meals) ? mealDay.meals : [mealDay.meals];
        mealArray.forEach(
          (
            meal: { id: string; name: string; meal_type: string },
            idx: number
          ) => {
            items.push({
              user_id: user.id,
              checklist_id: newChecklist.id,
              title: `${meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}: ${meal.name}`,
              item_type: "meal",
              reference_id: meal.id,
              order_index: items.length + idx,
            });
          }
        );
      }
    }

    items.push(
      {
        user_id: user.id,
        checklist_id: newChecklist.id,
        title: "Drink 8 glasses of water",
        item_type: "water",
        order_index: items.length,
      },
      {
        user_id: user.id,
        checklist_id: newChecklist.id,
        title: "Get 7-9 hours of sleep",
        item_type: "sleep",
        order_index: items.length + 1,
      }
    );

    if (items.length > 0) {
      await supabase.from("checklist_items").insert(items);
    }

    const { data: fullChecklist } = await supabase
      .from("daily_checklists")
      .select("*, checklist_items(*)")
      .eq("id", newChecklist.id)
      .single();

    checklist = fullChecklist;
  }

  return { data: checklist };
}

export async function addChecklistItem(title: string, itemType: string = "custom") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const today = new Date().toISOString().split("T")[0];

  let { data: checklist } = await supabase
    .from("daily_checklists")
    .select("id, checklist_items(order_index)")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  if (!checklist) {
    const { data: newChecklist } = await supabase
      .from("daily_checklists")
      .insert({ user_id: user.id, date: today })
      .select("id")
      .single();
    if (!newChecklist) return { error: "Failed to create checklist" };
    checklist = { id: newChecklist.id, checklist_items: [] };
  }

  const maxOrder = Array.isArray(checklist.checklist_items)
    ? Math.max(0, ...checklist.checklist_items.map((i: { order_index: number }) => i.order_index))
    : 0;

  const { error } = await supabase.from("checklist_items").insert({
    user_id: user.id,
    checklist_id: checklist.id,
    title,
    item_type: itemType,
    order_index: maxOrder + 1,
  });

  if (error) return { error: "Failed to add item" };

  revalidatePath("/app/today");
  return { success: true };
}

export async function deleteChecklistItem(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to delete item" };

  revalidatePath("/app/today");
  return { success: true };
}

export async function toggleChecklistItem(
  itemId: string,
  completed: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("checklist_items")
    .update({ completed })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to update item" };

  revalidatePath("/app/today");
  return { success: true };
}
