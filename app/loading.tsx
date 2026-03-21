export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="relative mx-auto h-20 w-20">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-glow" />
          <div className="absolute inset-0 rounded-full border-[3px] border-primary/20" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-2.5 rounded-full border-2 border-transparent border-t-primary/60 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.6s" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-xl font-bold tracking-tight">CutPilot</h2>
        <p className="mt-2 text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
