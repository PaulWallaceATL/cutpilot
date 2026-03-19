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
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">About you</h2>
        <p className="mt-2 text-muted-foreground">
          Help us create accurate macro calculations
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Age</Label>
              <Input
                type="number"
                value={data.age || ""}
                onChange={(e) => onChange("age", parseInt(e.target.value) || 0)}
                placeholder="25"
              />
            </div>
            <div className="space-y-2">
              <Label>Sex</Label>
              <Select
                value={data.sex}
                onValueChange={(v) => v && onChange("sex", v)}
              >
                <SelectTrigger>
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
            <Label>Height (cm)</Label>
            <Input
              type="number"
              value={data.height_cm || ""}
              onChange={(e) =>
                onChange("height_cm", parseFloat(e.target.value) || 0)
              }
              placeholder="175"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Weight (kg)</Label>
              <Input
                type="number"
                value={data.weight_kg || ""}
                onChange={(e) =>
                  onChange("weight_kg", parseFloat(e.target.value) || 0)
                }
                placeholder="80"
              />
            </div>
            <div className="space-y-2">
              <Label>Target Weight (kg)</Label>
              <Input
                type="number"
                value={data.target_weight_kg || ""}
                onChange={(e) =>
                  onChange("target_weight_kg", parseFloat(e.target.value) || 0)
                }
                placeholder="75"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
