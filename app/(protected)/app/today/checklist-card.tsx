"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toggleChecklistItem, addChecklistItem, deleteChecklistItem } from "@/actions/checklist";
import {
  CheckCircle2,
  Plus,
  Trash2,
  Dumbbell,
  UtensilsCrossed,
  Droplets,
  Moon,
  Pill,
  Calendar,
} from "lucide-react";
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

const TYPE_ICONS: Record<string, typeof Calendar> = {
  workout: Dumbbell,
  meal: UtensilsCrossed,
  water: Droplets,
  sleep: Moon,
  supplement: Pill,
  custom: Calendar,
};

const TYPE_COLORS: Record<string, string> = {
  workout: "text-blue-500",
  meal: "text-emerald-500",
  water: "text-cyan-500",
  sleep: "text-violet-500",
  supplement: "text-amber-500",
  custom: "text-muted-foreground",
};

export function ChecklistCard({ checklist }: ChecklistCardProps) {
  const [items, setItems] = useState(
    [...checklist.checklist_items].sort((a, b) => a.order_index - b.order_index)
  );
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

  const completed = items.filter((i) => i.completed).length;
  const total = items.length;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  async function handleToggle(itemId: string, checked: boolean) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, completed: checked } : i))
    );
    if (checked) {
      setJustCompletedId(itemId);
      window.setTimeout(() => setJustCompletedId((id) => (id === itemId ? null : id)), 450);
    }
    await toggleChecklistItem(itemId, checked);
  }

  async function handleDelete(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await deleteChecklistItem(itemId);
  }

  async function handleAdd() {
    if (!newTitle.trim() || adding) return;
    setAdding(true);
    const result = await addChecklistItem(newTitle.trim());
    if (result?.success) {
      setItems((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          title: newTitle.trim(),
          item_type: "custom",
          completed: false,
          order_index: prev.length,
        },
      ]);
      setNewTitle("");
      setShowAdd(false);
    }
    setAdding(false);
  }

  return (
    <Card
      variant="glass"
      className="overflow-hidden transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-glass"
    >
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-section-title text-base">
            Daily checklist
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium tabular-nums text-muted-foreground">
              {completed}/{total}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={() => setShowAdd(!showAdd)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-muted/80 ring-1 ring-border/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 pb-5">
        {showAdd && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
            className="flex items-center gap-2 mb-2"
          >
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a task (e.g. Doctor at 3pm)"
              className="flex-1 h-9 text-sm"
              autoFocus
            />
            <Button type="submit" size="sm" disabled={adding || !newTitle.trim()}>
              Add
            </Button>
          </form>
        )}
        {items.map((item) => {
          const Icon = TYPE_ICONS[item.item_type] ?? Calendar;
          const iconColor = TYPE_COLORS[item.item_type] ?? "text-muted-foreground";
          return (
            <label
              key={item.id}
              className={cn(
                "group flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-background/40 p-3.5 transition-[background-color,box-shadow,border-color] duration-200",
                "hover:border-primary/20 hover:bg-muted/35 hover:shadow-soft",
                item.completed && "border-primary/25 bg-primary/[0.06]",
                justCompletedId === item.id && "animate-check-pop"
              )}
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={(checked) =>
                  handleToggle(item.id, checked === true)
                }
                className="transition-transform duration-150 data-[state=checked]:scale-100 group-hover:scale-[1.02]"
              />
              <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
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
              <div className="ml-auto flex items-center gap-1 shrink-0">
                {item.completed && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </label>
          );
        })}
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No tasks yet. Add items or ask your coach to build your day.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
