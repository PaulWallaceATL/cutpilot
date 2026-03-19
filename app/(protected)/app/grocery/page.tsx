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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Grocery List</h1>
        <GenerateButton />
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
