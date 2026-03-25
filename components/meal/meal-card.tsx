import { Badge } from "@/components/ui/badge";
import type { Meal } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MealCardProps {
  meal: Meal;
}

export function MealCard({ meal }: MealCardProps) {
  return (
    <Card
      variant="elevated"
      className="transition-[box-shadow,transform] duration-200 hover:-translate-y-px"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{meal.name}</CardTitle>
          <Badge variant="outline" className="capitalize">
            {meal.meal_type}
          </Badge>
        </div>
        {meal.description && (
          <p className="text-sm text-muted-foreground">{meal.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-lg bg-orange-500/10 p-2">
            <p className="text-xs text-muted-foreground">Calories</p>
            <p className="text-sm font-bold">{meal.calories}</p>
          </div>
          <div className="rounded-lg bg-blue-500/10 p-2">
            <p className="text-xs text-muted-foreground">Protein</p>
            <p className="text-sm font-bold">{meal.protein_g}g</p>
          </div>
          <div className="rounded-lg bg-primary/10 p-2">
            <p className="text-xs text-muted-foreground">Carbs</p>
            <p className="text-sm font-bold">{meal.carbs_g}g</p>
          </div>
          <div className="rounded-lg bg-yellow-500/10 p-2">
            <p className="text-xs text-muted-foreground">Fat</p>
            <p className="text-sm font-bold">{meal.fat_g}g</p>
          </div>
        </div>
        {meal.prep_time_minutes && (
          <p className="mt-3 text-xs text-muted-foreground">
            Prep time: {meal.prep_time_minutes} minutes
          </p>
        )}
      </CardContent>
    </Card>
  );
}
