import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AppPreloader } from "@/components/shared/app-preloader";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CutPilot — AI Fitness & Nutrition",
  description:
    "Your AI-powered fitness and nutrition coach. Get personalized workout plans, meal plans, and real-time guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AppPreloader>{children}</AppPreloader>
        <Toaster />
      </body>
    </html>
  );
}
