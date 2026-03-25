"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestTimerProps {
  restSeconds: number;
  onComplete?: () => void;
  autoStart?: boolean;
  className?: string;
}

export function RestTimer({
  restSeconds,
  onComplete,
  autoStart = false,
  className,
}: RestTimerProps) {
  const [remaining, setRemaining] = useState(restSeconds);
  const [active, setActive] = useState(autoStart);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    targetRef.current = null;
  }, []);

  useEffect(() => {
    if (!active) {
      stop();
      return;
    }

    targetRef.current = Date.now() + remaining * 1000;
    intervalRef.current = setInterval(() => {
      if (targetRef.current == null) return;
      const left = Math.max(0, Math.ceil((targetRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        stop();
        setActive(false);
        setFinished(true);
        onComplete?.();
      }
    }, 100);

    return stop;
  }, [active, stop, onComplete, remaining]);

  function start() {
    setFinished(false);
    setActive(true);
  }

  function reset() {
    stop();
    setActive(false);
    setFinished(false);
    setRemaining(restSeconds);
  }

  function dismiss() {
    stop();
    setActive(false);
    setFinished(false);
    setRemaining(restSeconds);
  }

  const progress = 1 - remaining / restSeconds;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${mins}:${secs.toString().padStart(2, "0")}`;

  if (!active && !finished && remaining === restSeconds) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={start}
        className={cn("gap-1.5 text-xs text-muted-foreground hover:text-primary", className)}
      >
        <Play className="h-3 w-3" />
        Rest {restSeconds}s
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex items-center gap-2 rounded-full bg-primary/5 border border-primary/20 px-3 py-1.5">
        <svg className="h-5 w-5 -rotate-90" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted/50"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray={`${progress * 62.83} 62.83`}
            strokeLinecap="round"
            className="text-primary transition-all duration-200"
          />
        </svg>

        <span
          className={cn(
            "font-mono text-sm font-semibold tabular-nums",
            finished ? "text-primary" : "text-foreground"
          )}
        >
          {finished ? "Go!" : display}
        </span>

        {active && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
        )}
      </div>

      {finished ? (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={reset}>
          <RotateCcw className="h-3 w-3" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={dismiss}>
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
