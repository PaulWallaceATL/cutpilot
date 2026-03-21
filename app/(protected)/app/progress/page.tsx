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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight font-heading">Progress</h1>
          <p className="mt-1 text-muted-foreground">Track your journey over time</p>
        </div>
      </div>

      <div className="space-y-8">
        <WeightLogSection
          logs={weightLogs || []}
          targetWeight={prefs?.target_weight_kg}
        />

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <ProgressPhotosSection photos={photos || []} userId={user.id} />
      </div>
    </div>
  );
}
