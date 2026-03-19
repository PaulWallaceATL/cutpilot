import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MealIngredient } from "@/types/database";

interface IngredientListProps {
  ingredients: MealIngredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  const sorted = [...ingredients].sort((a, b) => a.order_index - b.order_index);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Ingredients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sorted.map((ing) => (
            <div
              key={ing.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{ing.name}</span>
              </div>
              <span className="text-muted-foreground">
                {ing.amount} {ing.unit}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
