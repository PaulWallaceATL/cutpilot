"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ChromaCardProps extends React.ComponentProps<typeof Card> {
  intensity?: "low" | "medium" | "high";
  children: React.ReactNode;
}

export const ChromaCard = forwardRef<HTMLDivElement, ChromaCardProps>(
  ({ className, intensity = "medium", children, ...props }, ref) => {
    const intensityClasses = {
      low: "hover:shadow-[0_0_20px_rgba(147,51,234,0.2)]",
      medium: "hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:border-purple-500/30",
      high: "hover:shadow-[0_0_40px_rgba(147,51,234,0.4)] hover:border-purple-500/50",
    };

    return (
      <Card
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-500",
          "before:absolute before:inset-0 before:opacity-0 hover:before:opacity-100",
          "before:bg-gradient-to-br before:from-purple-500/10 before:via-pink-500/10 before:to-orange-500/10",
          "before:transition-opacity before:duration-500",
          intensityClasses[intensity],
          className
        )}
        {...props}
      >
        <div className="relative z-10">{children}</div>
      </Card>
    );
  }
);

ChromaCard.displayName = "ChromaCard";

export { CardContent, CardHeader, CardTitle, CardFooter };
