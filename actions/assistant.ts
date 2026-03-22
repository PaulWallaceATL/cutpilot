"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { globalAssistant, type UserContext } from "@/lib/openai/global-assistant";
import { regenerateWorkout, regenerateMeal } from "@/actions/plan";
import { addChecklistItem } from "@/actions/checklist";
import type { AssistantAction } from "@/lib/schemas/assistant";

async function ensureRowsExist(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (!profile) {
    const { data: authUser } = await supabase.auth.getUser();
    await supabase.from("profiles").upsert({
      id: userId,
      email: authUser?.user?.email ?? null,
      onboarding_completed: false,
    }, { onConflict: "id" });
  }

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!prefs) {
    await supabase.from("user_preferences").insert({ user_id: userId });
  }
}

async function executeActions(
  userId: string,
  actions: AssistantAction[]
): Promise<string[]> {
  const supabase = await createClient();
  const log: string[] = [];

  await ensureRowsExist(userId);

  for (const action of actions) {
    try {
      switch (action.action_type) {
        case "update_profile": {
          if (!action.profile_fields) break;
          const clean: Record<string, unknown> = {};
          if (action.profile_fields.full_name !== undefined && action.profile_fields.full_name !== null) {
            clean.full_name = action.profile_fields.full_name;
          }
          if (Object.keys(clean).length > 0) {
            clean.onboarding_completed = true;
            const { error } = await supabase.from("profiles").update(clean).eq("id", userId);
            if (!error) log.push(`Updated profile: ${Object.keys(clean).filter(k => k !== "onboarding_completed").join(", ")}`);
          }
          break;
        }
        case "update_preferences": {
          if (!action.preference_fields) break;
          const clean: Record<string, unknown> = {};
          const f = action.preference_fields;
          if (f.age != null) clean.age = f.age;
          if (f.sex != null) clean.sex = f.sex;
          if (f.height_cm != null) clean.height_cm = f.height_cm;
          if (f.weight_kg != null) clean.weight_kg = f.weight_kg;
          if (f.target_weight_kg != null) clean.target_weight_kg = f.target_weight_kg;
          if (f.fitness_goal != null) clean.fitness_goal = f.fitness_goal;
          if (f.experience_level != null) clean.experience_level = f.experience_level;
          if (f.activity_level != null) clean.activity_level = f.activity_level;
          if (f.diet_type != null) clean.diet_type = f.diet_type;
          if (f.workout_days_per_week != null) clean.workout_days_per_week = f.workout_days_per_week;
          if (f.calorie_target != null) clean.calorie_target = f.calorie_target;
          if (f.protein_target_g != null) clean.protein_target_g = f.protein_target_g;
          if (f.carb_target_g != null) clean.carb_target_g = f.carb_target_g;
          if (f.fat_target_g != null) clean.fat_target_g = f.fat_target_g;
          if (f.dietary_restrictions != null) clean.dietary_restrictions = f.dietary_restrictions;
          if (Object.keys(clean).length > 0) {
            const { error } = await supabase
              .from("user_preferences")
              .upsert({ user_id: userId, ...clean }, { onConflict: "user_id" });
            if (!error) {
              log.push(`Saved preferences: ${Object.keys(clean).join(", ")}`);
              await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", userId);
            }
          }
          break;
        }
        case "generate_plans": {
          const wpResult = await regenerateWorkout();
          if (wpResult?.success) log.push("Generated new workout plan");
          const mpResult = await regenerateMeal();
          if (mpResult?.success) log.push("Generated new meal plan");
          break;
        }
        case "add_checklist_item": {
          if (!action.checklist_title) break;
          const result = await addChecklistItem(
            action.checklist_title,
            action.checklist_type ?? "custom"
          );
          if (result?.success) log.push(`Added to today's checklist: ${action.checklist_title}`);
          break;
        }
        case "add_injury": {
          if (!action.injury_body_part || !action.injury_severity) break;
          const { error } = await supabase.from("injuries").insert({
            user_id: userId,
            body_part: action.injury_body_part,
            severity: action.injury_severity,
            description: action.injury_description ?? null,
            is_active: true,
          });
          if (!error) log.push(`Added injury: ${action.injury_body_part} (${action.injury_severity})`);
          break;
        }
        case "remove_injury": {
          if (!action.injury_body_part) break;
          const { error } = await supabase
            .from("injuries")
            .update({ is_active: false })
            .eq("user_id", userId)
            .ilike("body_part", `%${action.injury_body_part}%`)
            .eq("is_active", true);
          if (!error) log.push(`Resolved injury: ${action.injury_body_part}`);
          break;
        }
      }
    } catch {
      // Skip failed actions silently
    }
  }

  if (log.length > 0) {
    revalidatePath("/app/profile");
    revalidatePath("/app/settings");
    revalidatePath("/app/today");
    revalidatePath("/app/workouts");
    revalidatePath("/app/meals");
  }

  return log;
}

async function loadUserContext(userId: string): Promise<UserContext> {
  const supabase = await createClient();

  const [{ data: profile }, { data: prefs }, { data: injuries }, { data: logs }, { count: wpCount }, { count: mpCount }] =
    await Promise.all([
      supabase.from("profiles").select("full_name, email, onboarding_completed").eq("id", userId).single(),
      supabase.from("user_preferences").select("*").eq("user_id", userId).single(),
      supabase.from("injuries").select("body_part, severity").eq("user_id", userId).eq("is_active", true),
      supabase.from("workout_logs").select("date").eq("user_id", userId).eq("completed", true).order("date", { ascending: false }).limit(60),
      supabase.from("workout_plans").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_active", true),
      supabase.from("meal_plans").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_active", true),
    ]);

  let streak = 0;
  if (logs && logs.length > 0) {
    const dates = [...new Set(logs.map((l) => l.date))].sort().reverse();
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (dates[i] === expected.toISOString().split("T")[0]) streak++;
      else break;
    }
  }

  return {
    name: profile?.full_name ?? null,
    email: profile?.email ?? null,
    onboardingCompleted: profile?.onboarding_completed ?? false,
    age: prefs?.age ?? null,
    sex: prefs?.sex ?? null,
    heightCm: prefs?.height_cm ?? null,
    weightKg: prefs?.weight_kg ?? null,
    targetWeightKg: prefs?.target_weight_kg ?? null,
    fitnessGoal: prefs?.fitness_goal ?? null,
    experienceLevel: prefs?.experience_level ?? null,
    activityLevel: prefs?.activity_level ?? null,
    dietType: prefs?.diet_type ?? null,
    workoutDaysPerWeek: prefs?.workout_days_per_week ?? null,
    calorieTarget: prefs?.calorie_target ?? null,
    proteinTarget: prefs?.protein_target_g ?? null,
    carbTarget: prefs?.carb_target_g ?? null,
    fatTarget: prefs?.fat_target_g ?? null,
    dietaryRestrictions: prefs?.dietary_restrictions ?? [],
    injuries: (injuries ?? []).map((i) => ({ body_part: i.body_part, severity: i.severity })),
    workoutsCompleted: logs?.length ?? 0,
    currentStreak: streak,
    hasWorkoutPlan: (wpCount ?? 0) > 0,
    hasMealPlan: (mpCount ?? 0) > 0,
  };
}

export async function askGlobalAssistant(message: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const context = await loadUserContext(user.id);

  let { data: thread } = await supabase
    .from("ai_threads")
    .select("*")
    .eq("user_id", user.id)
    .eq("context_type", "general")
    .is("context_id", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!thread) {
    const { data: newThread } = await supabase
      .from("ai_threads")
      .insert({
        user_id: user.id,
        context_type: "general",
        context_id: null,
        title: "CutPilot Assistant",
      })
      .select("*")
      .single();
    thread = newThread;
  }

  if (!thread) return { error: "Failed to create thread" };

  await supabase.from("ai_messages").insert({
    user_id: user.id,
    thread_id: thread.id,
    role: "user",
    content: message,
  });

  const { data: history } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true });

  const response = await globalAssistant(message, history || [], context);

  let actionLog: string[] = [];
  if (response.actions && response.actions.length > 0) {
    actionLog = await executeActions(user.id, response.actions);
  }

  await supabase.from("ai_messages").insert({
    user_id: user.id,
    thread_id: thread.id,
    role: "assistant",
    content: response.message,
  });

  return {
    data: {
      message: response.message,
      suggestions: response.suggestions,
      actions: actionLog,
    },
  };
}

export async function getGlobalChatHistory() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", data: [] };

  const { data: thread } = await supabase
    .from("ai_threads")
    .select("*")
    .eq("user_id", user.id)
    .eq("context_type", "general")
    .is("context_id", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!thread) return { data: [] };

  const { data: messages } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true })
    .limit(50);

  return { data: messages || [] };
}

export async function clearGlobalChat() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: thread } = await supabase
    .from("ai_threads")
    .select("id")
    .eq("user_id", user.id)
    .eq("context_type", "general")
    .is("context_id", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (thread) {
    await supabase.from("ai_messages").delete().eq("thread_id", thread.id);
  }

  return { success: true };
}
