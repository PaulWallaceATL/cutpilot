"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  User,
  ShoppingCart,
  ScanLine,
  LayoutDashboard,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app/today", label: "Today", icon: CalendarCheck },
  { href: "/app/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/app/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/app/plan", label: "My Plan", icon: LayoutDashboard },
  { href: "/app/grocery", label: "Grocery", icon: ShoppingCart },
  { href: "/app/menu-scan", label: "Menu Scan", icon: ScanLine },
  { href: "/app/progress", label: "Progress", icon: TrendingUp },
  { href: "/app/profile", label: "Profile", icon: User },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border/50 md:bg-card/70 md:shadow-soft md:backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2.5 border-b border-border/50 px-4">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/18">
          <Zap className="h-[1.15rem] w-[1.15rem] text-primary" strokeWidth={2.25} />
        </div>
        <span className="text-lg font-semibold tracking-tight">CutPilot</span>
      </div>

      <nav className="flex-1 space-y-0.5 p-3" aria-label="Main">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-[background-color,color,box-shadow] duration-200",
                isActive
                  ? "bg-primary/12 font-medium text-primary shadow-soft ring-1 ring-primary/15"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary"
                  aria-hidden
                />
              )}
              <item.icon
                className={cn(
                  "h-[1.125rem] w-[1.125rem] shrink-0 stroke-[2.1]",
                  isActive && "text-primary"
                )}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
