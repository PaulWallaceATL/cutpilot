"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from "react";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

interface GlowButtonProps 
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  glowColor?: string;
  children?: ReactNode;
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, glowColor, children, ...props }, ref) => {
    const defaultGlow = "hsl(var(--primary))";
    const glow = glowColor || defaultGlow;
    
    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          className
        )}
        {...props}
      >
        <span
          className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 hover:opacity-100 blur-xl -z-10"
          style={{
            background: glow,
            filter: "blur(20px)",
          }}
        />
        <span className="relative z-10">{children}</span>
      </Button>
    );
  }
);

GlowButton.displayName = "GlowButton";
