"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { OnboardingModal } from "./onboarding-modal";
import { createClient } from "@/lib/supabase/client";

export function OnboardingCheck() {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function checkOnboarding() {
      // Don't show modal on onboarding page itself or auth pages
      if (pathname === "/onboarding" || pathname === "/login" || pathname === "/signup") {
        setShowModal(false);
        setOnboardingCompleted(true);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setOnboardingCompleted(true);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      // If profile doesn't exist or onboarding not completed, show modal
      if (!profile || !profile.onboarding_completed) {
        setOnboardingCompleted(false);
        
        // Calculate progress based on what's filled in
        const { data: prefs } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        let filledSteps = 0;
        if (prefs) {
          if (prefs.fitness_goal) filledSteps++;
          if (prefs.age && prefs.height_cm && prefs.weight_kg) filledSteps++;
          if (prefs.workout_days_per_week && prefs.diet_type) filledSteps++;
          // Injuries are optional, so we don't count them
        }
        
        setProgress((filledSteps / 3) * 100);
        
        // Show modal after a short delay to let the page load
        // Show immediately on profile page
        const delay = pathname?.includes("/profile") ? 300 : 1000;
        setTimeout(() => setShowModal(true), delay);
      } else {
        setOnboardingCompleted(true);
        setShowModal(false);
      }
    }

    checkOnboarding();
  }, [pathname]);

  if (onboardingCompleted) return null;

  return (
    <OnboardingModal
      open={showModal}
      onOpenChange={setShowModal}
      progress={progress}
    />
  );
}
