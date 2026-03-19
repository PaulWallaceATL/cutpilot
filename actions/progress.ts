"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function logWeight(weightKg: number, notes?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("weight_logs").insert({
    user_id: user.id,
    weight_kg: weightKg,
    date: new Date().toISOString().split("T")[0],
    notes: notes || null,
  });

  if (error) return { error: "Failed to log weight" };

  revalidatePath("/app/progress");
  return { success: true };
}

export async function uploadProgressPhoto(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file") as File;
  const category = (formData.get("category") as string) || "front";

  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop();
  const path = `${user.id}/progress/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("user-uploads")
    .upload(path, file);

  if (uploadError) return { error: "Failed to upload photo" };

  const { error: dbError } = await supabase.from("progress_photos").insert({
    user_id: user.id,
    storage_path: path,
    date: new Date().toISOString().split("T")[0],
    category,
  });

  if (dbError) return { error: "Failed to save photo record" };

  revalidatePath("/app/progress");
  return { success: true };
}
