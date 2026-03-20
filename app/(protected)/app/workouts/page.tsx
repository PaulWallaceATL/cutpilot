import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Dumbbell, ChevronRight } from "lucide-react";
import { AnimatedCard, CardContent as AnimatedCardContent, CardHeader as AnimatedCardHeader, CardTitle as AnimatedCardTitle } from "@/components/react-bits/animated-card";
import { AnimatedList } from "@/components/react-bits/animated-list";
import { StaggeredText } from "@/components/react-bits/staggered-text";

export default async function WorkoutsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: plan } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!plan) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <EmptyState
          icon={Dumbbell}
          title="No Workout Plan"
          description="Complete onboarding or generate a new plan to get started."
        />
      </div>
    );
  }

  const { data: days } = await supabase
    .from("workout_days")
    .select("*, workout_exercises(count)")
    .eq("workout_plan_id", plan.id)
    .order("day_number");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          <StaggeredText text="Workouts" as="span" />
        </h1>
        <p className="text-muted-foreground">{plan.name}</p>
      </div>

      <AnimatedList className="space-y-3" animation="slide" staggerDelay={80}>
        {days?.map((day) => (
          <Link key={day.id} href={`/app/workouts/${day.id}`}>
            <AnimatedCard hoverEffect="lift" className="w-full">
              <AnimatedCardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-transform hover:scale-110">
                    <span className="text-sm font-bold text-primary">
                      D{day.day_number}
                    </span>
                  </div>
                  <div>
                    <AnimatedCardHeader className="p-0">
                      <AnimatedCardTitle className="text-base">{day.name}</AnimatedCardTitle>
                    </AnimatedCardHeader>
                    <div className="flex items-center gap-2 mt-1">
                      {day.focus && (
                        <Badge variant="secondary" className="text-xs">
                          {day.focus}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {day.workout_exercises?.[0]?.count ?? 0} exercises
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </AnimatedCardContent>
            </AnimatedCard>
          </Link>
        ))}
      </AnimatedList>
    </div>
  );
}
