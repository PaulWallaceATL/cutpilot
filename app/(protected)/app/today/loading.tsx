export default function TodayLoading() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="relative space-y-3">
          <div className="h-8 w-32 rounded-lg bg-primary/10 animate-pulse" />
          <div className="h-5 w-48 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl ring-1 ring-foreground/10 bg-card p-4 space-y-3"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                <div className="h-5 w-10 rounded bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="rounded-xl ring-1 ring-foreground/10 bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
          <div className="h-4 w-12 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-muted/50 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
