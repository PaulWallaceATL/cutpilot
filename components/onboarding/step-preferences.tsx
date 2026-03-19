"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EQUIPMENT_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
} from "@/lib/schemas/onboarding";

interface StepPreferencesProps {
  data: {
    workout_days_per_week: number;
    workout_duration_minutes: number;
    available_equipment: string[];
    dietary_restrictions: string[];
    diet_type: string;
    meals_per_day: number;
  };
  onChange: (field: string, value: string | number | string[]) => void;
}

export function StepPreferences({ data, onChange }: StepPreferencesProps) {
  function toggleArrayItem(field: string, item: string, current: string[]) {
    const updated = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    onChange(field, updated);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Preferences</h2>
        <p className="mt-2 text-muted-foreground">
          Customize your workout and diet plan
        </p>
      </div>

      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Days per Week</Label>
              <Input
                type="number"
                min={1}
                max={7}
                value={data.workout_days_per_week}
                onChange={(e) =>
                  onChange(
                    "workout_days_per_week",
                    parseInt(e.target.value) || 4
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Session Length (min)</Label>
              <Input
                type="number"
                min={15}
                max={180}
                value={data.workout_duration_minutes}
                onChange={(e) =>
                  onChange(
                    "workout_duration_minutes",
                    parseInt(e.target.value) || 60
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Available Equipment</Label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <Badge
                  key={eq}
                  variant={
                    data.available_equipment.includes(eq)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    toggleArrayItem(
                      "available_equipment",
                      eq,
                      data.available_equipment
                    )
                  }
                >
                  {eq}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Diet Type</Label>
            <Select
              value={data.diet_type}
              onValueChange={(v) => v && onChange("diet_type", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flexible">Flexible</SelectItem>
                <SelectItem value="keto">Keto</SelectItem>
                <SelectItem value="paleo">Paleo</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="mediterranean">Mediterranean</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Meals Per Day</Label>
            <Input
              type="number"
              min={2}
              max={6}
              value={data.meals_per_day}
              onChange={(e) =>
                onChange("meals_per_day", parseInt(e.target.value) || 3)
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Dietary Restrictions</Label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_RESTRICTION_OPTIONS.map((r) => (
                <Badge
                  key={r}
                  variant={
                    data.dietary_restrictions.includes(r)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    toggleArrayItem(
                      "dietary_restrictions",
                      r,
                      data.dietary_restrictions
                    )
                  }
                >
                  {r}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
