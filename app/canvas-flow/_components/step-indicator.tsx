"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Document Upload" },
  { id: 2, label: "Context" },
  { id: 3, label: "Plan" },
  { id: 4, label: "Generation" },
  { id: 5, label: "Editing" },
];

type StepIndicatorProps = {
  currentStep: 1 | 2 | 3 | 4 | 5;
};

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="flex items-center">
        {STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isPending = step.id > currentStep;

          return (
            <div className="flex items-center" key={step.id}>
              {/* Step circle and label */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full font-medium text-sm transition-colors",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground",
                    isPending && "border-2 border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="size-4" /> : step.id}
                </div>
                <span
                  className={cn(
                    "mt-2 whitespace-nowrap font-medium text-xs",
                    isCurrent && "text-primary",
                    isCompleted && "text-foreground",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line (not after last step) */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-3 h-0.5 w-16",
                    step.id < currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
