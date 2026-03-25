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
          setTimezone(data.timezone || "America/New_York");
        }
      });
  }, [user, supabase]);

  async function handleSave() {
    setLoading(true);
    const result = await updateProfile({
      full_name: fullName,
      unit_system: "imperial",
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
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/[0.08] via-card/80 to-transparent p-6 shadow-soft backdrop-blur-sm sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 shadow-soft">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-page-title">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account preferences
            </p>
          </div>
        </div>
      </div>

      <Card variant="elevated">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Full name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-xl border-border/60 bg-muted/20 transition-colors focus-visible:bg-background"
              placeholder="Enter your full name"
            />
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Body measurements and workout weights use{" "}
            <span className="font-medium text-foreground">imperial</span> (lb,
            ft/in) throughout the app.
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Timezone</Label>
            <Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
              <SelectTrigger className="rounded-xl border-border/60 bg-muted/20">
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
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 hover:shadow-elevated disabled:pointer-events-none disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save settings
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
