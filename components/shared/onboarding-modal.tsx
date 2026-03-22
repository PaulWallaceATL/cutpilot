"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress?: number;
}

export function OnboardingModal({
  open,
  onOpenChange,
}: OnboardingModalProps) {
  const router = useRouter();

  function handleTraditional() {
    router.push("/onboarding");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70">
              <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <DialogTitle>Welcome to CutPilot!</DialogTitle>
          </div>
          <DialogDescription>
            Let&apos;s personalize your experience. You can set up your profile by chatting with CutPilot AI — just tell it about yourself and it&apos;ll handle everything.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <p className="text-sm font-medium">Recommended: Chat with AI</p>
            <p className="text-xs text-muted-foreground">
              Tap the <span className="text-primary font-medium">CutPilot AI</span> button (bottom-right) and say &quot;Help me set up my profile&quot;. It&apos;ll ask you questions, save your info, and generate your personalized plans.
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              onClick={handleTraditional}
              className="flex-1 text-xs"
            >
              Traditional Setup
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
            <Button onClick={() => onOpenChange(false)} className="flex-1 text-xs">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              I&apos;ll use AI Chat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
