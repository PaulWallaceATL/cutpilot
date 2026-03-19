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
    <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Zap className="h-5 w-5 text-primary" />
        <span className="font-bold">CutPilot</span>
      </div>

      <div className="hidden md:block" />

      <DropdownMenu>
        <DropdownMenuTrigger className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted outline-none">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
            {user?.email}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => logout()}
            className="text-destructive"
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
