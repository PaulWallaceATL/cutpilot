"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

const STEP_TITLES = ["Your Goals", "Body Metrics", "Preferences", "Injuries"];

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(`${STORAGE_KEY}_step`, step.toString());
    }
  }, [data, step]);

  useEffect(() => {
    const handleBeforeUnload = () => {
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
    
    const timeoutId = setTimeout(() => {
      setGenerating(false);
      toast.error("Plan generation is taking longer than expected. Please try again or check your OpenAI API key.");
    }, 120000);

    try {
      const result = await completeOnboarding(data);
      clearTimeout(timeoutId);
      
      console.log("Onboarding result:", result);
      
      if (result?.error) {
        toast.error(result.error);
        setGenerating(false);
        return;
      }
      
      if (result?.success) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(`${STORAGE_KEY}_step`);
        }
        toast.success("Profile setup complete! Redirecting...");
        setGenerating(false);
        setTimeout(() => {
          window.location.replace("/app/today");
        }, 300);
        return;
      }
      
      console.error("Unexpected result format:", result);
      setGenerating(false);
      toast.error("Unexpected response. Please check the console and try again.");
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

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="flex min-h-screen flex-col p-4">
      <div className="mx-auto w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 py-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-sm">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-heading">CutPilot Setup</span>
        </div>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Step {step + 1} of {TOTAL_STEPS}
          </span>
          <span className="text-sm font-semibold font-heading text-foreground">
            {STEP_TITLES[step]}
          </span>
        </div>
        <div className="relative mb-8 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="transition-opacity duration-300 ease-in-out">
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
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step < TOTAL_STEPS - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            >
              Generate My Plan
              <Zap className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
