"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { WizardSidebar } from "@/components/wizard/wizard-sidebar";
import type { UseWizardStateReturn } from "@/hooks/use-wizard-state";

interface WizardLayoutProps {
  children: ReactNode;
  wizard: UseWizardStateReturn;
  clientId: string;
}

export function WizardLayout({
  children,
  wizard,
  clientId,
}: WizardLayoutProps) {
  const router = useRouter();

  const handleSaveAndExit = () => {
    // TODO: Save wizard state to backend
    router.push(`/clients/${clientId}/canvas`);
  };

  // For processing and success screens, show without sidebar
  if (
    wizard.state.currentStepId === "processing" ||
    wizard.state.currentStepId === "success"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <WizardSidebar
        estimatedTimeRemaining="5 min"
        isStepAccessible={wizard.isStepAccessible}
        isStepCompleted={wizard.isStepCompleted}
        onSaveAndExit={handleSaveAndExit}
        onStepClick={wizard.goToStep}
        progress={wizard.progress}
        state={wizard.state}
      />
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
