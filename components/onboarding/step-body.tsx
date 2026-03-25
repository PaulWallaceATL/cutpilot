"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cmToFeetInches, feetInchesToCm, kgToLb, lbToKg } from "@/lib/units/imperial";

interface StepBodyProps {
  data: {
    age: number;
    sex: string;
    height_cm: number;
    weight_kg: number;
    target_weight_kg: number;
  };
  onChange: (field: string, value: string | number) => void;
}

export function StepBody({ data, onChange }: StepBodyProps) {
  const { feet, inches } = cmToFeetInches(data.height_cm || 175);
  const weightLb = Math.round(kgToLb(data.weight_kg || 0));
  const targetLb = Math.round(kgToLb(data.target_weight_kg || 0));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-section-title text-2xl sm:text-3xl">About you</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Help us create accurate macro calculations (imperial units)
        </p>
      </div>

      <Card variant="glass">
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Age</Label>
              <Input
                type="number"
                value={data.age || ""}
                onChange={(e) => onChange("age", parseInt(e.target.value, 10) || 0)}
                placeholder="25"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Sex</Label>
              <Select
                value={data.sex}
                onValueChange={(v) => v && onChange("sex", v)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Height</Label>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <span className="text-xs text-muted-foreground">Feet</span>
                <Input
                  type="number"
                  min={0}
                  max={8}
                  value={feet}
                  onChange={(e) => {
                    const f = parseInt(e.target.value, 10) || 0;
                    const cm = feetInchesToCm(f, inches);
                    if (cm != null) onChange("height_cm", cm);
                  }}
                  className="rounded-xl"
                />
              </div>
              <div className="w-24 space-y-1">
                <span className="text-xs text-muted-foreground">Inches</span>
                <Input
                  type="number"
                  min={0}
                  max={11}
                  value={inches}
                  onChange={(e) => {
                    const i = parseInt(e.target.value, 10) || 0;
                    const cm = feetInchesToCm(feet, Math.min(11, Math.max(0, i)));
                    if (cm != null) onChange("height_cm", cm);
                  }}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current weight (lb)</Label>
              <Input
                type="number"
                value={weightLb || ""}
                onChange={(e) => {
                  const lb = parseFloat(e.target.value) || 0;
                  onChange("weight_kg", lbToKg(lb));
                }}
                placeholder="175"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Target weight (lb)</Label>
              <Input
                type="number"
                value={targetLb || ""}
                onChange={(e) => {
                  const lb = parseFloat(e.target.value) || 0;
                  onChange("target_weight_kg", lbToKg(lb));
                }}
                placeholder="165"
                className="rounded-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
