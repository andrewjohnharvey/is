"use client";

import {
  AlertCircle,
  Check,
  FileText,
  HelpCircle,
  Library,
  X,
} from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { WizardStep } from "@/components/wizard/wizard-step";
import type {
  DocumentCategory,
  WizardDocument,
  WizardStepId,
} from "@/lib/wizard-types";

interface DocumentHint {
  title: string;
  items: string[];
}

interface StepDocumentUploadProps {
  stepId: WizardStepId;
  category: DocumentCategory;
  title: string;
  description: string;
  documents: WizardDocument[];
  onAddDocuments: (docs: WizardDocument[]) => void;
  onRemoveDocument: (docId: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  onOpenLibrary?: () => void;
  clientName?: string | null;
  libraryDocumentCount?: number;
  hint?: DocumentHint;
  recommendation?: {
    type: string;
    description: string;
  };
  isOptional?: boolean;
}

export function StepDocumentUpload({
  stepId,
  title,
  description,
  documents,
  onAddDocuments,
  onRemoveDocument,
  onBack,
  onContinue,
  onSkip,
  onOpenLibrary,
  clientName,
  libraryDocumentCount = 0,
  hint,
  recommendation,
  isOptional = false,
}: StepDocumentUploadProps) {
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const newDocs: WizardDocument[] = files.map((file) => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        isAutoDetected: true,
        uploadedAt: new Date(),
      }));
      onAddDocuments(newDocs);
    },
    [onAddDocuments]
  );

  return (
    <>
      <WizardStep
        clientName={clientName}
        description={description}
        stepId={stepId}
        title={title}
      >
        {/* Dropzone */}
        <Dropzone className="mb-6" onFilesSelected={handleFilesSelected} />

        {/* Uploaded documents */}
        {documents.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 font-medium text-sm">
              Uploaded ({documents.length})
            </h3>
            <div className="flex flex-col gap-2">
              {documents.map((doc) => (
                <div
                  className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                  key={doc.id}
                >
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate text-sm">{doc.name}</span>
                  {doc.isAutoDetected && (
                    <span className="flex items-center gap-1 text-green-600 text-xs">
                      <Check className="size-3" />
                      Auto-detected
                    </span>
                  )}
                  <button
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveDocument(doc.id)}
                    type="button"
                  >
                    <X className="size-4" />
                    <span className="sr-only">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Library button */}
        {onOpenLibrary && (
          <Card
            className="mb-6 cursor-pointer transition-all hover:border-primary hover:bg-primary/5"
            onClick={onOpenLibrary}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <Library className="size-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-sm">
                  Or add from your document library
                </p>
                {libraryDocumentCount > 0 && (
                  <p className="text-muted-foreground text-xs">
                    {libraryDocumentCount} documents available
                    {clientName && ` for ${clientName}`}
                  </p>
                )}
              </div>
              <span className="text-muted-foreground">→</span>
            </CardContent>
          </Card>
        )}

        {/* Recommendation */}
        {recommendation && documents.length > 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800 text-sm">
                  Recommended: {recommendation.type}
                </p>
                <p className="text-amber-700 text-sm">
                  {recommendation.description}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline">
                    Upload {recommendation.type}
                  </Button>
                  <Button size="sm" variant="ghost">
                    Skip - I don't have one
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hint */}
        {hint && (
          <Card className="bg-muted/50">
            <CardContent className="flex items-start gap-3 p-4">
              <HelpCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{hint.title}</p>
                <ul className="mt-1 list-inside list-disc text-muted-foreground text-sm">
                  {hint.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </WizardStep>

      <WizardNavigation
        canContinue={isOptional || documents.length > 0}
        continueLabel={
          documents.length === 0 && isOptional ? "Skip" : "Continue"
        }
        onBack={onBack}
        onContinue={
          documents.length === 0 && isOptional && onSkip ? onSkip : onContinue
        }
        onSkip={isOptional && documents.length > 0 ? onSkip : undefined}
        showSkip={isOptional && documents.length > 0}
      />
    </>
  );
}
