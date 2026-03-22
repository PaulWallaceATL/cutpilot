"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight, Zap } from "lucide-react";

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/[0.06] blur-[120px]" />
      </div>

      <div ref={ref} className="relative mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 md:p-16 text-center"
        >
          {/* Inner glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-primary/10 blur-[80px]" />
          <div className="absolute -bottom-16 right-0 h-32 w-64 rounded-full bg-primary/5 blur-[60px]" />

          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-xl shadow-primary/25"
            >
              <Zap className="h-8 w-8 text-primary-foreground" />
            </motion.div>

            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Ready to transform?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
              Join CutPilot and let AI handle the planning while you handle the execution. Your goals are closer than you think.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="group relative inline-flex h-13 items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-8 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5"
              >
                Get Started Now
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-13 items-center rounded-2xl border border-border/60 bg-background/80 px-8 text-base font-medium text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:bg-muted hover:text-foreground hover:border-border"
              >
                I have an account
              </Link>
            </div>

            <p className="mt-6 text-xs text-muted-foreground/60">
              Free to start &bull; No credit card required
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
