"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@/hooks/use-user";
import { useSupabase } from "@/hooks/use-supabase";
import { updateProfile, updatePreferences } from "@/actions/profile";
import {
  FITNESS_GOAL_LABELS,
  EXPERIENCE_LABELS,
  ACTIVITY_LABELS,
} from "@/lib/schemas/onboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Target,
  Pencil,
  Loader2,
  Flame,
  Beef,
  Dumbbell,
  Timer,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  onboarding_completed: boolean;
}

interface Preferences {
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  target_weight_kg: number | null;
  fitness_goal: string | null;
  experience_level: string | null;
  activity_level: string | null;
  diet_type: string | null;
  workout_days_per_week: number | null;
  dietary_restrictions: string[] | null;
  calorie_target: number | null;
  protein_target_g: number | null;
  carb_target_g: number | null;
  fat_target_g: number | null;
}

interface Injury {
  id: string;
  body_part: string;
  severity: string;
}

interface WorkoutStats {
  totalWorkouts: number;
  totalMinutes: number;
  thisWeekWorkouts: number;
  currentStreak: number;
}

/* -------------------------------------------------------------------------- */
/*  EditableField                                                             */
/* -------------------------------------------------------------------------- */

function EditableField({
  label,
  value,
  suffix,
  onSave,
}: {
  label: string;
  value: string | number | null | undefined;
  suffix?: string;
  onSave: (value: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = useCallback(() => {
    setDraft(value?.toString() ?? "");
    setEditing(true);
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = async () => {
    if (draft === (value?.toString() ?? "")) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const cancel = () => {
    setEditing(false);
    setDraft("");
  };

  const display = value != null && value !== "" ? `${value}${suffix ? ` ${suffix}` : ""}` : "Not set";

  if (editing) {
    return (
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground shrink-0">{label}</span>
        <div className="flex items-center gap-1.5">
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
            onBlur={save}
            disabled={saving}
            className="h-7 w-28 text-right text-sm"
          />
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>
      </div>
    );
  }

  return (
    <div
      className="group/field flex items-center justify-between text-sm cursor-pointer rounded-md px-1 -mx-1 py-0.5 hover:bg-muted/50 transition-colors"
      onClick={startEditing}
    >
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={value == null || value === "" ? "text-muted-foreground italic" : ""}>
          {display}
        </span>
        <Pencil className="h-3 w-3 text-muted-foreground/0 group-hover/field:text-muted-foreground transition-colors" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  EditableSelect                                                            */
/* -------------------------------------------------------------------------- */

function EditableSelect({
  label,
  value,
  options,
  onSave,
}: {
  label: string;
  value: string | null | undefined;
  options: Record<string, string>;
  onSave: (value: string) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  const handleChange = async (newValue: unknown) => {
    const v = newValue as string;
    if (!v || v === value) return;
    setSaving(true);
    try {
      await onSave(v);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <Select value={value ?? ""} onValueChange={handleChange}>
          <SelectTrigger className="h-7 text-xs gap-1" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(options).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Diet type labels                                                          */
/* -------------------------------------------------------------------------- */

const DIET_LABELS: Record<string, string> = {
  flexible: "Flexible",
  keto: "Keto",
  paleo: "Paleo",
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  mediterranean: "Mediterranean",
};

/* -------------------------------------------------------------------------- */
/*  Profile Page                                                              */
/* -------------------------------------------------------------------------- */

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const supabase = useSupabase();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    totalMinutes: 0,
    thisWeekWorkouts: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;

    const startOfWeek = (() => {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff)).toISOString().split("T")[0];
    })();

    const [profileRes, prefsRes, injuriesRes, allLogsRes, weekLogsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_preferences").select("*").eq("user_id", user.id).single(),
      supabase.from("injuries").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("workout_logs").select("date, duration_minutes, completed").eq("user_id", user.id).eq("completed", true).order("date", { ascending: false }),
      supabase.from("workout_logs").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", true).gte("date", startOfWeek),
    ]);

    const allLogs = allLogsRes.data ?? [];
    const totalMinutes = allLogs.reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0);

    let streak = 0;
    if (allLogs.length > 0) {
      const dates = [...new Set(allLogs.map((l) => l.date))].sort().reverse();
      const today = new Date();
      for (let i = 0; i < dates.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        if (dates[i] === expected.toISOString().split("T")[0]) {
          streak++;
        } else {
          break;
        }
      }
    }

    setProfile(profileRes.data);
    setPrefs(prefsRes.data);
    setInjuries(injuriesRes.data ?? []);
    setWorkoutStats({
      totalWorkouts: allLogs.length,
      totalMinutes,
      thisWeekWorkouts: weekLogsRes.count ?? 0,
      currentStreak: streak,
    });
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    if (!userLoading && user) loadData();
    if (!userLoading && !user) setLoading(false);
  }, [userLoading, user, loadData]);

  /* -- Save helpers -- */

  const saveProfileField = async (field: string, value: string) => {
    await updateProfile({ [field]: value });
    setProfile((p) => (p ? { ...p, [field]: value } : p));
  };

  const savePrefsField = async (field: string, value: string) => {
    const numericFields = [
      "age",
      "height_cm",
      "weight_kg",
      "target_weight_kg",
      "workout_days_per_week",
      "calorie_target",
      "protein_target_g",
      "carb_target_g",
      "fat_target_g",
    ];
    const processed = numericFields.includes(field) ? Number(value) : value;
    await updatePreferences({ [field]: processed });
    setPrefs((p) => (p ? { ...p, [field]: processed } : p));
  };

  /* -- Loading state -- */

  if (loading || userLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-glow" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-t-primary/60 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.6s" }} />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Set up your profile to get started</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">No Profile Data</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Complete the onboarding process to set up your fitness profile, goals, and preferences.
            </p>
            <a
              href="/onboarding"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-2.5 text-sm font-medium hover:shadow-lg transition-all"
            >
              Complete Setup
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* -- Render -- */

  return (
    <div className="space-y-6">
      {/* ---- Header Card ---- */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/20">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold">
                {profile.full_name || "Your Profile"}
              </h1>
              <p className="truncate text-sm text-muted-foreground">
                {profile.email || user.email}
              </p>
              {prefs?.fitness_goal && (
                <Badge variant="secondary" className="mt-1.5">
                  {FITNESS_GOAL_LABELS[prefs.fitness_goal] ?? prefs.fitness_goal}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ---- Workout Stats ---- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Dumbbell className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold tabular-nums">{workoutStats.totalWorkouts}</p>
          <p className="text-[11px] text-muted-foreground">Total Workouts</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
              <Timer className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold tabular-nums">{workoutStats.totalMinutes}</p>
          <p className="text-[11px] text-muted-foreground">Total Minutes</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
              <TrendingUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold tabular-nums">{workoutStats.thisWeekWorkouts}</p>
          <p className="text-[11px] text-muted-foreground">This Week</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10">
              <Flame className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold tabular-nums">{workoutStats.currentStreak}</p>
          <p className="text-[11px] text-muted-foreground">Day Streak</p>
        </Card>
      </div>

      {/* ---- Personal Info ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Personal Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <EditableField
            label="Name"
            value={profile.full_name}
            onSave={(v) => saveProfileField("full_name", v)}
          />
          {prefs && (
            <>
              <EditableField
                label="Age"
                value={prefs.age}
                onSave={(v) => savePrefsField("age", v)}
              />
              <EditableField
                label="Height"
                value={prefs.height_cm}
                suffix="cm"
                onSave={(v) => savePrefsField("height_cm", v)}
              />
              <EditableField
                label="Weight"
                value={prefs.weight_kg}
                suffix="kg"
                onSave={(v) => savePrefsField("weight_kg", v)}
              />
              <EditableField
                label="Target Weight"
                value={prefs.target_weight_kg}
                suffix="kg"
                onSave={(v) => savePrefsField("target_weight_kg", v)}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* ---- Goals & Preferences ---- */}
      {prefs && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              Goals & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <EditableSelect
              label="Fitness Goal"
              value={prefs.fitness_goal}
              options={FITNESS_GOAL_LABELS}
              onSave={(v) => savePrefsField("fitness_goal", v)}
            />
            <EditableSelect
              label="Experience"
              value={prefs.experience_level}
              options={EXPERIENCE_LABELS}
              onSave={(v) => savePrefsField("experience_level", v)}
            />
            <EditableSelect
              label="Activity Level"
              value={prefs.activity_level}
              options={ACTIVITY_LABELS}
              onSave={(v) => savePrefsField("activity_level", v)}
            />
            <EditableSelect
              label="Diet Type"
              value={prefs.diet_type}
              options={DIET_LABELS}
              onSave={(v) => savePrefsField("diet_type", v)}
            />
            <EditableField
              label="Workout Days/Week"
              value={prefs.workout_days_per_week}
              onSave={(v) => savePrefsField("workout_days_per_week", v)}
            />
            {prefs.dietary_restrictions && prefs.dietary_restrictions.length > 0 && (
              <div className="flex items-start justify-between text-sm pt-1">
                <span className="text-muted-foreground">Restrictions</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {prefs.dietary_restrictions.map((r) => (
                    <Badge key={r} variant="outline" className="text-xs">
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ---- Macro Targets ---- */}
      {prefs && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4" />
              Macro Targets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <EditableField
              label="Calories"
              value={prefs.calorie_target}
              suffix="kcal"
              onSave={(v) => savePrefsField("calorie_target", v)}
            />
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs pt-1 pb-0.5">
              <Beef className="h-3 w-3" />
              <span>Macronutrients</span>
            </div>
            <EditableField
              label="Protein"
              value={prefs.protein_target_g}
              suffix="g"
              onSave={(v) => savePrefsField("protein_target_g", v)}
            />
            <EditableField
              label="Carbs"
              value={prefs.carb_target_g}
              suffix="g"
              onSave={(v) => savePrefsField("carb_target_g", v)}
            />
            <EditableField
              label="Fat"
              value={prefs.fat_target_g}
              suffix="g"
              onSave={(v) => savePrefsField("fat_target_g", v)}
            />
          </CardContent>
        </Card>
      )}

      {/* ---- Active Injuries ---- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4" />
            Active Injuries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {injuries.length > 0 ? (
            <div className="space-y-2">
              {injuries.map((injury) => (
                <div
                  key={injury.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{injury.body_part}</span>
                  <Badge
                    variant={injury.severity === "severe" ? "destructive" : "secondary"}
                  >
                    {injury.severity}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              No active injuries recorded
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
