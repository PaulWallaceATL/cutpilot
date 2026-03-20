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
import { AnimatedList } from "@/components/react-bits/animated-list";

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
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Zap className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">CutPilot</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <AnimatedList className="space-y-1" animation="slide" staggerDelay={50}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-300",
                  "hover:scale-105",
                  isActive
                    ? "bg-primary/10 text-primary font-medium shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  isActive && "scale-110"
                )} />
                {item.label}
              </Link>
            );
          })}
        </AnimatedList>
      </nav>
    </aside>
  );
}
