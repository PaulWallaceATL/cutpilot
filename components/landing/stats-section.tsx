"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const stats = [
  {
    label: "Workouts Generated",
    value: "10,000+",
    highlight: false,
  },
  {
    label: "Meals Planned",
    value: "50,000+",
    highlight: false,
  },
  {
    label: "Goal Achievement",
    value: "98%",
    highlight: false,
  },
  {
    label: "User Rating",
    value: "4.9/5",
    highlight: true,
  },
];

export function StatsSection() {
  return (
    <section className="w-full bg-background px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Left Column */}
          <div className="flex flex-col lg:justify-between lg:min-h-[400px]">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-page-title text-4xl leading-tight sm:text-5xl md:text-6xl"
            >
              Built for{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                results
              </span>
            </motion.h2>

            <div className="space-y-6 sm:space-y-8 mt-8 lg:mt-0">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md"
              >
                CutPilot combines AI coaching with precision tracking to deliver
                measurable results. Join thousands hitting their goals.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-sm sm:text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 w-fit"
                >
                  Start your transformation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Right Column - Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className="relative rounded-3xl border border-border/60 shadow-sm overflow-hidden p-6 min-h-[180px] sm:min-h-[200px] flex flex-col justify-between bg-card"
              >
                {/* Dot pattern */}
                <div
                  className="absolute inset-0 z-0 opacity-[0.35] dark:opacity-100"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, hsl(var(--primary) / 0.12) 1px, transparent 0)",
                    backgroundSize: "14px 14px",
                  }}
                />
                <div
                  className="absolute inset-0 z-0 opacity-0 dark:opacity-100 transition-opacity"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, hsl(var(--primary) / 0.06) 1px, transparent 0)",
                    backgroundSize: "14px 14px",
                  }}
                />

                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm sm:text-base ${
                        stat.highlight
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stat.label}
                    </p>
                    {stat.highlight && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter ${
                      stat.highlight
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
