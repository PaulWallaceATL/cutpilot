"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef, type ReactNode } from "react";

interface GradientButtonProps extends ButtonProps {
  gradient?: "primary" | "rainbow" | "purple" | "blue";
  children?: ReactNode;
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, gradient = "primary", children, ...props }, ref) => {
    const gradients = {
      primary: "from-primary via-primary/80 to-primary/60",
      rainbow: "from-purple-500 via-pink-500 to-orange-500",
      purple: "from-purple-500 to-pink-500",
      blue: "from-blue-500 to-cyan-500",
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden bg-gradient-to-r",
          gradients[gradient],
          "text-white border-0",
          "hover:shadow-lg hover:scale-105 transition-all duration-300",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent",
          "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </Button>
    );
  }
);

GradientButton.displayName = "GradientButton";
