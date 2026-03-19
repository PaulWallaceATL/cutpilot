"use client";

import { cn } from "@/lib/utils";

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
  className?: string;
}

export function MacroBar({
  label,
  current,
  target,
  unit = "g",
  color = "bg-primary",
  className,
}: MacroBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {current}{unit} / {target}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface MacroSummaryProps {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}

export function MacroSummary({ calories, protein, carbs, fat }: MacroSummaryProps) {
  return (
    <div className="space-y-3">
      <MacroBar
        label="Calories"
        current={calories.current}
        target={calories.target}
        unit=" kcal"
        color="bg-orange-500"
      />
      <MacroBar
        label="Protein"
        current={protein.current}
        target={protein.target}
        color="bg-blue-500"
      />
      <MacroBar
        label="Carbs"
        current={carbs.current}
        target={carbs.target}
        color="bg-green-500"
      />
      <MacroBar
        label="Fat"
        current={fat.current}
        target={fat.target}
        color="bg-yellow-500"
      />
    </div>
  );
}
