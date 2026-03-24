"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

/** Vertical crops — training, gym, running, nutrition, mobility, group fitness */
const trailImages = [
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=600&fit=crop",
];

export function CtaSection() {
  const trailerRef = useRef<HTMLDivElement>(null);
  const currentImageIndex = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastImageTime = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const movementThreshold = 100;
    const delayBetween = 70;

    const createImageTrail = (e: MouseEvent) => {
      if (!trailerRef.current || !sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < movementThreshold) return;

      const now = Date.now();
      if (
        lastImageTime.current !== 0 &&
        now - lastImageTime.current < delayBetween
      ) {
        return;
      }

      const img = document.createElement("img");
      img.src = trailImages[currentImageIndex.current]!;
      img.alt = "";
      img.className =
        "absolute pointer-events-none rounded-sm object-cover shadow-lg ring-1 ring-black/10";
      img.style.width = "150px";
      img.style.height = "225px";
      img.style.left = `${relativeX - 75}px`;
      img.style.top = `${relativeY - 112.5}px`;

      trailerRef.current.appendChild(img);

      currentImageIndex.current =
        (currentImageIndex.current + 1) % trailImages.length;

      gsap.fromTo(
        img,
        {
          opacity: 1,
          scale: 0,
          rotation: gsap.utils.random(-20, 20),
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(2)",
        },
      );

      gsap.to(img, {
        opacity: 1,
        scale: 0,
        duration: 0.6,
        delay: 0.6,
        ease: "power2.in",
        onComplete: () => img.remove(),
      });

      lastMousePos.current = { x: e.clientX, y: e.clientY };
      lastImageTime.current = now;
    };

    const section = sectionRef.current;
    if (!section) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    section.addEventListener("mousemove", createImageTrail);
    return () => section.removeEventListener("mousemove", createImageTrail);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-background"
      aria-label="Get started with CutPilot"
    >
      <div
        ref={trailerRef}
        className="pointer-events-none absolute inset-0 z-[30]"
        aria-hidden
      />

      <div className="relative z-[40] flex min-h-screen flex-col items-center justify-center px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto w-full max-w-2xl rounded-3xl border border-border/40 bg-background/75 px-6 py-10 text-center shadow-sm backdrop-blur-md sm:px-12 sm:py-12">
        <motion.h2
          className="mb-4 text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Ready to transform?
        </motion.h2>
        <motion.p
          className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground sm:mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2 }}
        >
          Move the cursor to explore — then start free. AI plans your training
          and nutrition; you show up and execute.
        </motion.p>

        <motion.div
          className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 hover:shadow-primary/35"
          >
            Get Started Now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded-xl border border-border bg-card px-8 py-4 text-base font-medium text-muted-foreground transition hover:border-primary/30 hover:bg-muted hover:text-foreground"
          >
            I have an account
          </Link>
        </motion.div>

        <motion.p
          className="mt-8 text-xs text-muted-foreground/80"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          Free to start · No credit card required
        </motion.p>
        <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground/70">
          Train smarter with AI
        </p>
        </div>
      </div>

    </section>
  );
}
