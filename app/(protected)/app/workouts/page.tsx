import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Dumbbell, ChevronRight } from "lucide-react";

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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
          <div className="relative">
            <h1 className="text-3xl font-bold tracking-tight font-heading">Workouts</h1>
            <p className="mt-1 text-muted-foreground">Your training plan</p>
          </div>
        </div>
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
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight font-heading">Workouts</h1>
          <p className="mt-1 text-muted-foreground">{plan.name}</p>
        </div>
      </div>

      <div className="space-y-3">
        {days?.map((day) => (
          <Link key={day.id} href={`/app/workouts/${day.id}`} className="group block">
            <Card className="w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 border-border/50">
              <CardContent className="flex items-center justify-between p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-sm">
                    <span className="text-sm font-bold text-primary-foreground">
                      D{day.day_number}
                    </span>
                  </div>
                  <div>
                    <CardHeader className="p-0">
                      <CardTitle className="text-base font-semibold">{day.name}</CardTitle>
                    </CardHeader>
                    <div className="flex items-center gap-2 mt-1.5">
                      {day.focus && (
                        <Badge variant="secondary" className="text-xs font-medium">
                          {day.focus}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {day.workout_exercises?.[0]?.count ?? 0} exercises
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
