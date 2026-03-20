import { createClient } from "@/lib/supabase/server";
import { getOrCreateDailyChecklist } from "@/actions/checklist";
import { ChecklistCard } from "./checklist-card";
import { TodayWorkout } from "./today-workout";
import { TodayMeals } from "./today-meals";
import { StatCard } from "@/components/shared/stat-card";
import { Flame, Target, Dumbbell, UtensilsCrossed } from "lucide-react";
import { StaggeredText } from "@/components/react-bits/staggered-text";
import { AnimatedList } from "@/components/react-bits/animated-list";

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const checklistResult = await getOrCreateDailyChecklist();
  const checklist = checklistResult?.data;

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const today = new Date().toISOString().split("T")[0];

  const { count: workoutsThisWeek } = await supabase
    .from("workout_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", true)
    .gte("date", getStartOfWeek());

  const { count: mealsToday } = await supabase
    .from("meal_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", true)
    .eq("date", today);

  const completedItems = checklist?.checklist_items?.filter(
    (item: { completed: boolean }) => item.completed
  ).length ?? 0;
  const totalItems = checklist?.checklist_items?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          <StaggeredText text="Today" as="span" />
        </h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <AnimatedList className="grid grid-cols-2 gap-3 sm:grid-cols-4" animation="fade" staggerDelay={100}>
        <StatCard
          icon={Target}
          label="Daily Goal"
          value={`${completedItems}/${totalItems}`}
          subtitle="tasks done"
        />
        <StatCard
          icon={Flame}
          label="Calories"
          value={prefs?.calorie_target ?? "—"}
          subtitle="daily target"
        />
        <StatCard
          icon={Dumbbell}
          label="Workouts"
          value={workoutsThisWeek ?? 0}
          subtitle="this week"
        />
        <StatCard
          icon={UtensilsCrossed}
          label="Meals"
          value={mealsToday ?? 0}
          subtitle="logged today"
        />
      </AnimatedList>

      {checklist && <ChecklistCard checklist={checklist} />}

      <div className="grid gap-4 md:grid-cols-2">
        <TodayWorkout userId={user.id} />
        <TodayMeals userId={user.id} />
      </div>
    </div>
  );
}

function getStartOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split("T")[0];
}
