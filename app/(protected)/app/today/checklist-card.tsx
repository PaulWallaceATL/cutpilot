"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toggleChecklistItem } from "@/actions/checklist";
import { CheckCircle2 } from "lucide-react";
import { AnimatedCard, CardContent, CardHeader, CardTitle } from "@/components/react-bits/animated-card";
import { AnimatedList } from "@/components/react-bits/animated-list";
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
    <AnimatedCard hoverEffect="glow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Daily Checklist</CardTitle>
          <span className="text-sm text-muted-foreground">
            {completed}/{total}
          </span>
        </div>
        <Progress value={pct} className="h-2 transition-all duration-500" />
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatedList animation="fade" staggerDelay={50}>
          {items.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-muted/50 hover:scale-[1.02] cursor-pointer"
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={(checked) =>
                  handleToggle(item.id, checked === true)
                }
              />
              <span
                className={cn(
                  "transition-all duration-300",
                  item.completed
                    ? "line-through text-muted-foreground"
                    : ""
                )}
              >
                {item.title}
              </span>
              {item.completed && (
                <CheckCircle2 className="ml-auto h-4 w-4 text-green-500 animate-in fade-in zoom-in duration-300" />
              )}
            </label>
          ))}
        </AnimatedList>
      </CardContent>
    </AnimatedCard>
  );
}
