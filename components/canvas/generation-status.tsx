"use client";

import { useQuery } from "convex/react";
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  FileSearch,
  Loader2,
  Sparkles,
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface GenerationStatusProps {
  canvasId: Id<"canvases">;
  className?: string;
}

/**
 * Real-time generation status display component.
 * Subscribes to Convex for live updates on analysis/planning/generation progress.
 */
export function GenerationStatus({
  canvasId,
  className,
}: GenerationStatusProps) {
  const status = useQuery(api.canvasGenerationStatus.get, { canvasId });

  if (!status) {
    return null;
  }

  const { phase, progress, currentStep, error } = status;

  // Don't show anything if idle
  if (phase === "idle") {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4",
        phase === "failed" && "border-destructive bg-destructive/5",
        phase === "completed" && "border-green-500 bg-green-500/5",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <PhaseIcon phase={phase} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-sm">
              <PhaseTitle phase={phase} />
            </h3>
            {progress !== undefined &&
              phase !== "completed" &&
              phase !== "failed" && (
                <span className="text-muted-foreground text-xs">
                  {Math.round(progress)}%
                </span>
              )}
          </div>

          {currentStep && phase !== "failed" && (
            <p className="mt-1 text-muted-foreground text-sm">{currentStep}</p>
          )}

          {error && <p className="mt-1 text-destructive text-sm">{error}</p>}

          {progress !== undefined &&
            phase !== "completed" &&
            phase !== "failed" && (
              <Progress className="mt-3 h-1.5" value={progress} />
            )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if generation is in progress
 */
export function useGenerationInProgress(canvasId: Id<"canvases"> | null) {
  const status = useQuery(
    api.canvasGenerationStatus.get,
    canvasId ? { canvasId } : "skip"
  );

  if (!status) {
    return { isInProgress: false, phase: null };
  }

  const inProgressPhases = ["analyzing", "planning", "generating"];
  const isInProgress = inProgressPhases.includes(status.phase);

  return {
    isInProgress,
    phase: status.phase,
    progress: status.progress,
    currentStep: status.currentStep,
  };
}

/**
 * Hook to check if analysis is complete
 */
export function useAnalysisComplete(canvasId: Id<"canvases"> | null) {
  const status = useQuery(
    api.canvasGenerationStatus.get,
    canvasId ? { canvasId } : "skip"
  );

  if (!status) {
    return { isComplete: false, phase: null };
  }

  // Analysis is complete when we've finished analyzing (progress = 100)
  // or moved to a later phase
  const isComplete =
    (status.phase === "analyzing" && status.progress === 100) ||
    status.phase === "planning" ||
    status.phase === "generating" ||
    status.phase === "completed";

  return {
    isComplete,
    phase: status.phase,
    progress: status.progress,
  };
}

function PhaseIcon({ phase }: { phase: string }) {
  const iconClass = "size-5 shrink-0";

  switch (phase) {
    case "analyzing":
      return (
        <FileSearch className={cn(iconClass, "animate-pulse text-blue-500")} />
      );
    case "planning":
      return (
        <Brain className={cn(iconClass, "animate-pulse text-purple-500")} />
      );
    case "generating":
      return (
        <Sparkles className={cn(iconClass, "animate-pulse text-amber-500")} />
      );
    case "completed":
      return <CheckCircle2 className={cn(iconClass, "text-green-500")} />;
    case "failed":
      return <AlertCircle className={cn(iconClass, "text-destructive")} />;
    default:
      return (
        <Loader2
          className={cn(iconClass, "animate-spin text-muted-foreground")}
        />
      );
  }
}

function PhaseTitle({ phase }: { phase: string }) {
  switch (phase) {
    case "analyzing":
      return "Analyzing Documents";
    case "planning":
      return "Planning Canvas";
    case "generating":
      return "Generating Sections";
    case "completed":
      return "Generation Complete";
    case "failed":
      return "Generation Failed";
    default:
      return "Processing";
  }
}

/**
 * Compact version of generation status for inline use
 */
export function GenerationStatusCompact({
  canvasId,
  className,
}: GenerationStatusProps) {
  const status = useQuery(api.canvasGenerationStatus.get, { canvasId });

  if (!status || status.phase === "idle") {
    return null;
  }

  const { phase, progress, currentStep } = status;

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <PhaseIcon phase={phase} />
      <span className="text-muted-foreground">
        {currentStep || <PhaseTitle phase={phase} />}
      </span>
      {progress !== undefined &&
        phase !== "completed" &&
        phase !== "failed" && (
          <span className="text-muted-foreground">
            ({Math.round(progress)}%)
          </span>
        )}
    </div>
  );
}
