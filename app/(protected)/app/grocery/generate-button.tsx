"use client";

import { useState } from "react";
import { generateGroceryList } from "@/actions/grocery";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GradientButton } from "@/components/react-bits/gradient-button";

export function GenerateButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleGenerate() {
    setLoading(true);
    const result = await generateGroceryList();
    if (result?.success) {
      toast.success("Grocery list generated!");
      router.refresh();
    } else {
      toast.error(result?.error || "Failed to generate");
    }
    setLoading(false);
  }

  return (
    <GradientButton onClick={handleGenerate} disabled={loading} size="sm" gradient="blue">
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="mr-2 h-4 w-4" />
      )}
      Generate List
    </GradientButton>
  );
}
