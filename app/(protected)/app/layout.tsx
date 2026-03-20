import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AppHeader } from "@/components/layout/app-header";
import { OnboardingCheck } from "@/components/shared/onboarding-check";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="mx-auto max-w-4xl p-4 md:p-6">{children}</div>
        </main>
      </div>
      <BottomNav />
      <OnboardingCheck />
    </div>
  );
}
