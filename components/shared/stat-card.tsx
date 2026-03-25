import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  className,
}: StatCardProps) {
  return (
    <Card
      variant="glass"
      className={cn(
        "transition-[box-shadow,transform,border-color] duration-200 ease-out hover:-translate-y-px hover:border-primary/15 hover:shadow-glass",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 ring-1 ring-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-stat-value text-xl tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
