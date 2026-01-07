"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS, type WizardStepId } from "./mock-data";

interface PrototypeStepProps {
  stepId: WizardStepId;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  clientName?: string | null;
}

export function PrototypeStep({
  stepId,
  title,
  description,
  children,
  className,
  clientName,
}: PrototypeStepProps) {
  const stepConfig = WIZARD_STEPS.find((s) => s.id === stepId);
  const totalSteps = WIZARD_STEPS.length;

  // Don't show step indicator for welcome
  const showStepIndicator = stepId !== "welcome";

  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}
    >
      {/* Header */}
      <header className="shrink-0 border-border border-b bg-background px-8 py-6">
        <div className="mx-auto flex max-w-3xl items-start justify-between">
          <div>
            {showStepIndicator && stepConfig && (
              <p className="mb-1 text-muted-foreground text-sm">
                Step {stepConfig.stepNumber} of {totalSteps}
              </p>
            )}
            <h1 className="font-semibold text-2xl">{title}</h1>
            {description && (
              <p className="mt-1.5 text-muted-foreground">{description}</p>
            )}
          </div>
          {clientName && (
            <span className="rounded-lg bg-muted px-3 py-1.5 text-sm">
              {clientName}
            </span>
          )}
        </div>
      </header>

      {/* Content - scrollable */}
      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
