"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef, type ComponentProps } from "react";

type ButtonProps = ComponentProps<typeof Button>;

interface GlowButtonProps extends ButtonProps {
  glowColor?: string;
}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, glowColor, children, ...props }, ref) => {
    const glow = glowColor || "hsl(var(--primary))";

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
