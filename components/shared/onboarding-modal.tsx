"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress?: number;
}

export function OnboardingModal({
  open,
  onOpenChange,
  progress = 0,
}: OnboardingModalProps) {
  const router = useRouter();

  function handleStart() {
    router.push("/onboarding");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-primary" />
            <DialogTitle>Complete Your Profile</DialogTitle>
          </div>
          <DialogDescription>
            Set up your fitness goals, preferences, and body stats to get
            personalized workout and meal plans.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Setup Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Complete these steps:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Set your fitness goals</li>
              <li>Enter your body stats</li>
              <li>Choose preferences</li>
              <li>Add any injuries/limitations</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Later
            </Button>
            <Button onClick={handleStart} className="flex-1">
              Start Setup
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
