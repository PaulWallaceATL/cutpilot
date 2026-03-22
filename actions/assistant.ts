"use server";

import { createClient } from "@/lib/supabase/server";
import { globalAssistant } from "@/lib/openai/global-assistant";

export async function askGlobalAssistant(message: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const [{ data: profile }, { data: prefs }, { data: injuries }] =
    await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
      supabase.from("user_preferences").select("*").eq("user_id", user.id).single(),
      supabase
        .from("injuries")
        .select("body_part, severity")
        .eq("user_id", user.id)
        .eq("is_active", true),
    ]);

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

  const context = {
    name: profile?.full_name ?? null,
    fitnessGoal: prefs?.fitness_goal ?? null,
    experienceLevel: prefs?.experience_level ?? null,
    dietType: prefs?.diet_type ?? null,
    calorieTarget: prefs?.calorie_target ?? null,
    proteinTarget: prefs?.protein_target_g ?? null,
    carbTarget: prefs?.carb_target_g ?? null,
    fatTarget: prefs?.fat_target_g ?? null,
    currentWeight: prefs?.weight_kg ?? null,
    targetWeight: prefs?.target_weight_kg ?? null,
    workoutDaysPerWeek: prefs?.workout_days_per_week ?? null,
    injuries: (injuries ?? []).map((i) => `${i.body_part} (${i.severity})`),
  };

  const response = await globalAssistant(message, history || [], context);

  await supabase.from("ai_messages").insert({
    user_id: user.id,
    thread_id: thread.id,
    role: "assistant",
    content: response.message,
  });

  return { data: response };
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
