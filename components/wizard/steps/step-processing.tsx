"use client";

import { Check, Circle, Lightbulb, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProcessingPhase {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed";
}

interface StepProcessingProps {
  progress: number;
  phases: ProcessingPhase[];
  estimatedTimeRemaining?: string;
  tip?: string;
}

const DEFAULT_PHASES: ProcessingPhase[] = [
  { id: "reading", label: "Reading your documents", status: "pending" },
  {
    id: "understanding",
    label: "Understanding plan designs",
    status: "pending",
  },
  { id: "analyzing", label: "Analyzing claims trends", status: "pending" },
  { id: "calculating", label: "Calculating cost impacts", status: "pending" },
  { id: "building", label: "Building presentation", status: "pending" },
  { id: "compliance", label: "Running compliance checks", status: "pending" },
];

const TIPS = [
  "AI analyzes documents 50x faster than manual review",
  "Your presentation includes customized visualizations",
  "Compliance alerts are generated automatically",
  "Industry benchmarks are included for context",
];

export function StepProcessing({
  progress,
  phases = DEFAULT_PHASES,
  estimatedTimeRemaining = "30 seconds",
  tip = TIPS[Math.floor(Math.random() * TIPS.length)],
}: StepProcessingProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
            <h2 className="font-bold text-xl">
              Creating Your Renewal Presentation
            </h2>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <Progress className="h-2" value={progress} />
            <p className="mt-2 text-center text-muted-foreground text-sm">
              {progress}%
            </p>
          </div>

          {/* Phases */}
          <div className="mb-6 flex flex-col gap-3">
            {phases.map((phase) => (
              <div className="flex items-center gap-3" key={phase.id}>
                {phase.status === "completed" ? (
                  <Check className="size-4 text-green-600" />
                ) : phase.status === "in_progress" ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <Circle className="size-4 text-muted-foreground/30" />
                )}
                <span
                  className={
                    phase.status === "completed"
                      ? "text-muted-foreground"
                      : phase.status === "in_progress"
                        ? "font-medium"
                        : "text-muted-foreground/50"
                  }
                >
                  {phase.label}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <hr className="mb-6 border-border" />

          {/* Tip */}
          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Did you know?
              </p>
              <p className="text-sm">{tip}</p>
            </div>
          </div>

          {/* Time remaining */}
          <p className="mt-4 text-center text-muted-foreground text-xs">
            Estimated time remaining: ~{estimatedTimeRemaining}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
