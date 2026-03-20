"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StepGoals } from "@/components/onboarding/step-goals";
import { StepBody } from "@/components/onboarding/step-body";
import { StepPreferences } from "@/components/onboarding/step-preferences";
import { StepInjuries } from "@/components/onboarding/step-injuries";
import { StepGenerating } from "@/components/onboarding/step-generating";
import { completeOnboarding } from "@/actions/onboarding";
import { Zap, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { OnboardingFormData } from "@/lib/schemas/onboarding";

const TOTAL_STEPS = 4;
const STORAGE_KEY = "cutpilot_onboarding_data";

const defaultData: OnboardingFormData = {
  fitness_goal: "lose_fat",
  experience_level: "beginner",
  age: 25,
  sex: "male",
  height_cm: 175,
  weight_kg: 80,
  target_weight_kg: 75,
  activity_level: "moderate",
  workout_days_per_week: 4,
  workout_duration_minutes: 60,
  available_equipment: [],
  dietary_restrictions: [],
  diet_type: "flexible",
  meals_per_day: 3,
  injuries: [],
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`${STORAGE_KEY}_step`);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<OnboardingFormData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return { ...defaultData, ...JSON.parse(saved) };
        } catch {
          return defaultData;
        }
      }
    }
    return defaultData;
  });

  // Persist form data to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(`${STORAGE_KEY}_step`, step.toString());
    }
  }, [data, step]);

  // Clear storage on successful completion
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Don't clear if we're generating (might be in progress)
      if (!generating) {
        // Keep data for a bit in case of accidental refresh
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [generating]);

  function updateField(field: string, value: unknown) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setGenerating(true);
    
    // Client-side timeout (2 minutes)
    const timeoutId = setTimeout(() => {
      setGenerating(false);
      toast.error("Plan generation is taking longer than expected. Please try again or check your OpenAI API key.");
    }, 120000); // 2 minutes

    try {
      const result = await completeOnboarding(data);
      clearTimeout(timeoutId);
      
      if (result?.error) {
        toast.error(result.error);
        setGenerating(false);
      } else if (result?.success) {
        // Clear stored data on success
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(`${STORAGE_KEY}_step`);
        }
        toast.success("Profile setup complete! Redirecting...");
        router.push("/app/today");
        router.refresh();
      }
    } catch (error) {
      clearTimeout(timeoutId);
      setGenerating(false);
      console.error("Onboarding error:", error);
      toast.error(
        error instanceof Error 
          ? `Failed to complete setup: ${error.message}`
          : "Failed to complete setup. Please try again."
      );
    }
  }

  if (generating) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <StepGenerating />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col p-4">
      <div className="mx-auto w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 py-6">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-bold">CutPilot Setup</span>
        </div>

        <Progress value={((step + 1) / TOTAL_STEPS) * 100} className="mb-8" />

        {step === 0 && (
          <StepGoals
            data={data}
            onChange={(field, value) => updateField(field, value)}
          />
        )}
        {step === 1 && (
          <StepBody
            data={data}
            onChange={(field, value) => updateField(field, value)}
          />
        )}
        {step === 2 && (
          <StepPreferences
            data={data}
            onChange={(field, value) => updateField(field, value)}
          />
        )}
        {step === 3 && (
          <StepInjuries
            injuries={data.injuries}
            onChange={(injuries) => updateField("injuries", injuries)}
          />
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step < TOTAL_STEPS - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              Generate My Plan
              <Zap className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
