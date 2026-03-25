"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { logWorkoutSet } from "@/actions/workouts";
import { RestTimer } from "./rest-timer";
import type { WorkoutExercise } from "@/types/database";

interface SetLoggerProps {
  exercise: WorkoutExercise;
  workoutLogId: string | null;
  existingSets: Array<{
    set_number: number;
    reps: number | null;
    weight: number | null;
    completed: boolean;
  }>;
}

export function SetLogger({
  exercise,
  workoutLogId,
  existingSets,
}: SetLoggerProps) {
  const [sets, setSets] = useState(
    Array.from({ length: exercise.sets }, (_, i) => {
      const existing = existingSets.find((s) => s.set_number === i + 1);
      return {
        set_number: i + 1,
        reps: existing?.reps ?? 0,
        weight: existing?.weight ?? 0,
        completed: existing?.completed ?? false,
      };
    })
  );
  const [restingAfterSet, setRestingAfterSet] = useState<number | null>(null);

  async function handleSetComplete(index: number) {
    if (!workoutLogId) return;

    const set = sets[index];
    const newCompleted = !set.completed;
    const updated = [...sets];
    updated[index] = { ...set, completed: newCompleted };
    setSets(updated);

    if (newCompleted && set.reps > 0) {
      await logWorkoutSet({
        workout_log_id: workoutLogId,
        exercise_id: exercise.id,
        set_number: set.set_number,
        reps: set.reps,
        weight: set.weight,
      });
      if (exercise.rest_seconds && index < exercise.sets - 1) {
        setRestingAfterSet(index);
      }
    }
  }

  function updateSet(index: number, field: "reps" | "weight", value: number) {
    const updated = [...sets];
    updated[index] = { ...updated[index], [field]: value };
    setSets(updated);
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[2rem_1fr_1fr_auto] gap-2 border-b border-border/40 px-1 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:grid-cols-[2.25rem_1fr_1fr_auto]">
        <span className="text-center">#</span>
        <span>Weight (lb)</span>
        <span>Reps</span>
        <span className="text-center">Done</span>
      </div>
      {sets.map((set, i) => (
        <div key={set.set_number} className="space-y-1">
          <div className="grid grid-cols-[2rem_1fr_1fr_auto] items-center gap-2 sm:grid-cols-[2.25rem_1fr_1fr_auto]">
            <span className="w-6 text-center text-sm font-medium tabular-nums text-muted-foreground">
              {set.set_number}
            </span>
            <Input
              type="number"
              inputMode="decimal"
              value={set.weight || ""}
              onChange={(e) =>
                updateSet(i, "weight", parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              aria-label={`Set ${set.set_number} weight in pounds`}
              className="h-9 rounded-lg text-sm tabular-nums"
            />
            <Input
              type="number"
              inputMode="numeric"
              value={set.reps || ""}
              onChange={(e) =>
                updateSet(i, "reps", parseInt(e.target.value) || 0)
              }
              placeholder="0"
              aria-label={`Set ${set.set_number} reps`}
              className="h-9 rounded-lg text-sm tabular-nums"
            />
            <Checkbox
              checked={set.completed}
              onCheckedChange={() => handleSetComplete(i)}
              disabled={!workoutLogId}
            />
          </div>
          {restingAfterSet === i && exercise.rest_seconds && (
            <div className="ml-6">
              <RestTimer
                restSeconds={exercise.rest_seconds}
                autoStart
                onComplete={() => setRestingAfterSet(null)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
