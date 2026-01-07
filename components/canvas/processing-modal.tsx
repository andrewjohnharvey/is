"use client";

import { CheckCircle2, Circle, FileSearch, Loader2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ProcessingPhase = {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed";
};

type ProcessingModalProps = {
  isOpen: boolean;
  progress: number;
  phases: ProcessingPhase[];
  estimatedTime?: string;
  className?: string;
};

function PhaseIcon({
  status,
}: {
  status: "pending" | "in_progress" | "completed";
}) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="size-5 text-green-500" />;
    case "in_progress":
      return <Loader2 className="size-5 animate-spin text-primary" />;
    default:
      return <Circle className="size-5 text-muted-foreground" />;
  }
}

export function ProcessingModal({
  isOpen,
  progress,
  phases,
  estimatedTime,
  className,
}: ProcessingModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border/50 bg-background p-8 shadow-lg">
        <div className="flex flex-col items-center gap-6">
          {/* Animated Icon */}
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <FileSearch className="size-8 animate-pulse text-primary" />
          </div>

          {/* Title */}
          <h2 className="font-semibold text-xl">Generating Canvas...</h2>

          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <Progress value={progress} />
            <p className="text-center text-muted-foreground text-sm">
              {progress}%
            </p>
          </div>

          {/* Phase List */}
          <div className="w-full space-y-3">
            {phases.map((phase) => (
              <div className="flex items-center gap-3" key={phase.id}>
                <PhaseIcon status={phase.status} />
                <span
                  className={cn(
                    "text-sm",
                    phase.status === "completed" && "text-muted-foreground",
                    phase.status === "in_progress" && "font-medium",
                    phase.status === "pending" && "text-muted-foreground"
                  )}
                >
                  {phase.label}
                </span>
              </div>
            ))}
          </div>

          {/* Estimated Time */}
          {estimatedTime ? (
            <p className="text-muted-foreground text-sm">
              Estimated time: ~{estimatedTime}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Default phases for canvas generation
export const DEFAULT_PROCESSING_PHASES: ProcessingPhase[] = [
  { id: "analyzing", label: "Analyzing documents", status: "pending" },
  {
    id: "extracting",
    label: "Extracting financial metrics",
    status: "pending",
  },
  {
    id: "building",
    label: "Building presentation structure",
    status: "pending",
  },
  { id: "generating", label: "Generating slides", status: "pending" },
  { id: "compliance", label: "Running compliance checks", status: "pending" },
];
