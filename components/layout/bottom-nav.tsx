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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-1 text-xs transition-all duration-200 ease-out",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              <span className={cn(isActive && "font-medium")}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
