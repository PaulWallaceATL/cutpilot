import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AppPreloader } from "@/components/shared/app-preloader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
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
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <AppPreloader>
          {children}
        </AppPreloader>
        <Toaster />
      </body>
    </html>
  );
}
