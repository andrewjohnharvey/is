"use client";

import { useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";

import { ProcessingStatus } from "@/components/canvas/processing-status";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  formatFileSize,
  getFileTypeInfo,
  validateFiles,
} from "@/lib/file-validation";

type UploadingFile = {
  id: string;
  file: File;
  progress: number;
  error?: string;
};

type DocumentUploadProps = {
  clientId: Id<"clients">;
  canvasId: Id<"canvases">;
};

export function DocumentUpload({ clientId, canvasId }: DocumentUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const documents = useQuery(api.documents.listByCanvas, { canvasId });
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const createDocument = useMutation(api.documents.create);
  const removeDocument = useMutation(api.documents.remove);

  const documentCount = documents?.length ?? 0;

  const uploadFile = useCallback(
    async (file: File, uploadId: string) => {
      try {
        // Update progress to show we're starting
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === uploadId ? { ...f, progress: 10 } : f))
        );

        // Get upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload the file with progress tracking
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        // Update progress
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === uploadId ? { ...f, progress: 80 } : f))
        );

        const { storageId } = await response.json();

        // Create document record
        await createDocument({
          clientId,
          canvasId,
          filename: file.name,
          fileType: file.type,
          size: file.size,
          storageId,
        });

        // Remove from uploading list
        setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
      } catch (_error) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadId
              ? { ...f, error: `Failed to upload ${file.name}`, progress: 0 }
              : f
          )
        );
      }
    },
    [generateUploadUrl, createDocument, clientId, canvasId]
  );

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      // Clear previous errors
      setErrors([]);

      // Validate files
      const currentCount = documentCount + uploadingFiles.length;
      const { validFiles, errors: validationErrors } = validateFiles(
        files,
        currentCount
      );

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
      }

      if (validFiles.length === 0) {
        return;
      }

      // Add files to uploading state
      const newUploadingFiles: UploadingFile[] = validFiles.map((file) => ({
        id: `${Date.now()}-${file.name}`,
        file,
        progress: 0,
      }));

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      // Upload each file
      for (const uploadingFile of newUploadingFiles) {
        await uploadFile(uploadingFile.file, uploadingFile.id);
      }
    },
    [documentCount, uploadingFiles.length, uploadFile]
  );

  const handleRemoveDocument = useCallback(
    async (documentId: Id<"documents">) => {
      try {
        await removeDocument({ id: documentId });
      } catch (_error) {
        setErrors(["Failed to delete document. Please try again."]);
      }
    },
    [removeDocument]
  );

  const handleCancelUpload = useCallback((uploadId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadId));
  }, []);

  const handleDismissError = useCallback((index: number) => {
    setErrors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const totalCount = documentCount + uploadingFiles.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Dropzone */}
      <Dropzone
        currentFileCount={totalCount}
        disabled={uploadingFiles.some((f) => !f.error)}
        onFilesSelected={handleFilesSelected}
      />

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="flex flex-col gap-2">
          {errors.map((error, index) => (
            <div
              className="flex items-center justify-between gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive text-sm"
              key={`error-${index}-${error.slice(0, 20)}`}
            >
              <span>{error}</span>
              <button
                aria-label="Dismiss error"
                className="rounded-md p-1 hover:bg-destructive/20"
                onClick={() => handleDismissError(index)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File list */}
      {(totalCount > 0 || uploadingFiles.length > 0) && (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-muted-foreground text-sm">
            {documentCount} document{documentCount !== 1 ? "s" : ""} uploaded
            {uploadingFiles.filter((f: UploadingFile) => !f.error).length > 0 &&
              `, ${uploadingFiles.filter((f: UploadingFile) => !f.error).length} uploading`}
          </p>

          <div className="divide-y divide-border rounded-lg border">
            {/* Uploading files */}
            {uploadingFiles.map((uploadingFile) => (
              <div
                className="flex items-center gap-4 p-4"
                key={uploadingFile.id}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {uploadingFile.error ? (
                    <FileText className="size-5 text-destructive" />
                  ) : (
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="truncate font-medium text-sm">
                    {uploadingFile.file.name}
                  </p>
                  {uploadingFile.error ? (
                    <p className="text-destructive text-xs">
                      {uploadingFile.error}
                    </p>
                  ) : (
                    <Progress
                      className="h-1.5"
                      value={uploadingFile.progress}
                    />
                  )}
                </div>

                <Button
                  aria-label={`Cancel upload of ${uploadingFile.file.name}`}
                  onClick={() => handleCancelUpload(uploadingFile.id)}
                  size="icon-sm"
                  variant="ghost"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}

            {/* Uploaded documents */}
            {documents?.map((doc) => {
              const typeInfo = getFileTypeInfo(doc.fileType) ?? undefined;
              return (
                <DocumentRow
                  doc={doc}
                  key={doc._id}
                  onRemove={handleRemoveDocument}
                  typeInfo={typeInfo}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Processing status section */}
      {documentCount > 0 && (
        <ProcessingStatus
          canvasId={canvasId}
          className="mt-2"
          clientId={clientId}
        />
      )}
    </div>
  );
}

/**
 * Individual document row with processing status indicator.
 */
type DocumentRowProps = {
  doc: {
    _id: Id<"documents">;
    filename: string;
    fileType: string;
    size: number;
  };
  typeInfo: { label: string } | undefined;
  onRemove: (id: Id<"documents">) => Promise<void>;
};

function DocumentRow({ doc, typeInfo, onRemove }: DocumentRowProps) {
  const processingStatus = useQuery(
    api.documentProcessingHelpers.getProcessingStatus,
    {
      documentId: doc._id,
    }
  );

  const getStatusIcon = () => {
    if (!processingStatus) {
      return <FileText className="size-5 text-muted-foreground" />;
    }

    switch (processingStatus.status) {
      case "completed":
        return <CheckCircle2 className="size-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="size-5 text-destructive" />;
      case "processing":
        return <Loader2 className="size-5 animate-spin text-primary" />;
      case "pending":
      default:
        return <FileText className="size-5 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    if (!processingStatus) {
      return `${typeInfo?.label ?? "Document"} \u00B7 ${formatFileSize(doc.size)}`;
    }

    switch (processingStatus.status) {
      case "completed":
        return `Indexed (${processingStatus.totalChunks} chunks) \u00B7 ${formatFileSize(doc.size)}`;
      case "failed":
        return `Processing failed \u00B7 ${formatFileSize(doc.size)}`;
      case "processing":
        return `Processing... \u00B7 ${formatFileSize(doc.size)}`;
      case "pending":
        return `Waiting to process \u00B7 ${formatFileSize(doc.size)}`;
      default:
        return `${typeInfo?.label ?? "Document"} \u00B7 ${formatFileSize(doc.size)}`;
    }
  };

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        {getStatusIcon()}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate font-medium text-sm">{doc.filename}</p>
        <p className="text-muted-foreground text-xs">{getStatusText()}</p>
      </div>

      <Button
        aria-label={`Delete ${doc.filename}`}
        onClick={() => onRemove(doc._id)}
        size="icon-sm"
        variant="ghost"
      >
        <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}
