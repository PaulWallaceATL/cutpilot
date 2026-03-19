"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FITNESS_GOAL_LABELS,
  EXPERIENCE_LABELS,
  ACTIVITY_LABELS,
} from "@/lib/schemas/onboarding";

interface StepGoalsProps {
  data: {
    fitness_goal: string;
    experience_level: string;
    activity_level: string;
  };
  onChange: (field: string, value: string) => void;
}

export function StepGoals({ data, onChange }: StepGoalsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">What&apos;s your goal?</h2>
        <p className="mt-2 text-muted-foreground">
          Tell us what you want to achieve
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Fitness Goal</Label>
            <Select
              value={data.fitness_goal}
              onValueChange={(v) => v && onChange("fitness_goal", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FITNESS_GOAL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Experience Level</Label>
            <Select
              value={data.experience_level}
              onValueChange={(v) => v && onChange("experience_level", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EXPERIENCE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Activity Level</Label>
            <Select
              value={data.activity_level}
              onValueChange={(v) => v && onChange("activity_level", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
