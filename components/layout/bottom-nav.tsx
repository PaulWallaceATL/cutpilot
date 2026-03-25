"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app/today", label: "Today", icon: CalendarCheck },
  { href: "/app/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/app/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/app/progress", label: "Progress", icon: TrendingUp },
  { href: "/app/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/85 shadow-soft backdrop-blur-xl md:hidden"
      aria-label="Mobile"
    >
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-w-[3.25rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[11px] transition-[color,background-color] duration-200",
                isActive
                  ? "font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-[background-color,box-shadow] duration-200",
                  isActive
                    ? "bg-primary/12 shadow-soft ring-1 ring-primary/12"
                    : "bg-transparent"
                )}
              >
                <item.icon
                  className="h-[1.125rem] w-[1.125rem] stroke-[2.1]"
                  aria-hidden
                />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
