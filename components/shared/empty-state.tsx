"use client";

import type { LucideIcon } from "lucide-react";
import { AnimatedCard } from "@/components/react-bits/animated-card";
import { StaggeredText } from "@/components/react-bits/staggered-text";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <AnimatedCard hoverEffect="glow" className="flex flex-col items-center justify-center border-dashed p-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/50 transition-transform hover:scale-110" />
      <h3 className="mt-4 text-lg font-semibold">
        <StaggeredText text={title} as="span" />
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </AnimatedCard>
  );
}
