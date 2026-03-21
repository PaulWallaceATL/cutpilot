"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ThreeDLetterSwap from "@/components/react-bits/3d-letter-swap";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success("Signed in! Redirecting...");
        router.push("/app/today");
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="flex items-center justify-center gap-2 mb-8">
        <Zap className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold text-white">CutPilot</span>
      </div>

      <div className="backdrop-blur-xl bg-card/80 border border-white/20 shadow-2xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          <ThreeDLetterSwap staggerInterval={0.04}>
            Welcome back
          </ThreeDLetterSwap>
        </h1>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-primary/80 text-white border-0 hover:shadow-lg transition-all"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
}
