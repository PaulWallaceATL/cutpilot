import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { UtensilsCrossed, ChevronRight } from "lucide-react";
import { AnimatedCard, CardContent as AnimatedCardContent, CardHeader as AnimatedCardHeader, CardTitle as AnimatedCardTitle } from "@/components/react-bits/animated-card";
import { AnimatedList } from "@/components/react-bits/animated-list";
import { StaggeredText } from "@/components/react-bits/staggered-text";

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
        <h1 className="text-2xl font-bold">Meals</h1>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          <StaggeredText text="Meals" as="span" />
        </h1>
        <p className="text-muted-foreground">{plan.name}</p>
      </div>

      <AnimatedList className="space-y-4" animation="fade" staggerDelay={100}>
        {days?.map((day) => {
          const meals = (day.meals || []) as Array<{
            id: string;
            name: string;
            meal_type: string;
            calories: number;
            protein_g: number;
          }>;

          return (
            <AnimatedCard key={day.id} hoverEffect="glow">
              <AnimatedCardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <AnimatedCardTitle className="text-base">Day {day.day_number}</AnimatedCardTitle>
                  <span className="text-sm text-muted-foreground">
                    {day.total_calories} cal
                  </span>
                </div>
              </AnimatedCardHeader>
              <AnimatedCardContent className="space-y-2">
                {meals.map((meal) => (
                  <Link key={meal.id} href={`/app/meals/${meal.id}`}>
                    <div className="flex items-center justify-between rounded-lg border p-3 transition-all hover:bg-muted/50 hover:scale-[1.02]">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs capitalize">
                          {meal.meal_type}
                        </Badge>
                        <span className="text-sm font-medium">{meal.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {meal.calories} cal · {meal.protein_g}g P
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </AnimatedCardContent>
            </AnimatedCard>
          );
        })}
      </AnimatedList>
    </div>
  );
}
