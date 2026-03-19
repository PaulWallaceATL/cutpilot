"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function generateGroceryList() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: mealPlan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!mealPlan) return { error: "No active meal plan" };

  const { data: meals } = await supabase
    .from("meals")
    .select("*, meal_ingredients(*), meal_days!inner(meal_plan_id)")
    .eq("meal_days.meal_plan_id", mealPlan.id);

  if (!meals || meals.length === 0) return { error: "No meals found" };

  const ingredientMap = new Map<
    string,
    { name: string; quantity: number; unit: string; category: string }
  >();

  for (const meal of meals) {
    for (const ing of meal.meal_ingredients) {
      const key = `${ing.name.toLowerCase()}-${ing.unit?.toLowerCase() || "unit"}`;
      const existing = ingredientMap.get(key);
      const qty = parseFloat(ing.amount) || 1;
      if (existing) {
        existing.quantity += qty;
      } else {
        ingredientMap.set(key, {
          name: ing.name,
          quantity: qty,
          unit: ing.unit || "",
          category: categorizeIngredient(ing.name),
        });
      }
    }
  }

  const { data: groceryList, error: glError } = await supabase
    .from("grocery_lists")
    .insert({
      user_id: user.id,
      meal_plan_id: mealPlan.id,
      name: "Weekly Groceries",
    })
    .select("id")
    .single();

  if (glError || !groceryList) return { error: "Failed to create list" };

  const items = Array.from(ingredientMap.values()).map((item) => ({
    user_id: user.id,
    grocery_list_id: groceryList.id,
    name: item.name,
    quantity: String(Math.ceil(item.quantity * 10) / 10),
    unit: item.unit,
    category: item.category,
    checked: false,
  }));

  await supabase.from("grocery_items").insert(items);

  revalidatePath("/app/grocery");
  return { success: true };
}

export async function toggleGroceryItem(itemId: string, checked: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("grocery_items")
    .update({ checked })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to update item" };
  return { success: true };
}

function categorizeIngredient(name: string): string {
  const lower = name.toLowerCase();
  const categories: Record<string, string[]> = {
    Protein: ["chicken", "beef", "fish", "salmon", "tuna", "shrimp", "turkey", "pork", "tofu", "egg", "whey", "protein"],
    Dairy: ["milk", "cheese", "yogurt", "butter", "cream"],
    Produce: ["lettuce", "tomato", "onion", "pepper", "broccoli", "spinach", "avocado", "banana", "apple", "berry", "fruit", "vegetable", "carrot", "garlic"],
    Grains: ["rice", "bread", "pasta", "oat", "quinoa", "tortilla", "wrap", "cereal"],
    Pantry: ["oil", "sauce", "spice", "salt", "pepper", "honey", "vinegar", "flour", "sugar"],
    Frozen: ["frozen"],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "Other";
}
