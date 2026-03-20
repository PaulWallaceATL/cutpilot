"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  animation?: "fade" | "slide" | "scale";
}

export function AnimatedList({
  children,
  className,
  staggerDelay = 100,
  animation = "fade",
}: AnimatedListProps) {
  const [visibleItems, setVisibleItems] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleItems(children.length);
    }, 100);

    return () => clearTimeout(timer);
  }, [children.length]);

  const animationClasses = {
    fade: "opacity-0 translate-y-4",
    slide: "opacity-0 -translate-x-4",
    scale: "opacity-0 scale-95",
  };

  const visibleClasses = {
    fade: "opacity-100 translate-y-0",
    slide: "opacity-100 translate-x-0",
    scale: "opacity-100 scale-100",
  };

  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(
            "transition-all duration-500",
            visibleItems > index
              ? visibleClasses[animation]
              : animationClasses[animation]
          )}
          style={{
            transitionDelay: `${index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
