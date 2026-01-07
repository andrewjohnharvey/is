"use client";

import { Check, Circle, LogOut, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  VISIBLE_STEPS,
  type WizardState,
  type WizardStepId,
} from "@/lib/wizard-types";

interface WizardSidebarProps {
  state: WizardState;
  progress: number;
  onStepClick: (stepId: WizardStepId) => void;
  onSaveAndExit: () => void;
  isStepAccessible: (stepId: WizardStepId) => boolean;
  isStepCompleted: (stepId: WizardStepId) => boolean;
  estimatedTimeRemaining?: string;
}

export function WizardSidebar({
  state,
  progress,
  onStepClick,
  onSaveAndExit,
  isStepAccessible,
  isStepCompleted,
  estimatedTimeRemaining = "5 min",
}: WizardSidebarProps) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-border border-r bg-muted/30">
      {/* Header */}
      <div className="border-border border-b p-6">
        <div className="flex items-center gap-2 text-primary">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-bold text-sm">C</span>
          </div>
          <span className="font-semibold">New Canvas</span>
        </div>
        {state.clientName && (
          <p className="mt-2 text-muted-foreground text-sm">
            {state.clientName}
          </p>
        )}
      </div>

      {/* Steps */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="flex flex-col gap-1">
          {VISIBLE_STEPS.map((step, index) => {
            const isCurrent = state.currentStepId === step.id;
            const isCompleted = isStepCompleted(step.id);
            const isAccessible = isStepAccessible(step.id);
            const isSkipped = state.skippedSteps.includes(step.id);

            return (
              <li key={step.id}>
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    isCurrent && "bg-primary/10 font-medium text-primary",
                    !isCurrent &&
                      isAccessible &&
                      "text-foreground hover:bg-muted",
                    !(isCurrent || isAccessible) &&
                      "cursor-not-allowed text-muted-foreground/50"
                  )}
                  disabled={!isAccessible}
                  onClick={() => isAccessible && onStepClick(step.id)}
                  type="button"
                >
                  {/* Step indicator */}
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs",
                      isCurrent && "border-primary bg-primary text-white",
                      isCompleted &&
                        !isCurrent &&
                        "border-green-500 bg-green-500 text-white",
                      isSkipped &&
                        !isCurrent &&
                        "border-muted-foreground bg-muted text-muted-foreground",
                      !(isCurrent || isCompleted || isSkipped) &&
                        "border-border text-muted-foreground"
                    )}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="size-3.5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </span>

                  {/* Step label */}
                  <span className="flex-1">{step.label}</span>

                  {/* Current indicator */}
                  {isCurrent && (
                    <Circle className="size-2 fill-primary text-primary" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-border border-t p-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress className="h-1.5" value={progress} />
        </div>

        {/* Status */}
        <div className="mb-4 flex flex-col gap-1 text-muted-foreground text-xs">
          <div className="flex items-center gap-1.5">
            <Save className="size-3" />
            <span>Progress saved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Circle className="size-3" />
            <span>~{estimatedTimeRemaining} remaining</span>
          </div>
        </div>

        {/* Save & Exit button */}
        <Button
          className="w-full"
          onClick={onSaveAndExit}
          size="sm"
          variant="secondary"
        >
          <LogOut className="size-4" />
          Save & Exit
        </Button>
      </div>
    </aside>
  );
}
