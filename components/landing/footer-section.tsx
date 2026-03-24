"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Zap } from "lucide-react";

const footerCards = [
  {
    title: "Features",
    links: [
      { text: "AI Workout Plans", href: "/signup" },
      { text: "Meal Planning", href: "/signup" },
      { text: "Progress Tracking", href: "/signup" },
      { text: "Menu Scanner", href: "/signup" },
    ],
  },
  {
    title: "Product",
    links: [
      { text: "Get Started", href: "/signup", external: true },
      { text: "Log In", href: "/login" },
      { text: "Pricing", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { text: "Privacy Policy", href: "#" },
      { text: "Terms of Service", href: "#" },
      { text: "Contact", href: "#" },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FooterSection() {
  return (
    <footer className="relative w-full overflow-hidden bg-background border-t border-border/30 py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-6"
        >
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
            {/* Branding */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col justify-between space-y-6 mb-6 lg:mb-0"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold tracking-tight">
                  CutPilot
                </span>
              </div>

              <div>
                <h3 className="text-lg font-medium tracking-tight sm:text-xl">
                  Your cut,
                  <br />
                  executed.
                </h3>
              </div>

              <div className="mt-auto">
                <p className="text-sm text-muted-foreground">
                  AI-powered fitness &amp; nutrition &copy; {new Date().getFullYear()}
                </p>
              </div>
            </motion.div>

            {/* Link columns */}
            {footerCards.map((card, index) => {
              let marginClass = "";
              if (index > 0) marginClass = "-mt-px";
              if (index === 0) marginClass += " md:mt-0";
              else if (index === 1) marginClass += " md:-mt-px md:ml-0";
              else if (index === 2) marginClass += " md:-mt-px md:-ml-px";
              marginClass += " lg:mt-0";
              if (index > 0) marginClass += " lg:-ml-px";

              return (
                <motion.div
                  key={card.title}
                  variants={itemVariants}
                  className={`group relative min-h-[250px] overflow-hidden border border-border/60 p-6 transition-colors hover:bg-muted/30 sm:p-8 ${marginClass}`}
                >
                  <h4 className="mb-6 text-sm font-medium tracking-tight sm:text-base">
                    {card.title}
                  </h4>
                  <ul className="space-y-3">
                    {card.links.map((link) => (
                      <li key={link.text}>
                        <Link
                          href={link.href}
                          className="inline-flex font-light items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground sm:text-base"
                        >
                          {link.text}
                          {link.external && (
                            <ArrowUpRight className="h-3 w-3" />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          {/* Large wordmark — brand green band */}
          <motion.div
            variants={itemVariants}
            className="relative -mx-4 flex items-center justify-center overflow-hidden rounded-2xl bg-primary py-8 sm:-mx-6 sm:py-12 md:py-16 lg:-mx-8"
          >
            <div className="w-full px-4 select-none sm:px-6 lg:px-8" aria-hidden="true">
              <p className="text-[clamp(3rem,12vw,10rem)] font-bold tracking-tighter text-center leading-none text-primary-foreground/30">
                CUTPILOT
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
