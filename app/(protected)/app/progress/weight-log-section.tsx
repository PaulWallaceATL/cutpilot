"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logWeight } from "@/actions/progress";
import { Scale, Plus, TrendingDown, TrendingUp, Minus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WeightLog {
  id: string;
  weight_kg: number;
  date: string;
}

interface WeightLogSectionProps {
  logs: WeightLog[];
  targetWeight: number | null | undefined;
}

export function WeightLogSection({ logs, targetWeight }: WeightLogSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight_kg : null;
  const previousWeight = logs.length > 1 ? logs[logs.length - 2].weight_kg : null;
  const change =
    latestWeight !== null && previousWeight !== null
      ? latestWeight - previousWeight
      : null;

  async function handleLog() {
    if (!weight) return;
    setLoading(true);
    const result = await logWeight(parseFloat(weight));
    if (result?.success) {
      toast.success("Weight logged!");
      setShowForm(false);
      setWeight("");
    } else {
      toast.error(result?.error || "Failed to log weight");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Weight
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Log Weight
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="75.0"
                />
              </div>
              <Button onClick={handleLog} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-xl font-bold">
              {latestWeight ? `${latestWeight} kg` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="text-xl font-bold">
              {targetWeight ? `${targetWeight} kg` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Change</p>
            <div className="flex items-center justify-center gap-1">
              {change !== null ? (
                <>
                  {change < 0 ? (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  ) : change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-xl font-bold">
                    {change > 0 ? "+" : ""}
                    {change.toFixed(1)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold">—</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {logs.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...logs].reverse().slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {new Date(log.date).toLocaleDateString()}
                  </span>
                  <span className="font-medium">{log.weight_kg} kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
