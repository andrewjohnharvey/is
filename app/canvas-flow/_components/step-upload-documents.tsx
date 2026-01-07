"use client";

import { FileText, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import type { UploadedDocument } from "./mock-data";

interface StepUploadDocumentsProps {
  documents: UploadedDocument[];
  onAddMockDocuments: () => void;
  onRemoveDocument: (docId: string) => void;
  onContinue: () => void;
}

export function StepUploadDocuments({
  documents,
  onAddMockDocuments,
  onRemoveDocument,
  onContinue,
}: StepUploadDocumentsProps) {
  const hasDocuments = documents.length > 0;

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

          {/* Dropzone */}
          <button
            className="mt-8 flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-border border-dashed p-8 transition-all duration-200 hover:border-primary/50 hover:bg-muted/50"
            onClick={onAddMockDocuments}
            type="button"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Upload className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-medium text-foreground">
                  Drop documents here or click to browse
                </p>
                <p className="text-muted-foreground text-sm">
                  Upload PDFs, Excel files, Word docs, PowerPoint presentations,
                  or text files
                </p>
              </div>
              <Button
                className="mt-2"
                size="sm"
                type="button"
                variant="default"
              >
                Browse Files
              </Button>
            </div>
          </button>

          {/* Uploaded Documents List */}
          {hasDocuments && (
            <div className="mt-8">
              <h2 className="mb-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
                Uploaded Documents ({documents.length})
              </h2>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <DocumentListItem
                    document={doc}
                    key={doc.id}
                    onRemove={() => onRemoveDocument(doc.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation footer */}
      <WizardNavigation
        canContinue={hasDocuments}
        canGoBack={false}
        onContinue={onContinue}
      />
    </div>
  );
}

interface DocumentListItemProps {
  document: UploadedDocument;
  onRemove: () => void;
}

function DocumentListItem({ document, onRemove }: DocumentListItemProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <FileText className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{document.name}</p>
            <p className="mt-0.5 text-muted-foreground text-xs">
              {document.detectedType} • Relevant to{" "}
              {document.relevantSections.length} sections
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {document.relevantSections.map((section) => (
                <Badge key={section} variant="blue">
                  {section}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <button
          aria-label={`Remove ${document.name}`}
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
