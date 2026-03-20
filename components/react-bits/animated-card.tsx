"use client";

import { Card } from "@/components/ui/card";
import { CardContent as UICardContent, CardHeader as UICardHeader, CardTitle as UICardTitle, CardFooter as UICardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { forwardRef, useState } from "react";

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  hoverEffect?: "glow" | "lift" | "scale" | "parallax";
  children: React.ReactNode;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, hoverEffect = "lift", children, ...props }, ref) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (hoverEffect === "parallax") {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const baseClasses = "transition-all duration-300";
    const effectClasses = {
      glow: "hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:border-primary/50",
      lift: "hover:-translate-y-1 hover:shadow-lg",
      scale: "hover:scale-[1.02]",
      parallax: "relative overflow-hidden",
    };

    return (
      <Card
        ref={ref}
        className={cn(baseClasses, effectClasses[hoverEffect], className)}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePosition({ x: 0, y: 0 });
        }}
        {...props}
      >
        {hoverEffect === "parallax" && isHovered && (
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(var(--primary-rgb), 0.1), transparent 50%)`,
            }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </Card>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

// Re-export UI card components for convenience
export const CardContent = UICardContent;
export const CardHeader = UICardHeader;
export const CardTitle = UICardTitle;
export const CardFooter = UICardFooter;
