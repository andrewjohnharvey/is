"use client";

import { Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StepIndicator } from "./step-indicator";

type ProcessingPhase = {
  id: string;
  label: string;
  tip: string;
};

type ProcessingScreenProps = {
  phases: ProcessingPhase[];
  phaseIndex: number;
  progress: number;
};

export function ProcessingScreen({
  phases,
  phaseIndex,
  progress,
}: ProcessingScreenProps) {
  const currentPhase = phases[phaseIndex];
  const estimatedSeconds = Math.max(0, Math.round((100 - progress) / 13));

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Step Indicator */}
      <div className="border-border border-b">
        <StepIndicator currentStep={3} />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="mb-2 font-semibold font-serif text-2xl">
                Generating Your Canvas
              </h2>
              <p className="text-muted-foreground">
                Please wait while we analyze your documents
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress className="h-3" value={progress} />
            </div>

            {/* Phase list */}
            <div className="mb-8 flex flex-col gap-3">
              {phases.map((phase, index) => {
                const isComplete = index < phaseIndex;
                const isCurrent = index === phaseIndex;
                const isPending = index > phaseIndex;

                return (
                  <div
                    className={`flex items-center gap-3 text-sm ${
                      isPending ? "text-muted-foreground" : ""
                    }`}
                    key={phase.id}
                  >
                    {isComplete && (
                      <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </div>
                    )}
                    {isCurrent && (
                      <div className="flex size-5 items-center justify-center">
                        <Loader2 className="size-4 animate-spin text-primary" />
                      </div>
                    )}
                    {isPending && (
                      <div className="size-5 rounded-full border-2 border-muted" />
                    )}
                    <span className={isCurrent ? "font-medium" : ""}>
                      {phase.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Tip */}
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-muted-foreground text-sm">
                <span className="font-medium text-foreground">TIP: </span>
                {currentPhase?.tip || "Processing your documents..."}
              </p>
            </div>

            {/* Estimated time */}
            <p className="mt-4 text-center text-muted-foreground text-sm">
              Estimated time remaining: ~{estimatedSeconds} seconds
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
