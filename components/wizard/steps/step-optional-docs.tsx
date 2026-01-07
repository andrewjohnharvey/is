"use client";

import {
  BarChart3,
  Check,
  ChevronRight,
  FileText,
  Lightbulb,
  Pin,
  Scale,
  X,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { WizardStep } from "@/components/wizard/wizard-step";
import { cn } from "@/lib/utils";
import type { DocumentCategory, WizardDocument } from "@/lib/wizard-types";

interface OptionalCategory {
  id: DocumentCategory;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const OPTIONAL_CATEGORIES: OptionalCategory[] = [
  {
    id: "benchmarking",
    icon: <BarChart3 className="size-5" />,
    title: "Benchmarking & Market Data",
    description: "Competitive quotes, industry benchmarks",
  },
  {
    id: "compliance",
    icon: <Scale className="size-5" />,
    title: "Compliance Documents",
    description: "ACA reporting, non-discrimination testing",
  },
  {
    id: "other",
    icon: <Pin className="size-5" />,
    title: "Other Context",
    description: "Emails, meeting notes, strategy documents",
  },
];

interface StepOptionalDocsProps {
  documents: Record<DocumentCategory, WizardDocument[]>;
  onAddDocuments: (category: DocumentCategory, docs: WizardDocument[]) => void;
  onRemoveDocument: (category: DocumentCategory, docId: string) => void;
  onBack: () => void;
  onContinue: () => void;
  clientName?: string | null;
}

export function StepOptionalDocs({
  documents,
  onAddDocuments,
  onRemoveDocument,
  onBack,
  onContinue,
  clientName,
}: StepOptionalDocsProps) {
  const [expandedCategory, setExpandedCategory] =
    useState<DocumentCategory | null>(null);

  const handleFilesSelected = (category: DocumentCategory, files: File[]) => {
    const newDocs: WizardDocument[] = files.map((file) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      isAutoDetected: true,
      uploadedAt: new Date(),
    }));
    onAddDocuments(category, newDocs);
  };

  return (
    <>
      <WizardStep
        clientName={clientName}
        description="These enhance your analysis but aren't required."
        stepId="optional-docs"
        title="Any additional context? (Optional)"
      >
        <div className="flex flex-col gap-4">
          {OPTIONAL_CATEGORIES.map((category) => {
            const categoryDocs = documents[category.id] || [];
            const isExpanded = expandedCategory === category.id;
            const hasDocuments = categoryDocs.length > 0;

            return (
              <Card
                className={cn(
                  "transition-all",
                  hasDocuments && "border-green-200 bg-green-50/50"
                )}
                key={category.id}
              >
                <CardContent className="p-0">
                  {/* Category header */}
                  <button
                    className="flex w-full items-center gap-3 p-4 text-left"
                    onClick={() =>
                      setExpandedCategory(isExpanded ? null : category.id)
                    }
                    type="button"
                  >
                    <span
                      className={cn(
                        "text-muted-foreground",
                        hasDocuments && "text-green-600"
                      )}
                    >
                      {hasDocuments ? (
                        <Check className="size-5" />
                      ) : (
                        category.icon
                      )}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">
                          {category.title}
                        </h4>
                        {hasDocuments && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 text-xs">
                            {categoryDocs.length} added
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {category.description}
                      </p>
                    </div>
                    <ChevronRight
                      className={cn(
                        "size-5 text-muted-foreground transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-border border-t px-4 pb-4">
                      {/* Document list */}
                      {categoryDocs.length > 0 && (
                        <div className="mt-4 flex flex-col gap-2">
                          {categoryDocs.map((doc) => (
                            <div
                              className="flex items-center gap-3 rounded-lg bg-background p-3"
                              key={doc.id}
                            >
                              <FileText className="size-4 shrink-0 text-muted-foreground" />
                              <span className="flex-1 truncate text-sm">
                                {doc.name}
                              </span>
                              <button
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                  onRemoveDocument(category.id, doc.id)
                                }
                                type="button"
                              >
                                <X className="size-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Dropzone */}
                      <Dropzone
                        className="mt-4"
                        onFilesSelected={(files) =>
                          handleFilesSelected(category.id, files)
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tip */}
        <Card className="mt-6 bg-primary/5">
          <CardContent className="flex items-start gap-3 p-4">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" />
            <p className="text-muted-foreground text-sm">
              These are optional — you can always add them later. Your canvas
              will still include industry averages from our database.
            </p>
          </CardContent>
        </Card>
      </WizardStep>

      <WizardNavigation
        continueLabel="Continue"
        onBack={onBack}
        onContinue={onContinue}
      />
    </>
  );
}
