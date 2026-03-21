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
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border/50 md:bg-card/80 md:backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2.5 border-b border-border/50 px-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 -m-1 rounded-full bg-primary/20 blur-md" />
          <Zap className="relative h-6 w-6 text-primary drop-shadow-sm" />
        </div>
        <span className="text-lg font-bold tracking-tight">CutPilot</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ease-out",
                "hover:scale-[1.02] hover:bg-muted/50 active:scale-[0.98]",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-primary to-primary/60" />
              )}
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
