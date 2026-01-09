"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { AlertCircle, CheckCircle, FileText, Loader2, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { formatFileSize, validateFiles } from "@/lib/file-validation";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface StepUploadDocumentsProps {
  canvasId: string | null;
  clientId: string | null;
  onContinue: () => void;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "completed" | "failed";
  error?: string;
}

export function StepUploadDocuments({
  canvasId,
  clientId,
  onContinue,
}: StepUploadDocumentsProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Convex hooks
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const createDocument = useMutation(api.documents.create);
  const removeDocument = useMutation(api.documents.remove);
  const analyzeDocuments = useAction(api.documentAnalysis.analyzeDocuments);

  // Query documents and processing statuses if we have a canvasId
  const documents = useQuery(
    api.documents.listByCanvas,
    canvasId ? { canvasId: canvasId as Id<"canvases"> } : "skip"
  );

  const processingStatuses = useQuery(
    api.documentProcessingHelpers.getProcessingStatusesByCanvas,
    canvasId ? { canvasId: canvasId as Id<"canvases"> } : "skip"
  );

  // Query document tags (extracted from document analysis)
  const documentTags = useQuery(
    api.documentAnalysisHelpers.getDocumentTags,
    canvasId ? { canvasId: canvasId as Id<"canvases"> } : "skip"
  );

  const documentCount = documents?.length ?? 0;
  const hasDocuments = documentCount > 0;
  const isUploading = uploadingFiles.some((f) => f.status === "uploading");

  // Check if all documents are processed (for enabling continue)
  const allProcessed =
    processingStatuses?.every(
      (s) => s.status === "completed" || s.status === "failed"
    ) ?? false;

  const canContinue =
    hasDocuments && !isUploading && allProcessed && !isAnalyzing;

  // Handle Continue - trigger document analysis before proceeding
  const handleContinue = useCallback(async () => {
    if (!canvasId) {
      onContinue();
      return;
    }

    setIsAnalyzing(true);
    try {
      await analyzeDocuments({ canvasId: canvasId as Id<"canvases"> });
    } catch (error) {
      console.error("Failed to analyze documents:", error);
      // Continue anyway - analysis can happen in background
    } finally {
      setIsAnalyzing(false);
    }
    onContinue();
  }, [canvasId, analyzeDocuments, onContinue]);

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      if (!(canvasId && clientId)) {
        setUploadErrors(["Canvas not initialized. Please try again."]);
        return;
      }

      // Validate files
      const { validFiles, errors } = validateFiles(files, documentCount);
      if (errors.length > 0) {
        setUploadErrors(errors);
      }

      // Upload valid files
      for (const file of validFiles) {
        const uploadId = `${Date.now()}-${file.name}`;

        // Add to uploading state
        setUploadingFiles((prev) => [
          ...prev,
          { id: uploadId, file, progress: 10, status: "uploading" },
        ]);

        try {
          // Get upload URL
          const uploadUrl = await generateUploadUrl();

          // Update progress
          setUploadingFiles((prev) =>
            prev.map((f) => (f.id === uploadId ? { ...f, progress: 50 } : f))
          );

          // Upload file
          const response = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const { storageId } = await response.json();

          // Update progress
          setUploadingFiles((prev) =>
            prev.map((f) => (f.id === uploadId ? { ...f, progress: 80 } : f))
          );

          // Create document record
          await createDocument({
            clientId: clientId as Id<"clients">,
            canvasId: canvasId as Id<"canvases">,
            filename: file.name,
            fileType: file.type,
            size: file.size,
            storageId,
          });

          // Mark as completed
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadId
                ? { ...f, progress: 100, status: "completed" }
                : f
            )
          );

          // Remove from uploading state after a brief delay
          setTimeout(() => {
            setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
          }, 1000);
        } catch (error) {
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadId
                ? {
                    ...f,
                    status: "failed",
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : f
            )
          );
        }
      }
    },
    [canvasId, clientId, documentCount, generateUploadUrl, createDocument]
  );

  const handleRemoveDocument = useCallback(
    async (documentId: Id<"documents">) => {
      try {
        await removeDocument({ id: documentId });
      } catch (error) {
        console.error("Failed to remove document:", error);
      }
    },
    [removeDocument]
  );

  const dismissError = useCallback((index: number) => {
    setUploadErrors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <h1 className="font-semibold font-serif text-3xl text-foreground">
            Upload Documents
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add renewal documents to inform the presentation content
          </p>

          {/* Upload Errors */}
          {uploadErrors.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadErrors.map((error, index) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm"
                  key={`error-${index}-${error.slice(0, 20)}`}
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <button
                    aria-label="Dismiss error"
                    className="text-destructive hover:text-destructive/80"
                    onClick={() => dismissError(index)}
                    type="button"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Dropzone */}
          <div className="mt-8">
            <Dropzone
              currentFileCount={documentCount}
              disabled={!(canvasId && clientId)}
              onFilesSelected={handleFilesSelected}
            />
          </div>

          {/* Uploading Files */}
          {uploadingFiles.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                Uploading
              </h2>
              <div className="space-y-2">
                {uploadingFiles.map((upload) => (
                  <Card className="p-3" key={upload.id}>
                    <div className="flex items-center gap-3">
                      {upload.status === "uploading" && (
                        <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                      )}
                      {upload.status === "completed" && (
                        <CheckCircle className="size-4 shrink-0 text-green-500" />
                      )}
                      {upload.status === "failed" && (
                        <AlertCircle className="size-4 shrink-0 text-destructive" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{upload.file.name}</p>
                        {upload.status === "uploading" && (
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${upload.progress}%` }}
                            />
                          </div>
                        )}
                        {upload.status === "failed" && upload.error && (
                          <p className="mt-0.5 text-destructive text-xs">
                            {upload.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded Documents List */}
          {hasDocuments && (
            <div className="mt-8">
              <h2 className="mb-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                Uploaded Documents ({documentCount})
              </h2>
              <div className="space-y-3">
                {documents?.map((doc) => {
                  const status = processingStatuses?.find(
                    (s) => s.documentId === doc._id
                  );
                  const tags = documentTags?.[doc._id];
                  return (
                    <DocumentListItem
                      document={doc}
                      key={doc._id}
                      onRemove={() => handleRemoveDocument(doc._id)}
                      processingStatus={status}
                      tags={tags}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation footer */}
      <WizardNavigation
        canContinue={canContinue}
        canGoBack={false}
        continueLabel={
          isAnalyzing
            ? "Analyzing..."
            : isUploading
              ? "Uploading..."
              : !allProcessed && hasDocuments
                ? "Processing..."
                : "Continue"
        }
        onContinue={handleContinue}
      />
    </div>
  );
}

interface DocumentListItemProps {
  document: {
    _id: Id<"documents">;
    filename: string;
    fileType: string;
    size: number;
  };
  processingStatus?: {
    status: string;
    chunksProcessed: number;
    totalChunks: number;
    error?: string;
  };
  tags?: {
    type: string;
    topics: string[];
  };
  onRemove: () => void;
}

function DocumentListItem({
  document,
  processingStatus,
  tags,
  onRemove,
}: DocumentListItemProps) {
  const status = processingStatus?.status ?? "pending";

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{document.filename}</p>
            <div className="mt-0.5 flex items-center gap-2 text-muted-foreground text-xs">
              <span>{formatFileSize(document.size)}</span>
              <span>•</span>
              <ProcessingStatusBadge
                error={processingStatus?.error}
                status={status}
              />
            </div>
            {status === "processing" && processingStatus && (
              <div className="mt-2 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${
                      processingStatus.totalChunks > 0
                        ? (
                            processingStatus.chunksProcessed /
                              processingStatus.totalChunks
                          ) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            )}
            {/* Document tags from AI analysis */}
            {tags && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.type && <Badge variant="secondary">{tags.type}</Badge>}
                {tags.topics?.map((topic) => (
                  <Badge className="text-xs" key={topic} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          aria-label={`Remove ${document.filename}`}
          className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
          onClick={onRemove}
          type="button"
        >
          <X className="size-4" />
        </button>
      </div>
    </Card>
  );
}

function ProcessingStatusBadge({
  status,
  error,
}: {
  status: string;
  error?: string;
}) {
  switch (status) {
    case "pending":
      return (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          Pending
        </span>
      );
    case "processing":
      return (
        <span className="flex items-center gap-1 text-blue-600">
          <Loader2 className="size-3 animate-spin" />
          Processing
        </span>
      );
    case "completed":
      return (
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle className="size-3" />
          Ready
        </span>
      );
    case "failed":
      return (
        <span
          className="flex items-center gap-1 text-destructive"
          title={error}
        >
          <AlertCircle className="size-3" />
          Failed
        </span>
      );
    default:
      return null;
  }
}
