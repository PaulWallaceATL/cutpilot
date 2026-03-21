"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProfile } from "@/actions/profile";
import { Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSupabase } from "@/hooks/use-supabase";
import { useUser } from "@/hooks/use-user";

export default function SettingsPage() {
  const supabase = useSupabase();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">("imperial");
  const [timezone, setTimezone] = useState("America/New_York");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name || "");
          setUnitSystem(data.unit_system || "imperial");
          setTimezone(data.timezone || "America/New_York");
        }
      });
  }, [user, supabase]);

  async function handleSave() {
    setLoading(true);
    const result = await updateProfile({
      full_name: fullName,
      unit_system: unitSystem,
      timezone,
    });
    if (result?.success) {
      toast.success("Settings saved!");
    } else {
      toast.error(result?.error || "Failed to save");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account preferences</p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/8 to-transparent">
          <CardTitle className="text-base font-semibold">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-xl border-border/60 bg-muted/30 transition-colors focus:bg-background"
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Unit System</Label>
            <Select
              value={unitSystem}
              onValueChange={(v) => v && setUnitSystem(v as "imperial" | "metric")}
            >
              <SelectTrigger className="rounded-xl border-border/60 bg-muted/30 transition-colors focus:bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imperial">Imperial (lbs, ft)</SelectItem>
                <SelectItem value="metric">Metric (kg, cm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Timezone</Label>
            <Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
              <SelectTrigger className="rounded-xl border-border/60 bg-muted/30 transition-colors focus:bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Central European</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                <SelectItem value="Australia/Sydney">Sydney</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Settings
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
