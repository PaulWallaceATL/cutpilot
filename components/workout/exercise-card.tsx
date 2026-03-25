"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { SetLogger } from "./set-logger";
import type { WorkoutExercise } from "@/types/database";
import { getExerciseIllustrationDisplay } from "@/lib/workout/exercise-illustration-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

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
  const illustration = getExerciseIllustrationDisplay(exercise);

  const coachTip =
    exercise.weight_suggestion?.trim() ||
    (!exercise.weight_suggestion && exercise.notes?.trim()) ||
    null;

  return (
    <Card
      variant="elevated"
      className="overflow-hidden transition-[box-shadow,transform] duration-200 hover:-translate-y-px"
    >
      <div className="grid gap-0 md:grid-cols-[minmax(0,240px)_1fr] md:gap-0">
        <div
          className={
            illustration
              ? "relative aspect-[4/3] w-full border-b border-border/50 bg-gradient-to-b from-muted/45 to-muted/15 md:aspect-auto md:min-h-[220px] md:border-b-0 md:border-r md:border-border/50"
              : "relative flex min-h-[100px] w-full items-center justify-center border-b border-border/50 bg-muted/20 md:min-h-[200px] md:border-b-0 md:border-r md:border-border/50"
          }
        >
          {illustration ? (
            <Image
              src={illustration.src}
              alt={`Illustration: ${exercise.name}`}
              fill
              className="object-contain p-3 md:p-4"
              sizes="(max-width: 768px) 100vw, 240px"
              priority={false}
              unoptimized={illustration.unoptimized}
            />
          ) : (
            <span className="px-4 text-center text-xs text-muted-foreground">
              No illustration for this movement
            </span>
          )}
        </div>
        <div className="min-w-0">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base leading-snug">
                {exercise.name}
              </CardTitle>
              {exercise.muscle_group && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {exercise.muscle_group}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>
                {exercise.sets} sets × {exercise.reps} reps
              </span>
              {exercise.rest_seconds ? (
                <span className="flex items-center gap-1">
                  <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
                  {exercise.rest_seconds}s rest
                </span>
              ) : null}
            </div>
            {exercise.notes && exercise.weight_suggestion && (
              <p className="mt-1 text-xs text-muted-foreground">{exercise.notes}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {coachTip && (
              <div className="flex gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] px-3 py-2.5 text-xs leading-relaxed text-foreground/90">
                <Lightbulb
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                  aria-hidden
                />
                <p>
                  <span className="font-medium text-primary">Coach tip: </span>
                  {coachTip}
                </p>
              </div>
            )}
            <SetLogger
              exercise={exercise}
              workoutLogId={workoutLogId}
              existingSets={existingSets}
            />
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
