"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface StaggeredTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
}

export function StaggeredText({
  text,
  className,
  delay = 0,
  staggerDelay = 50,
  as: Component = "span",
}: StaggeredTextProps) {
  const [visibleChars, setVisibleChars] = useState(0);
  const chars = text.split("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleChars(chars.length);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, chars.length]);

  return (
    <Component className={className}>
      {chars.map((char, index) => (
        <span
          key={index}
          className={cn(
            "inline-block transition-all duration-300",
            visibleChars > index
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          )}
          style={{
            transitionDelay: `${index * staggerDelay}ms`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Component>
  );
}
