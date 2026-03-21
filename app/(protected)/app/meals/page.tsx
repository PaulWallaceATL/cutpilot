import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { UtensilsCrossed, ChevronRight } from "lucide-react";

export default async function MealsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: plan } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!plan) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
          <div className="relative">
            <h1 className="text-3xl font-bold tracking-tight font-heading">Meals</h1>
            <p className="mt-1 text-muted-foreground">Your nutrition plan</p>
          </div>
        </div>
        <EmptyState
          icon={UtensilsCrossed}
          title="No Meal Plan"
          description="Complete onboarding or generate a new plan to get started."
        />
      </div>
    );
  }

  const { data: days } = await supabase
    .from("meal_days")
    .select("*, meals(id, name, meal_type, calories, protein_g)")
    .eq("meal_plan_id", plan.id)
    .order("day_number");

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight font-heading">Meals</h1>
          <p className="mt-1 text-muted-foreground">{plan.name}</p>
        </div>
      </div>

      <div className="space-y-4">
        {days?.map((day) => {
          const meals = (day.meals || []) as Array<{
            id: string;
            name: string;
            meal_type: string;
            calories: number;
            protein_g: number;
          }>;

          return (
            <Card key={day.id} className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 border-border/50 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-sm">
                      <span className="text-xs font-bold text-primary-foreground">
                        D{day.day_number}
                      </span>
                    </div>
                    <CardTitle className="text-base font-semibold">Day {day.day_number}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs font-medium">
                    {day.total_calories} cal
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {meals.map((meal) => (
                  <Link key={meal.id} href={`/app/meals/${meal.id}`} className="group block">
                    <div className="flex items-center justify-between rounded-xl border border-border/50 p-3.5 transition-all duration-200 hover:bg-muted/50 hover:border-primary/20 hover:shadow-sm">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs capitalize shrink-0 bg-background">
                          {meal.meal_type}
                        </Badge>
                        <span className="text-sm font-medium">{meal.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {meal.calories} cal · {meal.protein_g}g P
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
