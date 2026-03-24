"use client";

import { motion } from "motion/react";
import {
  Brain,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  ShoppingCart,
  ScanLine,
  Timer,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Plans",
    description:
      "Personalized workout and meal plans tailored to your goals, experience, and preferences.",
  },
  {
    icon: Dumbbell,
    title: "Workout Tracking",
    description:
      "Log every set and rep with stopwatch and rest timers. Progressive overload at a glance.",
  },
  {
    icon: UtensilsCrossed,
    title: "Meals & Macros",
    description:
      "Full meal plans with ingredients, prep steps, and one-tap logging.",
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    description:
      "Weight, photos, and trends so you can see the transformation over time.",
  },
  {
    icon: ShoppingCart,
    title: "Smart Grocery Lists",
    description:
      "Lists built from your meal plan. Check off items as you shop.",
  },
  {
    icon: ScanLine,
    title: "Menu Scanner",
    description:
      "Photo a restaurant menu for instant health-scored picks.",
  },
  {
    icon: Timer,
    title: "Workout Timers",
    description:
      "Session stopwatch plus rest countdowns between sets.",
  },
  {
    icon: Sparkles,
    title: "AI Coach",
    description:
      "Your companion for form, nutrition, motivation, and profile setup.",
  },
];

export function FeaturesSection() {
  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-8 lg:px-8 bg-background border-y border-border/30">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12 md:mb-16 lg:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-sm sm:text-base text-primary font-medium mb-4"
          >
            Features
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6"
          >
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              execute
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-base sm:text-lg text-muted-foreground max-w-xl"
          >
            One app for training, nutrition, and coaching — so you spend less
            time planning and more time moving.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 md:gap-x-8 md:gap-y-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-border/60 bg-card shadow-sm">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h3 className="text-base tracking-tight font-semibold text-foreground">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm tracking-tight font-normal max-w-[28ch] sm:max-w-none text-muted-foreground leading-relaxed line-clamp-3">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
