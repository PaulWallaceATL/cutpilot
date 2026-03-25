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
      <Card variant="glass" className="overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-2xl bg-muted/60 p-4 ring-1 ring-border/40">
            <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">No meal plan yet</p>
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
      <Card variant="glass" className="overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-2xl bg-muted/60 p-4 ring-1 ring-border/40">
            <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No meals for today
          </p>
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
    <Card
      variant="elevated"
      className="overflow-hidden transition-[box-shadow,transform] duration-200 hover:-translate-y-px"
    >
      <CardHeader className="border-b border-border/40 bg-gradient-to-r from-primary/[0.07] to-transparent pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-section-title flex items-center gap-2 text-base">
            <div className="rounded-xl bg-primary/12 p-1.5 ring-1 ring-primary/15">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
            </div>
            Today&apos;s meals
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
              className="group flex items-center justify-between rounded-xl border border-border/50 bg-background/30 p-3.5 transition-[background-color,box-shadow,border-color] duration-200 hover:border-primary/20 hover:bg-muted/40 hover:shadow-soft"
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
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/8 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/12"
        >
          View all meals
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
