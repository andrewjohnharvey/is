"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  getStepIndex,
  VISIBLE_STEPS,
  type WizardStepId,
} from "@/lib/wizard-types";

interface WizardStepProps {
  stepId: WizardStepId;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  clientName?: string | null;
}

export function WizardStep({
  stepId,
  title,
  description,
  children,
  className,
  clientName,
}: WizardStepProps) {
  const stepIndex = getStepIndex(stepId);
  const totalSteps = VISIBLE_STEPS.length;

  // Don't show step indicator for welcome, processing, or success
  const showStepIndicator = !["welcome", "processing", "success"].includes(
    stepId
  );

  return (
    <div className={cn("flex flex-1 flex-col", className)}>
      {/* Header */}
      <header className="border-border border-b bg-background px-8 py-6">
        <div className="mx-auto flex max-w-3xl items-start justify-between">
          <div>
            {showStepIndicator && (
              <p className="mb-1 text-muted-foreground text-sm">
                Step {stepIndex + 1} of {totalSteps}
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
