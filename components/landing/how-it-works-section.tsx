"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { UserPlus, Sparkles, Dumbbell, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Tell us about you",
    description:
      "Share your goals, experience, dietary preferences, and any injuries. Takes less than 2 minutes.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI generates your plan",
    description:
      "Our AI creates a personalized workout and meal plan optimized for your goals and constraints.",
  },
  {
    number: "03",
    icon: Dumbbell,
    title: "Train & track",
    description:
      "Follow your plan with built-in timers, set logging, and an AI coach available on every workout.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "See results",
    description:
      "Track progress with weight logs, photos, and analytics. AI adapts your plan as you improve.",
  },
];

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <section className="relative border-y border-border/30 bg-muted/20 py-24 md:py-32">
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-primary/[0.04] blur-[120px]" />
      </div>

      <div ref={ref} className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            How It Works
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            From signup to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              results
            </span>{" "}
            in minutes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No complicated setup. No guesswork. Just tell us your goals and start training.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.15 + i * 0.1,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative"
            >
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%+0.5rem)] w-[calc(100%-3rem)] h-px">
                  <div className="h-full w-full bg-gradient-to-r from-border to-transparent" />
                </div>
              )}

              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-[280px]">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
