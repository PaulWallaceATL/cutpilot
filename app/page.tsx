import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { StatsSection } from "@/components/landing/stats-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { CtaSection } from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      {/* ── Nav ── */}
      <header className="fixed top-0 z-50 w-full border-b border-border/30 bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 -m-1.5 rounded-full bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Zap className="relative h-6 w-6 text-primary drop-shadow-sm transition-transform duration-200 group-hover:scale-110" />
            </div>
            <span className="text-xl font-bold tracking-tight">CutPilot</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CtaSection />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-2.5">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold tracking-tight">CutPilot</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              AI-powered fitness and nutrition coaching. Personalized plans, smart tracking, and real-time guidance.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">Log in</Link>
              <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
            </div>
            <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-border to-transparent" />
            <p className="text-xs text-muted-foreground/60">
              &copy; {new Date().getFullYear()} CutPilot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
