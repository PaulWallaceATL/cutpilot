"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logWeight } from "@/actions/progress";
import { Scale, Plus, TrendingDown, TrendingUp, Minus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatWeightLb, kgToLb, lbToKg } from "@/lib/units/imperial";

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
  const [weightLb, setWeightLb] = useState("");
  const [loading, setLoading] = useState(false);

  const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight_kg : null;
  const previousWeight = logs.length > 1 ? logs[logs.length - 2].weight_kg : null;
  const changeLb =
    latestWeight !== null && previousWeight !== null
      ? kgToLb(latestWeight - previousWeight)
      : null;

  async function handleLog() {
    if (!weightLb) return;
    const lb = parseFloat(weightLb);
    if (Number.isNaN(lb) || lb <= 0) return;
    setLoading(true);
    const result = await logWeight(lbToKg(lb));
    if (result?.success) {
      toast.success("Weight logged!");
      setShowForm(false);
      setWeightLb("");
    } else {
      toast.error(result?.error || "Failed to log weight");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-section-title flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Weight
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl"
        >
          <Plus className="mr-1 h-4 w-4" />
          Log weight
        </Button>
      </div>

      {showForm && (
        <Card variant="glass">
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[140px] flex-1 space-y-1">
                <Label className="text-xs">Weight (lb)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={weightLb}
                  onChange={(e) => setWeightLb(e.target.value)}
                  placeholder="175"
                  className="rounded-xl"
                />
              </div>
              <Button onClick={handleLog} disabled={loading} className="rounded-xl">
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
        <Card variant="elevated" className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-stat-value text-lg">
              {latestWeight != null ? formatWeightLb(latestWeight) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card variant="elevated" className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="text-stat-value text-lg">
              {targetWeight != null ? formatWeightLb(targetWeight) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card variant="elevated" className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Change</p>
            <div className="flex items-center justify-center gap-1">
              {changeLb !== null ? (
                <>
                  {changeLb < 0 ? (
                    <TrendingDown className="h-4 w-4 text-primary" />
                  ) : changeLb > 0 ? (
                    <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-stat-value text-lg">
                    {changeLb > 0 ? "+" : ""}
                    {Math.abs(changeLb) < 10
                      ? changeLb.toFixed(1)
                      : Math.round(changeLb)}{" "}
                    lb
                  </span>
                </>
              ) : (
                <span className="text-stat-value text-lg">—</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {logs.length > 0 && (
        <Card variant="default">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent entries</CardTitle>
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
                  <span className="font-medium tabular-nums">
                    {formatWeightLb(log.weight_kg)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
