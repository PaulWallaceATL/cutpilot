import { createClient } from "@/lib/supabase/server";
import { WeightLogSection } from "./weight-log-section";
import { ProgressPhotosSection } from "./progress-photos-section";

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: weightLogs } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true })
    .limit(30);

  const { data: photos } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(20);

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("target_weight_kg")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Progress</h1>

      <WeightLogSection
        logs={weightLogs || []}
        targetWeight={prefs?.target_weight_kg}
      />

      <ProgressPhotosSection photos={photos || []} userId={user.id} />
    </div>
  );
}
