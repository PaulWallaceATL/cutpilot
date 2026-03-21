"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: Record<string, unknown>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", user.id);

  if (error) return { error: "Failed to update profile" };

  revalidatePath("/app/profile");
  revalidatePath("/app/settings");
  revalidatePath("/app/today");
  return { success: true };
}

export async function updatePreferences(data: Record<string, unknown>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("user_preferences")
    .update(data)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to update preferences" };

  revalidatePath("/app/profile");
  revalidatePath("/app/settings");
  revalidatePath("/app/today");
  return { success: true };
}
