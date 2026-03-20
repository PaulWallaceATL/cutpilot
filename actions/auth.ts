"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  try {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // Return success instead of redirecting directly
    return { success: true, userId: data.user?.id };
  } catch (error) {
    console.error("Login error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to sign in. Please check your environment variables.",
    };
  }
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("full_name") as string;

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      return { error: error.message };
    }

    // Return success instead of redirecting directly
    // The client component will handle navigation
    return { success: true, userId: data.user?.id };
  } catch (error) {
    console.error("Signup error:", error);
    // Check if it's a redirect error (which is expected)
    if (error && typeof error === "object" && "digest" in error) {
      // This is a redirect, re-throw it
      throw error;
    }
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to create account. Please check your environment variables.",
    };
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
