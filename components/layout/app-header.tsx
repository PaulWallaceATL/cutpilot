"use client";

import { Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/hooks/use-user";
import { logout } from "@/actions/auth";

export function AppHeader() {
  const { user } = useUser();
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="flex h-14 items-center justify-between border-b border-border/50 bg-background/85 px-4 shadow-soft backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-2.5 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 ring-1 ring-primary/15">
          <Zap className="h-[1.05rem] w-[1.05rem] text-primary" strokeWidth={2.25} />
        </div>
        <span className="text-base font-semibold tracking-tight">CutPilot</span>
      </div>

      <div className="hidden md:block" />

      <DropdownMenu>
        <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-full outline-none ring-2 ring-primary/30 ring-offset-2 ring-offset-background transition-all duration-200 hover:ring-primary/50">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[180px] border-border/50 bg-card/95 backdrop-blur-xl"
        >
          <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
            {user?.email}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => logout()}
            className="text-destructive focus:text-destructive"
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
