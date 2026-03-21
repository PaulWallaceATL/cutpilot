"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleChecklistItem } from "@/actions/checklist";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  title: string;
  item_type: string;
  completed: boolean;
  order_index: number;
}

interface ChecklistCardProps {
  checklist: {
    id: string;
    date: string;
    checklist_items: ChecklistItem[];
  };
}

export function ChecklistCard({ checklist }: ChecklistCardProps) {
  const [items, setItems] = useState(
    [...checklist.checklist_items].sort((a, b) => a.order_index - b.order_index)
  );

  const completed = items.filter((i) => i.completed).length;
  const total = items.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  async function handleToggle(itemId: string, checked: boolean) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, completed: checked } : i))
    );
    await toggleChecklistItem(itemId, checked);
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Daily Checklist</CardTitle>
          <span className="text-sm font-medium tabular-nums text-muted-foreground">
            {completed}/{total}
          </span>
        </div>
        <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
          {pct > 0 && pct < 100 && (
            <div
              className="absolute top-0 h-full w-4 animate-pulse rounded-full bg-white/30 blur-sm"
              style={{ left: `calc(${pct}% - 8px)` }}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 pb-5">
        {items.map((item) => (
          <label
            key={item.id}
            className={cn(
              "group flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all duration-300",
              "hover:bg-muted/50 hover:shadow-sm hover:border-primary/20",
              item.completed && "bg-green-500/5 border-green-500/20"
            )}
          >
            <Checkbox
              checked={item.completed}
              onCheckedChange={(checked) =>
                handleToggle(item.id, checked === true)
              }
              className="transition-transform duration-200 group-hover:scale-110"
            />
            <span
              className={cn(
                "flex-1 text-sm transition-all duration-300",
                item.completed
                  ? "line-through text-muted-foreground"
                  : "group-hover:translate-x-0.5"
              )}
            >
              {item.title}
            </span>
            {item.completed && (
              <CheckCircle2 className="ml-auto h-4 w-4 text-green-500 transition-all duration-300 animate-in fade-in zoom-in-50" />
            )}
          </label>
        ))}
      </CardContent>
    </Card>
  );
}
