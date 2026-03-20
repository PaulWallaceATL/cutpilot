"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GradientButton } from "@/components/react-bits/gradient-button";
import { AnimatedCard } from "@/components/react-bits/animated-card";
import { StaggeredText } from "@/components/react-bits/staggered-text";

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await signup(formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success("Account created! Redirecting...");
        router.push("/onboarding");
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="flex items-center justify-center gap-2 mb-8">
        <Zap className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">CutPilot</span>
      </div>

      <AnimatedCard hoverEffect="glow" className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            <StaggeredText text="Create your account" as="span" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="John Doe"
                required
                className="transition-all focus:scale-[1.02]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="transition-all focus:scale-[1.02]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                minLength={6}
                required
                className="transition-all focus:scale-[1.02]"
              />
            </div>
            <GradientButton type="submit" className="w-full" disabled={isPending} gradient="rainbow">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </GradientButton>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  );
}
