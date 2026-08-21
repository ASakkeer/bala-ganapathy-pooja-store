"use client";

import { AppProgress } from "@/components/progress/app-progress";
import { ToastProvider } from "@/components/ui/toast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppProgress />
      {children}
    </ToastProvider>
  );
}
