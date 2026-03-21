"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhotoUpload } from "@/components/shared/photo-upload";
import { analyzeMenu } from "@/actions/menu-scan";
import { ScanLine, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { MenuAnalysis } from "@/types/database";
import { cn } from "@/lib/utils";

function healthScoreColor(score: number) {
  if (score >= 7) return "bg-green-500/10 text-green-600 border-green-500/30";
  if (score >= 4) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

function healthScoreLabel(score: number) {
  if (score >= 7) return "Good";
  if (score >= 4) return "Moderate";
  return "Poor";
}

export default function MenuScanPage() {
  const [analysis, setAnalysis] = useState<MenuAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload(file: File) {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await analyzeMenu(formData);
    if (result?.data?.analysis) {
      setAnalysis(result.data.analysis as MenuAnalysis);
      toast.success("Menu analyzed!");
    } else {
      toast.error(result?.error || "Failed to analyze menu");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <ScanLine className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Menu Scanner</h1>
            <p className="text-sm text-muted-foreground">
              Upload a photo of a restaurant menu to get health-scored recommendations.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-dashed border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-1 transition-colors hover:border-primary/40">
        <PhotoUpload onUpload={handleUpload} label="Upload Menu Photo" />
      </div>

      {loading && (
        <Card className="overflow-hidden">
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="relative mx-auto h-12 w-12">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Analyzing menu...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="space-y-4">
          <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-5 pb-5">
              <p className="text-sm leading-relaxed">{analysis.summary}</p>
            </CardContent>
          </Card>

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {analysis.recommendations.map((rec, idx) => (
            <Card
              key={idx}
              className="group overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{rec.item_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border",
                      healthScoreColor(rec.health_score)
                    )}>
                      {healthScoreLabel(rec.health_score)}
                    </span>
                    <Badge
                      className={cn(
                        "border font-semibold tabular-nums",
                        healthScoreColor(rec.health_score)
                      )}
                      variant="outline"
                    >
                      <Star className="mr-1 h-3 w-3" />
                      {rec.health_score}/10
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-3">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-muted/60 p-2 transition-colors group-hover:bg-muted">
                    <div className="text-base font-bold tabular-nums">{rec.estimated_calories}</div>
                    <div className="text-muted-foreground">cal</div>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-2 transition-colors group-hover:bg-muted">
                    <div className="text-base font-bold tabular-nums">{rec.estimated_protein_g}g</div>
                    <div className="text-muted-foreground">protein</div>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-2 transition-colors group-hover:bg-muted">
                    <div className="text-base font-bold tabular-nums">{rec.estimated_carbs_g}g</div>
                    <div className="text-muted-foreground">carbs</div>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-2 transition-colors group-hover:bg-muted">
                    <div className="text-base font-bold tabular-nums">{rec.estimated_fat_g}g</div>
                    <div className="text-muted-foreground">fat</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{rec.reasoning}</p>
                {rec.modifications.length > 0 && (
                  <div className="rounded-xl bg-muted/30 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggested modifications</p>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {rec.modifications.map((mod, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                          {mod}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
