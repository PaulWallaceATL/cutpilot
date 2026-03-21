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
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-3">
            <UtensilsCrossed className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">No meal plan yet</p>
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
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-3">
            <UtensilsCrossed className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">No meals for today</p>
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
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/8 to-transparent pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
            </div>
            Today&apos;s Meals
          </CardTitle>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary tabular-nums">
            {mealDay.total_calories} cal
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-1.5">
          {meals.map((meal) => (
            <Link
              key={meal.id}
              href={`/app/meals/${meal.id}`}
              className="group flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200 hover:bg-muted/50 hover:shadow-sm hover:border-primary/20"
            >
              <div>
                <p className="text-sm font-medium transition-colors group-hover:text-primary">
                  {meal.name}
                </p>
                <p className="text-xs capitalize text-muted-foreground">
                  {meal.meal_type}
                </p>
              </div>
              <div className="text-right text-xs tabular-nums text-muted-foreground">
                <div className="font-medium">{meal.calories} cal</div>
                <div>{meal.protein_g}g protein</div>
              </div>
            </Link>
          ))}
        </div>
        <Link
          href="/app/meals"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/10 hover:border-primary/30"
        >
          View All Meals
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
