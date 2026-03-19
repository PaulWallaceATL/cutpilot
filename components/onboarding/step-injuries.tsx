"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface Injury {
  body_part: string;
  description?: string;
  severity: "mild" | "moderate" | "severe";
}

interface StepInjuriesProps {
  injuries: Injury[];
  onChange: (injuries: Injury[]) => void;
}

export function StepInjuries({ injuries, onChange }: StepInjuriesProps) {
  function addInjury() {
    onChange([
      ...injuries,
      { body_part: "", description: "", severity: "moderate" },
    ]);
  }

  function removeInjury(index: number) {
    onChange(injuries.filter((_, i) => i !== index));
  }

  function updateInjury(index: number, field: string, value: string) {
    const updated = [...injuries];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Injuries & Limitations</h2>
        <p className="mt-2 text-muted-foreground">
          Optional — helps AI avoid exercises that could aggravate issues
        </p>
      </div>

      <div className="space-y-4">
        {injuries.map((injury, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Body Part</Label>
                      <Input
                        value={injury.body_part}
                        onChange={(e) =>
                          updateInjury(index, "body_part", e.target.value)
                        }
                        placeholder="e.g. Left knee"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Severity</Label>
                      <Select
                        value={injury.severity}
                        onValueChange={(v) =>
                          v && updateInjury(index, "severity", v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description (optional)</Label>
                    <Input
                      value={injury.description || ""}
                      onChange={(e) =>
                        updateInjury(index, "description", e.target.value)
                      }
                      placeholder="Brief description..."
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 mt-5"
                  onClick={() => removeInjury(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          className="w-full"
          onClick={addInjury}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Injury / Limitation
        </Button>
      </div>
    </div>
  );
}
