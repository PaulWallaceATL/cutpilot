"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toggleGroceryItem } from "@/actions/grocery";

interface GroceryItem {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  category: string | null;
  checked: boolean;
}

interface GroceryListViewProps {
  list: {
    id: string;
    name: string;
    grocery_items: GroceryItem[];
  };
}

export function GroceryListView({ list }: GroceryListViewProps) {
  const [items, setItems] = useState(list.grocery_items);

  const categories = [...new Set(items.map((i) => i.category || "Other"))];
  const grouped = categories.reduce(
    (acc, cat) => {
      acc[cat] = items.filter((i) => (i.category || "Other") === cat);
      return acc;
    },
    {} as Record<string, GroceryItem[]>
  );

  const checkedCount = items.filter((i) => i.checked).length;

  async function handleToggle(itemId: string, checked: boolean) {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, checked } : i))
    );
    await toggleGroceryItem(itemId, checked);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {checkedCount} of {items.length} items checked
        </span>
      </div>

      {categories.sort().map((category) => (
        <Card key={category}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Badge variant="outline">{category}</Badge>
              <span className="text-xs text-muted-foreground">
                {grouped[category].length} items
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {grouped[category].map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 rounded p-2 transition-colors hover:bg-muted/50 cursor-pointer"
              >
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={(checked) =>
                    handleToggle(item.id, checked === true)
                  }
                />
                <span
                  className={
                    item.checked
                      ? "line-through text-muted-foreground flex-1"
                      : "flex-1"
                  }
                >
                  {item.name}
                </span>
                {item.quantity && (
                  <span className="text-sm text-muted-foreground">
                    {item.quantity} {item.unit}
                  </span>
                )}
              </label>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
