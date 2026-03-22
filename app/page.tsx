import Link from "next/link";
import { Zap } from "lucide-react";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { StatsSection } from "@/components/landing/stats-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { CtaSection } from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CtaSection />
      </main>

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
