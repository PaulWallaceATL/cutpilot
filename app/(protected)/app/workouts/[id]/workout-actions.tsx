"use client";

import { useState } from "react";
import { startWorkout, completeWorkout } from "@/actions/workouts";
import { Play, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GradientButton } from "@/components/react-bits/gradient-button";

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
  const [startTime] = useState(Date.now());
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
    const durationMinutes = Math.round((Date.now() - startTime) / 60000);
    const result = await completeWorkout(logId, Math.max(durationMinutes, 1));
    if (result?.success) {
      toast.success("Workout complete!");
      router.refresh();
    } else {
      toast.error(result?.error || "Failed to complete");
    }
    setLoading(false);
  }

  if (!logId) {
    return (
      <GradientButton onClick={handleStart} disabled={loading} className="w-full" gradient="rainbow">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        Start Workout
      </GradientButton>
    );
  }

  return (
    <GradientButton
      onClick={handleComplete}
      disabled={loading}
      className="w-full"
      gradient="primary"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle className="mr-2 h-4 w-4" />
      )}
      Complete Workout
    </GradientButton>
  );
}
