"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhotoUpload } from "@/components/shared/photo-upload";
import { analyzeMenu } from "@/actions/menu-scan";
import { ScanLine, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { MenuAnalysis } from "@/types/database";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ScanLine className="h-6 w-6" />
          Menu Scanner
        </h1>
        <p className="text-muted-foreground">
          Upload a photo of a restaurant menu to get health-scored recommendations.
        </p>
      </div>

      <PhotoUpload onUpload={handleUpload} label="Upload Menu Photo" />

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">
                Analyzing menu...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm">{analysis.summary}</p>
            </CardContent>
          </Card>

          {analysis.recommendations.map((rec, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{rec.item_name}</CardTitle>
                  <Badge
                    variant={rec.health_score >= 7 ? "default" : "secondary"}
                  >
                    <Star className="mr-1 h-3 w-3" />
                    {rec.health_score}/10
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded bg-muted p-1.5">
                    <div className="font-semibold">{rec.estimated_calories}</div>
                    <div className="text-muted-foreground">cal</div>
                  </div>
                  <div className="rounded bg-muted p-1.5">
                    <div className="font-semibold">{rec.estimated_protein_g}g</div>
                    <div className="text-muted-foreground">protein</div>
                  </div>
                  <div className="rounded bg-muted p-1.5">
                    <div className="font-semibold">{rec.estimated_carbs_g}g</div>
                    <div className="text-muted-foreground">carbs</div>
                  </div>
                  <div className="rounded bg-muted p-1.5">
                    <div className="font-semibold">{rec.estimated_fat_g}g</div>
                    <div className="text-muted-foreground">fat</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                {rec.modifications.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1">Suggested modifications:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {rec.modifications.map((mod, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-primary">•</span>
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
