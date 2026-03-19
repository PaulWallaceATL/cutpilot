"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Settings className="h-6 w-6" />
        Settings
      </h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Unit System</Label>
            <Select
              value={unitSystem}
              onValueChange={(v) => v && setUnitSystem(v as "imperial" | "metric")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imperial">Imperial (lbs, ft)</SelectItem>
                <SelectItem value="metric">Metric (kg, cm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
              <SelectTrigger>
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

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
