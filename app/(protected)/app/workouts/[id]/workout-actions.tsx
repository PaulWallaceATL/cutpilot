"use client";

import { useState, useRef } from "react";
import { startWorkout, completeWorkout } from "@/actions/workouts";
import { Play, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WorkoutTimer } from "@/components/workout/workout-timer";

interface WorkoutActionsProps {
  workoutDayId: string;
  existingLogId: string | null;
}

export function WorkoutActions({
  workoutDayId,
  existingLogId,
}: WorkoutActionsProps) {
  const [logId, setLogId] = useState(existingLogId);
  const [loading, setLoading] = useState(false);
  const elapsedRef = useRef(0);
  const router = useRouter();

  async function handleStart() {
    setLoading(true);
    const result = await startWorkout(workoutDayId);
    if (result?.data) {
      setLogId(result.data.id);
      toast.success("Workout started! Log your sets below.");
    } else {
      toast.error(result?.error || "Failed to start");
    }
    setLoading(false);
  }

  async function handleComplete() {
    if (!logId) return;
    setLoading(true);
    const durationMinutes = Math.max(Math.round(elapsedRef.current / 60), 1);
    const result = await completeWorkout(logId, durationMinutes);
    if (result?.success) {
      toast.success(`Workout complete! Duration: ${durationMinutes} min`);
      router.refresh();
    } else {
      toast.error(result?.error || "Failed to complete");
    }
    setLoading(false);
  }

  if (!logId) {
    return (
      <Button
        onClick={handleStart}
        disabled={loading}
        size="lg"
        className="w-full rounded-xl bg-primary text-primary-foreground shadow-soft transition-[box-shadow,filter] hover:shadow-elevated hover:brightness-[1.02]"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        Start workout
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <WorkoutTimer
        isRunning={!!logId}
        onTimeUpdate={(secs) => {
          elapsedRef.current = secs;
        }}
      />
      <Button
        onClick={handleComplete}
        disabled={loading}
        size="lg"
        variant="outline"
        className="w-full rounded-xl border-2 border-primary/35 bg-background font-semibold text-primary shadow-none transition-colors hover:bg-primary/10"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="mr-2 h-4 w-4" />
        )}
        Complete workout
      </Button>
    </div>
  );
}
