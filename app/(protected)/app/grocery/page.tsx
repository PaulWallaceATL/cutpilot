import { createClient } from "@/lib/supabase/server";
import { GroceryListView } from "./grocery-list-view";
import { EmptyState } from "@/components/shared/empty-state";
import { GenerateButton } from "./generate-button";
import { ShoppingCart } from "lucide-react";

export default async function GroceryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: lists } = await supabase
    .from("grocery_lists")
    .select("*, grocery_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const latestList = lists?.[0];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading">Grocery List</h1>
            <p className="mt-1 text-muted-foreground">
              {latestList ? "Your shopping list from your meal plan" : "Generate a list from your meal plan"}
            </p>
          </div>
          <GenerateButton />
        </div>
      </div>

      {latestList ? (
        <GroceryListView list={latestList} />
      ) : (
        <EmptyState
          icon={ShoppingCart}
          title="No Grocery List"
          description="Generate a grocery list from your active meal plan."
          action={<GenerateButton />}
        />
      )}
    </div>
  );
}
