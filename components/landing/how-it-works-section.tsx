"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const cards = [
  {
    number: 1,
    title: "Tell us about you",
    link: "Get started free",
    href: "/signup",
    items: [
      "Goals, experience, and schedule",
      "Body stats and diet preferences",
      "Injuries and equipment",
    ],
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    number: 2,
    title: "AI builds your plan",
    link: "See how plans work",
    href: "/signup",
    items: [
      "Weekly workout split & exercises",
      "Meals with macros & grocery list",
      "Targets tuned to your goal",
    ],
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop",
  },
  {
    number: 3,
    title: "Train, eat, improve",
    link: "Open the app",
    href: "/signup",
    items: [
      "Log sets with timers & rest",
      "Check off meals and hydration",
      "Chat with AI anytime",
    ],
    image:
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop",
  },
];

export function HowItWorksSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section
      className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-muted/20"
      aria-label="How it works"
    >
      <div className="max-w-[1400px] mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-3"
        >
          How it works
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="text-center text-muted-foreground max-w-lg mx-auto mb-10 sm:mb-12 lg:mb-16"
        >
          From first signup to daily habits — CutPilot keeps you on track.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-10 sm:mb-12 lg:mb-16">
          {cards.map((card, idx) => (
            <motion.article
              key={card.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative overflow-hidden rounded-2xl bg-card border border-border/50 min-h-[400px] sm:min-h-[450px] lg:min-h-[500px] flex flex-col cursor-pointer"
              onMouseEnter={() => setHoveredCard(card.number)}
              onMouseLeave={() => setHoveredCard(null)}
              aria-label={`Step ${card.number}: ${card.title}`}
            >
              <motion.div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${card.image})` }}
                initial={false}
                animate={{
                  opacity: hoveredCard === card.number ? 1 : 0.42,
                  scale: hoveredCard === card.number ? 1 : 1.04,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/10"
                initial={false}
                animate={{
                  opacity: hoveredCard === card.number ? 0.82 : 0,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />

              <div className="relative z-10 flex flex-col h-full pt-6 sm:pt-8 px-6 sm:px-8">
                <div className="flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-4 transition-colors duration-300 ${
                      hoveredCard === card.number
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    {card.number}
                  </div>

                  <h3
                    className={`text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight leading-tight mb-2 transition-colors duration-300 ${
                      hoveredCard === card.number
                        ? "text-white drop-shadow-sm"
                        : "text-foreground"
                    }`}
                  >
                    {card.title}
                  </h3>

                  <Link
                    href={card.href}
                    className={`inline-flex items-center gap-2 text-sm font-medium transition-colors duration-300 group ${
                      hoveredCard === card.number
                        ? "text-white/95 hover:text-white"
                        : "text-primary hover:text-primary/80"
                    }`}
                  >
                    {card.link}
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>

                <div className="mt-auto -mx-6 sm:-mx-8">
                  {card.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className={`py-3 px-6 border-t transition-colors duration-300 ${
                        hoveredCard === card.number
                          ? "border-white/25 text-white/95 bg-black/25 backdrop-blur-[2px]"
                          : "border-border/60 text-muted-foreground"
                      }`}
                    >
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group text-sm sm:text-base"
          >
            <span>
              Ready? Create your account and start your cut in minutes.
            </span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
