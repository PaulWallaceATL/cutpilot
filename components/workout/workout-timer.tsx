"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutTimerProps {
  isRunning?: boolean;
  onTimeUpdate?: (seconds: number) => void;
  className?: string;
  compact?: boolean;
}

function formatTime(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
}

export function WorkoutTimer({
  isRunning: externalRunning,
  onTimeUpdate,
  className,
  compact = false,
}: WorkoutTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);

  const tick = useCallback(() => {
    if (startTimeRef.current == null) return;
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const total = accumulatedRef.current + elapsed;
    setSeconds(total);
    onTimeUpdate?.(total);
  }, [onTimeUpdate]);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(tick, 250);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (startTimeRef.current != null) {
        accumulatedRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
        startTimeRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, tick]);

  useEffect(() => {
    if (externalRunning !== undefined) setRunning(externalRunning);
  }, [externalRunning]);

  function toggleTimer() {
    setRunning((r) => !r);
  }

  function resetTimer() {
    setRunning(false);
    setSeconds(0);
    accumulatedRef.current = 0;
    startTimeRef.current = null;
    onTimeUpdate?.(0);
  }

  const progress = Math.min(seconds / 3600, 1);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-1.5 rounded-full bg-muted/80 px-3 py-1">
          <Timer className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-sm font-semibold tabular-nums tracking-tight">
            {formatTime(seconds)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={toggleTimer}
        >
          {running ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Timer className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Workout Timer</span>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
              running
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : seconds > 0
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", running ? "bg-green-500 animate-pulse" : seconds > 0 ? "bg-amber-500" : "bg-muted-foreground/40")} />
            {running ? "Active" : seconds > 0 ? "Paused" : "Ready"}
          </div>
        </div>

        <div className="text-center mb-4">
          <span className="font-mono text-4xl font-bold tabular-nums tracking-tight">
            {formatTime(seconds)}
          </span>
        </div>

        <div className="h-1.5 w-full rounded-full bg-muted mb-5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={toggleTimer}
            className={cn(
              "flex-1 gap-2 transition-all",
              running
                ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20"
                : "bg-gradient-to-r from-primary to-primary/80 text-white border-0 hover:shadow-lg"
            )}
            variant={running ? "outline" : "default"}
          >
            {running ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                {seconds > 0 ? "Resume" : "Start"}
              </>
            )}
          </Button>
          {seconds > 0 && (
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              className="shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export { formatTime };
