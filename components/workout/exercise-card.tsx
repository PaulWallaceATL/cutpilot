"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { SetLogger } from "./set-logger";
import type { WorkoutExercise } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const imageUrl = exercise.exercise_image_url;

  return (
    <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="pb-2">
        {imageUrl ? (
          <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-lg border border-border/60 bg-muted/40">
            <Image
              src={imageUrl}
              alt={`Illustration: ${exercise.name}`}
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 560px"
            />
          </div>
        ) : null}
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
            <span className="flex items-center gap-1">
              <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
              {exercise.rest_seconds}s rest
            </span>
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
