import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MealCard } from "@/components/meal/meal-card";
import { IngredientList } from "@/components/meal/ingredient-list";
import { MealChatPanel } from "@/components/meal/meal-chat";
import { SubstitutionDialog } from "@/components/meal/substitution-dialog";
import { MealLogButton } from "./meal-log-button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import type { Meal, MealIngredient } from "@/types/database";

export default async function MealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: meal } = await supabase
    .from("meals")
    .select("*, meal_ingredients(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!meal) notFound();

  const today = new Date().toISOString().split("T")[0];
  const { data: todayLog } = await supabase
    .from("meal_logs")
    .select("*")
    .eq("meal_id", id)
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  const { data: thread } = await supabase
    .from("ai_threads")
    .select("*")
    .eq("user_id", user.id)
    .eq("context_type", "meal")
    .eq("context_id", id)
    .single();

  let chatMessages: Array<{ id: string; role: "user" | "assistant"; content: string; thread_id: string; user_id: string; created_at: string }> = [];
  if (thread) {
    const { data } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("thread_id", thread.id)
      .order("created_at", { ascending: true });
    chatMessages = (data || []).map((m) => ({
      ...m,
      role: m.role as "user" | "assistant",
    }));
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative space-y-3">
          <Link
            href="/app/meals"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Meals
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">{meal.name}</h1>
            <SubstitutionDialog mealId={id} />
          </div>
          {meal.meal_type && (
            <Badge variant="secondary" className="capitalize font-medium">{meal.meal_type}</Badge>
          )}
        </div>
      </div>

      <MealCard meal={meal as Meal} />

      <IngredientList
        ingredients={(meal.meal_ingredients || []) as MealIngredient[]}
      />

      <MealLogButton mealId={id} isLogged={!!todayLog} />

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div>
        <h2 className="text-lg font-semibold font-heading mb-3">AI Assistant</h2>
        <MealChatPanel mealId={id} initialMessages={chatMessages} />
      </div>
    </div>
  );
}
