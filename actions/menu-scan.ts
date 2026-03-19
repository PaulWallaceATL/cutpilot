"use server";

import { createClient } from "@/lib/supabase/server";
import { menuImageAnalyzer } from "@/lib/openai/menu-analyzer";
import type { UserPreferences } from "@/types/database";

export async function analyzeMenu(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop();
  const storagePath = `${user.id}/menus/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("user-uploads")
    .upload(storagePath, file);

  if (uploadError) return { error: "Failed to upload image" };

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const analysis = await menuImageAnalyzer(
    base64,
    prefs as UserPreferences | null
  );

  const { data: scan, error: scanError } = await supabase
    .from("menu_scans")
    .insert({
      user_id: user.id,
      image_storage_path: storagePath,
      analysis,
      restaurant_name: analysis.restaurant_name || null,
    })
    .select("*")
    .single();

  if (scanError) return { error: "Failed to save analysis" };

  return { data: scan };
}
