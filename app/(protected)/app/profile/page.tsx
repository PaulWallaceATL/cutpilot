import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MacroSummary } from "@/components/shared/macro-bar";
import { Separator } from "@/components/ui/separator";
import { User, Target, Dumbbell, UtensilsCrossed } from "lucide-react";
import { FITNESS_GOAL_LABELS, EXPERIENCE_LABELS } from "@/lib/schemas/onboarding";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: injuries } = await supabase
    .from("injuries")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Personal Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Name</span>
            <span>{profile?.full_name || "Not set"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span>{profile?.email}</span>
          </div>
          {prefs && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Age</span>
                <span>{prefs.age}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Height</span>
                <span>{prefs.height_cm} cm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Weight</span>
                <span>{prefs.weight_kg} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target</span>
                <span>{prefs.target_weight_kg} kg</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {prefs && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Goals & Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Goal</span>
                <Badge variant="secondary">
                  {FITNESS_GOAL_LABELS[prefs.fitness_goal] || prefs.fitness_goal}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Experience</span>
                <span>{EXPERIENCE_LABELS[prefs.experience_level] || prefs.experience_level}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Diet</span>
                <span className="capitalize">{prefs.diet_type}</span>
              </div>
              {prefs.dietary_restrictions?.length > 0 && (
                <div className="flex justify-between text-sm items-start">
                  <span className="text-muted-foreground">Restrictions</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {prefs.dietary_restrictions.map((r: string) => (
                      <Badge key={r} variant="outline" className="text-xs">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Macro Targets</CardTitle>
            </CardHeader>
            <CardContent>
              <MacroSummary
                calories={{ current: 0, target: prefs.calorie_target || 2000 }}
                protein={{ current: 0, target: prefs.protein_target_g || 150 }}
                carbs={{ current: 0, target: prefs.carb_target_g || 200 }}
                fat={{ current: 0, target: prefs.fat_target_g || 70 }}
              />
            </CardContent>
          </Card>
        </>
      )}

      {injuries && injuries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Injuries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {injuries.map((injury) => (
              <div
                key={injury.id}
                className="flex items-center justify-between text-sm"
              >
                <span>{injury.body_part}</span>
                <Badge
                  variant={
                    injury.severity === "severe"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {injury.severity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
