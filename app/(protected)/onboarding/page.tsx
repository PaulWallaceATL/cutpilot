"use client";

import { useState } from "react";
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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<OnboardingFormData>({
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
  });

  function updateField(field: string, value: unknown) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setGenerating(true);
    const result = await completeOnboarding(data);
    if (result?.error) {
      toast.error(result.error);
      setGenerating(false);
    } else if (result?.success) {
      toast.success("Profile setup complete! Generating your plan...");
      router.push("/app/today");
      router.refresh();
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
