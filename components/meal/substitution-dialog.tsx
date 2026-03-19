"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { requestSubstitution } from "@/actions/meals";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SubstitutionDialogProps {
  mealId: string;
}

export function SubstitutionDialog({ mealId }: SubstitutionDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    setLoading(true);
    const result = await requestSubstitution(mealId, reason || undefined);
    if (result?.data) {
      toast.success("Meal substituted successfully!");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result?.error || "Failed to substitute");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 h-7 text-[0.8rem] font-medium hover:bg-muted hover:text-foreground transition-all outline-none gap-1">
        <RefreshCw className="h-4 w-4" />
        Swap Meal
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Swap This Meal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Why do you want to swap? (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. I don't like fish, too many ingredients, want something faster..."
            />
          </div>
          <p className="text-sm text-muted-foreground">
            AI will generate a replacement meal with similar macros that matches
            your preferences.
          </p>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding substitute...
              </>
            ) : (
              "Generate Substitute"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
