import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-t-primary/60 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.6s" }} />
      </div>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto h-16 w-16">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-glow" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-primary/60 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.6s" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">Loading CutPilot...</p>
      </div>
    </div>
  );
}
