"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SetLogger } from "./set-logger";
import type { WorkoutExercise } from "@/types/database";

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  workoutLogId: string | null;
  existingSets: Array<{
    set_number: number;
    reps: number | null;
    weight: number | null;
    completed: boolean;
  }>;
}

export function ExerciseCard({
  exercise,
  workoutLogId,
  existingSets,
}: ExerciseCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{exercise.name}</CardTitle>
          {exercise.muscle_group && (
            <Badge variant="outline" className="text-xs">
              {exercise.muscle_group}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            {exercise.sets} sets x {exercise.reps} reps
          </span>
          {exercise.rest_seconds && (
            <span>{exercise.rest_seconds}s rest</span>
          )}
        </div>
        {exercise.notes && (
          <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>
        )}
      </CardHeader>
      <CardContent>
        <SetLogger
          exercise={exercise}
          workoutLogId={workoutLogId}
          existingSets={existingSets}
        />
      </CardContent>
    </Card>
  );
}
