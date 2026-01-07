"use client";

import { useAction, useQuery } from "convex/react";
import { AlertCircle, CheckCircle2, Loader2, RefreshCcw } from "lucide-react";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type ProcessingStatusProps = {
  canvasId: Id<"canvases">;
  clientId: Id<"clients">;
  className?: string;
};

type DocumentStatus = {
  documentId: Id<"documents">;
  filename: string;
  status: "pending" | "processing" | "completed" | "failed";
  chunksProcessed: number;
  totalChunks: number;
  error?: string;
};

/**
 * Displays real-time processing status for all documents in a canvas.
 * Shows progress bars, completion status, and retry buttons for failed documents.
 */
export function ProcessingStatus({
  canvasId,
  clientId,
  className,
}: ProcessingStatusProps) {
  const statuses = useQuery(
    api.documentProcessingHelpers.getProcessingStatusesByCanvas,
    { canvasId }
  );
  const retryProcessing = useAction(api.documentProcessing.retryProcessing);

  const handleRetry = useCallback(
    async (documentId: Id<"documents">) => {
      await retryProcessing({
        documentId,
        canvasId,
        clientId,
      });
    },
    [retryProcessing, canvasId, clientId]
  );

  if (!statuses || statuses.length === 0) {
    return null;
  }

  // Calculate overall progress
  const totalDocs = statuses.length;
  const completedDocs = statuses.filter(
    (s: DocumentStatus) => s.status === "completed"
  ).length;
  const failedDocs = statuses.filter(
    (s: DocumentStatus) => s.status === "failed"
  ).length;
  const processingDocs = statuses.filter(
    (s: DocumentStatus) => s.status === "processing" || s.status === "pending"
  ).length;

  const allComplete = completedDocs === totalDocs;
  const hasErrors = failedDocs > 0;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Overall status summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {allComplete ? (
            <>
              <CheckCircle2 className="size-5 text-green-500" />
              <span className="font-medium text-sm">
                All documents processed
              </span>
            </>
          ) : hasErrors ? (
            <>
              <AlertCircle className="size-5 text-destructive" />
              <span className="font-medium text-sm">
                {failedDocs} document{failedDocs !== 1 ? "s" : ""} failed
              </span>
            </>
          ) : (
            <>
              <Loader2 className="size-5 animate-spin text-primary" />
              <span className="font-medium text-sm">
                Processing {processingDocs} document
                {processingDocs !== 1 ? "s" : ""}...
              </span>
            </>
          )}
        </div>
        <span className="text-muted-foreground text-sm">
          {completedDocs}/{totalDocs} complete
        </span>
      </div>

      {/* Individual document statuses */}
      <div className="divide-y divide-border rounded-lg border">
        {statuses.map((status) => (
          <DocumentStatusRow
            key={status.documentId}
            onRetry={handleRetry}
            status={status}
          />
        ))}
      </div>
    </div>
  );
}

type DocumentStatusRowProps = {
  status: DocumentStatus;
  onRetry: (documentId: Id<"documents">) => Promise<void>;
};

function DocumentStatusRow({ status, onRetry }: DocumentStatusRowProps) {
  const progressPercent =
    status.totalChunks > 0
      ? Math.round((status.chunksProcessed / status.totalChunks) * 100)
      : 0;

  return (
    <div className="flex items-center gap-4 p-4">
      {/* Status icon */}
      <div className="shrink-0">
        {status.status === "completed" ? (
          <CheckCircle2 className="size-5 text-green-500" />
        ) : status.status === "failed" ? (
          <AlertCircle className="size-5 text-destructive" />
        ) : status.status === "processing" ? (
          <Loader2 className="size-5 animate-spin text-primary" />
        ) : (
          <div className="size-5 rounded-full border-2 border-muted" />
        )}
      </div>

      {/* Document info and progress */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate font-medium text-sm">{status.filename}</p>

        {status.status === "processing" && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Progress className="h-1.5 flex-1" value={progressPercent} />
              <span className="shrink-0 text-muted-foreground text-xs">
                {progressPercent}%
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Processing {status.chunksProcessed} of {status.totalChunks} chunks
            </p>
          </div>
        )}

        {status.status === "completed" && (
          <p className="text-muted-foreground text-xs">
            {status.totalChunks} chunk{status.totalChunks !== 1 ? "s" : ""}{" "}
            indexed
          </p>
        )}

        {status.status === "failed" && status.error && (
          <p className="text-destructive text-xs">{status.error}</p>
        )}

        {status.status === "pending" && (
          <p className="text-muted-foreground text-xs">Waiting to process...</p>
        )}
      </div>

      {/* Retry button for failed documents */}
      {status.status === "failed" && (
        <Button
          aria-label={`Retry processing ${status.filename}`}
          onClick={() => onRetry(status.documentId)}
          size="sm"
          variant="outline"
        >
          <RefreshCcw className="mr-1.5 size-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}

/**
 * Hook to check if all documents in a canvas are processed.
 * Useful for enabling/disabling the continue button.
 */
export function useAllDocumentsProcessed(
  canvasId: Id<"canvases"> | null | undefined
): {
  isReady: boolean;
  isLoading: boolean;
  hasErrors: boolean;
  totalDocs: number;
  completedDocs: number;
} {
  const statuses = useQuery(
    api.documentProcessingHelpers.getProcessingStatusesByCanvas,
    canvasId ? { canvasId } : "skip"
  );

  if (statuses === undefined) {
    return {
      isReady: false,
      isLoading: true,
      hasErrors: false,
      totalDocs: 0,
      completedDocs: 0,
    };
  }

  if (statuses.length === 0) {
    return {
      isReady: false,
      isLoading: false,
      hasErrors: false,
      totalDocs: 0,
      completedDocs: 0,
    };
  }

  const completedDocs = statuses.filter(
    (s: DocumentStatus) => s.status === "completed"
  ).length;
  const failedDocs = statuses.filter(
    (s: DocumentStatus) => s.status === "failed"
  ).length;

  return {
    isReady: completedDocs === statuses.length,
    isLoading: false,
    hasErrors: failedDocs > 0,
    totalDocs: statuses.length,
    completedDocs,
  };
}
