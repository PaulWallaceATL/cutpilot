"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import StaggeredText from "@/components/react-bits/staggered-text";

const GradientBlob = dynamic(
  () => import("@/components/react-bits/gradient-blob"),
  { ssr: false }
);

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden py-24 md:py-36 lg:py-44">
      {/* Ambient background elements */}
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[800px] w-[800px] rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/[0.06] blur-[100px]" />
        <div className="absolute top-1/3 left-0 h-[300px] w-[300px] rounded-full bg-primary/[0.03] blur-[80px]" />
      </div>

      {/* Animated grid pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-[0.03]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ duration: 2 }}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Gradient blob (floating behind text) */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-30 md:opacity-40">
        <GradientBlob
          width={600}
          height={600}
          speed={0.4}
          primaryColor="#0d9488"
          secondaryColor="#14b8a6"
          accentColor="#5eead4"
          baseColor="#2dd4bf"
          size={0.8}
          morphIntensity={0.3}
          enableCursorMorph={false}
          breathe
          breatheDuration={4}
          breatheDelay={1}
          metallic={0.1}
          opacity={0.6}
          rotationSpeed={0.3}
          quality="medium"
          className="rounded-full"
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          AI-Powered Fitness &amp; Nutrition
        </motion.div>

        {/* Heading */}
        <div className="mb-8">
          <StaggeredText
            text="Your cut, executed."
            as="h1"
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]"
            segmentBy="words"
            delay={100}
            duration={0.7}
            direction="bottom"
            blur
            staggerDirection="forward"
          />
        </div>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.4, duration: 0.8, ease }}
          className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
        >
          CutPilot generates{" "}
          <span className="text-foreground font-medium">personalized plans</span>,
          tracks{" "}
          <span className="text-foreground font-medium">every rep and calorie</span>,
          and coaches you with{" "}
          <span className="text-foreground font-medium">contextual AI</span>{" "}
          — all in one premium app.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/signup"
            className="group relative inline-flex h-13 items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-8 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5"
          >
            Start Your Cut Free
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-13 items-center gap-2 rounded-2xl border border-border/60 bg-background/80 px-8 text-base font-medium text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:bg-muted hover:text-foreground hover:border-border"
          >
            <Play className="h-4 w-4" />
            I have an account
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground/60"
        >
          {["Free to start", "No credit card required", "AI-generated plans in seconds"].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-primary/40" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
