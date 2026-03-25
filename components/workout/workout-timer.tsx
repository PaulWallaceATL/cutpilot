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
  return hrs > 0
    ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
    : `${pad(mins)}:${pad(secs)}`;
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
        accumulatedRef.current += Math.floor(
          (Date.now() - startTimeRef.current) / 1000
        );
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
  const ringDash = progress * 62.83;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/50 px-3 py-1 shadow-soft backdrop-blur-sm">
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
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card/90 p-6 shadow-soft backdrop-blur-sm",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-primary/[0.04]" />
      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/15">
              <Timer className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Session timer
            </span>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              running
                ? "bg-primary/12 text-primary"
                : seconds > 0
                  ? "bg-amber-500/12 text-amber-700 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                running
                  ? "animate-pulse bg-primary"
                  : seconds > 0
                    ? "bg-amber-500"
                    : "bg-muted-foreground/40"
              )}
            />
            {running ? "Active" : seconds > 0 ? "Paused" : "Ready"}
          </div>
        </div>

        <div className="mb-2 flex flex-col items-center gap-3">
          <div className="relative flex h-36 w-36 items-center justify-center">
            <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-border/80"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${ringDash} 62.83`}
                strokeLinecap="round"
                className="text-primary transition-[stroke-dasharray] duration-300"
              />
            </svg>
            <span className="relative font-mono text-4xl font-bold tabular-nums tracking-tight text-foreground sm:text-5xl">
              {formatTime(seconds)}
            </span>
          </div>
        </div>

        <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-muted/90 ring-1 ring-border/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/75 transition-[width] duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={toggleTimer}
            className={cn(
              "flex-1 gap-2 rounded-xl transition-[box-shadow,background-color]",
              running
                ? "border border-amber-500/25 bg-amber-500/10 text-amber-800 hover:bg-amber-500/15 dark:text-amber-300"
                : "bg-primary text-primary-foreground shadow-soft hover:shadow-elevated"
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
              className="shrink-0 rounded-xl"
              aria-label="Reset timer"
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
