import { createClient } from "@/lib/supabase/server";
import { getOrCreateDailyChecklist } from "@/actions/checklist";
import { ChecklistCard } from "./checklist-card";
import { TodayWorkout } from "./today-workout";
import { TodayMeals } from "./today-meals";
import { StatCard } from "@/components/shared/stat-card";
import { Flame, Target, Dumbbell, UtensilsCrossed, Sparkles } from "lucide-react";

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

  const completedItems =
    checklist?.checklist_items?.filter(
      (item: { completed: boolean }) => item.completed
    ).length ?? 0;
  const totalItems = checklist?.checklist_items?.length ?? 0;

  const focusLine = todayFocusLine({
    completedItems,
    totalItems,
    mealsToday: mealsToday ?? 0,
    workoutsThisWeek: workoutsThisWeek ?? 0,
    calorieTarget: prefs?.calorie_target,
  });

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/[0.12] via-card/80 to-primary/[0.04] p-6 shadow-soft backdrop-blur-sm sm:p-8">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/8 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, oklch(0.72 0.14 155 / 0.2) 0%, transparent 45%),
              radial-gradient(circle at 80% 70%, oklch(0.65 0.1 155 / 0.12) 0%, transparent 40%)`,
          }}
          aria-hidden
        />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-widest text-primary/80">
            Today
          </p>
          <h1 className="text-page-title mt-1">Your day at a glance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="mt-5 flex gap-3 rounded-xl border border-border/50 bg-background/55 px-4 py-3 shadow-soft backdrop-blur-md dark:bg-background/40">
            <Sparkles
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              aria-hidden
            />
            <p className="text-sm leading-relaxed text-foreground/90">
              {focusLine}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard
          icon={Target}
          label="Daily goal"
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
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {checklist && <ChecklistCard checklist={checklist} />}

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
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

function todayFocusLine(opts: {
  completedItems: number;
  totalItems: number;
  mealsToday: number;
  workoutsThisWeek: number;
  calorieTarget: number | null | undefined;
}): string {
  const {
    completedItems,
    totalItems,
    mealsToday,
    workoutsThisWeek,
    calorieTarget,
  } = opts;

  if (totalItems === 0) {
    return "Add a few checklist items to anchor your day — small tasks make wins feel inevitable.";
  }
  if (completedItems < totalItems) {
    const left = totalItems - completedItems;
    return `${left} checklist item${left === 1 ? "" : "s"} left — clear them when you have a short window.`;
  }
  if (totalItems > 0 && completedItems === totalItems) {
    if (mealsToday === 0 && calorieTarget != null) {
      return "Checklist complete — log meals to stay aligned with your calorie target.";
    }
    if (workoutsThisWeek === 0) {
      return "Checklist complete — a workout this week will keep momentum on your side.";
    }
    return "Checklist complete. Carry that energy into your next meal or training block.";
  }
  return "Keep stacking habits: move with intent, fuel consistently, and protect recovery.";
}
