"use client";

import {
  AlertCircle,
  Check,
  FileText,
  HelpCircle,
  Library,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import type { MockDocument, WizardStepId } from "./mock-data";
import { PrototypeStep } from "./prototype-step";

interface StepDocumentUploadWrapperProps {
  stepId: WizardStepId;
  category: string;
  title: string;
  description: string;
  documents: MockDocument[];
  onFakeUpload: () => void;
  onRemoveDocument: (docId: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  clientName?: string;
  hint?: { title: string; items: string[] };
  recommendation?: { type: string; description: string };
  isOptional?: boolean;
}

export function StepDocumentUploadWrapper({
  stepId,
  title,
  description,
  documents,
  onFakeUpload,
  onRemoveDocument,
  onBack,
  onContinue,
  onSkip,
  clientName,
  hint,
  recommendation,
  isOptional = false,
}: StepDocumentUploadWrapperProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Simulate upload with loading state
  const handleSimulateUpload = () => {
    if (isUploading) return;
    setIsUploading(true);
    setTimeout(() => {
      onFakeUpload();
      setIsUploading(false);
    }, 800);
  };

  return (
    <>
      <PrototypeStep
        clientName={clientName}
        description={description}
        stepId={stepId}
        title={title}
      >
        {/* Simulated Dropzone - Click to add sample docs */}
        <button
          className="mb-6 flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-border border-dashed p-8 transition-all hover:border-primary/50 hover:bg-muted/50"
          disabled={isUploading}
          onClick={handleSimulateUpload}
          type="button"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            {isUploading ? (
              <Loader2 className="size-6 animate-spin text-primary" />
            ) : (
              <Upload className="size-6 text-muted-foreground" />
            )}
          </div>
          <div className="text-center">
            <p className="font-medium">
              {isUploading ? "Uploading..." : "Click to add sample documents"}
            </p>
            <p className="text-muted-foreground text-sm">
              (Demo mode - simulates document upload)
            </p>
          </div>
        </button>

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
                      {doc.detectedType || "Auto-detected"}
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
        <Card
          className="mb-6 cursor-pointer transition-all hover:border-primary hover:bg-primary/5"
          onClick={handleSimulateUpload}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <Library className="size-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-sm">
                Or add from your document library
              </p>
              <p className="text-muted-foreground text-xs">
                8 documents available{clientName && ` for ${clientName}`}
              </p>
            </div>
            <span className="text-muted-foreground">→</span>
          </CardContent>
        </Card>

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
                  <Button
                    onClick={handleSimulateUpload}
                    size="sm"
                    variant="outline"
                  >
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
      </PrototypeStep>

      <WizardNavigation
        canContinue={isOptional || documents.length > 0}
        className="shrink-0"
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
