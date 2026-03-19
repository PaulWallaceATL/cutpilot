import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, ArrowRight } from "lucide-react";

export async function TodayMeals({ userId }: { userId: string }) {
  const supabase = await createClient();

  const { data: plan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .single();

  if (!plan) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <UtensilsCrossed className="h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">No meal plan yet</p>
        </CardContent>
      </Card>
    );
  }

  const dayOfWeek = new Date().getDay() || 7;

  const { data: mealDay } = await supabase
    .from("meal_days")
    .select("*, meals(*)")
    .eq("meal_plan_id", plan.id)
    .eq("day_number", dayOfWeek)
    .single();

  if (!mealDay) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <UtensilsCrossed className="h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">No meals for today</p>
        </CardContent>
      </Card>
    );
  }

  const meals = (mealDay.meals || []) as Array<{
    id: string;
    name: string;
    meal_type: string;
    calories: number;
    protein_g: number;
  }>;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Today&apos;s Meals
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {mealDay.total_calories} cal
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {meals.map((meal) => (
            <Link
              key={meal.id}
              href={`/app/meals/${meal.id}`}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="text-sm font-medium">{meal.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {meal.meal_type}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>{meal.calories} cal</div>
                <div>{meal.protein_g}g protein</div>
              </div>
            </Link>
          ))}
        </div>
        <Link
          href="/app/meals"
          className="mt-4 w-full inline-flex items-center justify-center rounded-lg border border-border bg-background px-2.5 h-8 text-sm font-medium hover:bg-muted transition-all"
        >
          View All Meals
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
