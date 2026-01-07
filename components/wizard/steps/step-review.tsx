"use client";

import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Calendar,
  Check,
  DollarSign,
  FileText,
  Pencil,
  Pin,
  Scale,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { WizardStep } from "@/components/wizard/wizard-step";
import type { CanvasType } from "@/lib/canvas-types";
import { cn } from "@/lib/utils";
import type { DocumentCategory, WizardDocument } from "@/lib/wizard-types";

const CANVAS_TYPE_LABELS: Record<CanvasType, string> = {
  general: "General Presentation",
  pre_renewal: "Pre-Renewal Analysis",
  renewal: "Renewal Presentation",
  post_renewal: "Post-Renewal Summary",
  workforce_investment: "Cost Analysis",
  benchmarking: "Benchmarking Report",
  strategic_roadmap: "Strategic Roadmap",
};

const DOCUMENT_CATEGORIES: {
  id: DocumentCategory;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "currentPlans",
    label: "Current Plans",
    icon: <BookOpen className="size-4" />,
  },
  {
    id: "financial",
    label: "Financial",
    icon: <DollarSign className="size-4" />,
  },
  {
    id: "renewal",
    label: "Renewal Package",
    icon: <FileText className="size-4" />,
  },
  { id: "census", label: "Census", icon: <Users className="size-4" /> },
  {
    id: "benchmarking",
    label: "Benchmarking",
    icon: <BarChart3 className="size-4" />,
  },
  { id: "compliance", label: "Compliance", icon: <Scale className="size-4" /> },
  { id: "other", label: "Other", icon: <Pin className="size-4" /> },
];

interface StepReviewProps {
  clientName: string | null;
  clientIndustry: string | null;
  clientLocation: string | null;
  clientEmployeeCount: number | null;
  renewalDate: Date | null;
  canvasType: CanvasType | null;
  documents: Record<DocumentCategory, WizardDocument[]>;
  onBack: () => void;
  onGenerate: () => void;
  onEditStep: (
    step: "client" | "renewal-period" | "canvas-type" | "documents"
  ) => void;
  missingRecommendations?: string[];
}

export function StepReview({
  clientName,
  clientIndustry,
  clientLocation,
  clientEmployeeCount,
  renewalDate,
  canvasType,
  documents,
  onBack,
  onGenerate,
  onEditStep,
  missingRecommendations = [],
}: StepReviewProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalDocuments = Object.values(documents).reduce(
    (sum, docs) => sum + docs.length,
    0
  );

  const getDocumentNames = (category: DocumentCategory) => {
    const docs = documents[category];
    if (docs.length === 0) return "-";
    if (docs.length <= 2)
      return docs.map((d) => d.name.split(".")[0]).join(", ");
    return `${docs[0].name.split(".")[0]}, ${docs[1].name.split(".")[0]}, +${docs.length - 2} more`;
  };

  return (
    <>
      <WizardStep stepId="review" title="Let's review before generating">
        {/* Client section */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Client
                </h3>
                <p className="mt-1 font-semibold text-lg">
                  {clientName || "Not selected"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {[
                    clientIndustry,
                    clientLocation,
                    clientEmployeeCount &&
                      `${clientEmployeeCount.toLocaleString()} employees`,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>
              <Button
                onClick={() => onEditStep("client")}
                size="sm"
                variant="ghost"
              >
                <Pencil className="size-3" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Presentation section */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Presentation
                </h3>
                <p className="mt-1 font-semibold">
                  {canvasType ? CANVAS_TYPE_LABELS[canvasType] : "Not selected"}
                </p>
                <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Calendar className="size-3" />
                  Effective {formatDate(renewalDate)}
                </p>
              </div>
              <Button
                onClick={() => onEditStep("canvas-type")}
                size="sm"
                variant="ghost"
              >
                <Pencil className="size-3" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents section */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Documents ({totalDocuments} total)
                </h3>
              </div>
              <Button
                onClick={() => onEditStep("documents")}
                size="sm"
                variant="ghost"
              >
                <Pencil className="size-3" />
                Edit
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {DOCUMENT_CATEGORIES.map((category) => {
                const categoryDocs = documents[category.id];
                const hasDocuments = categoryDocs.length > 0;

                return (
                  <div
                    className="flex items-center gap-3 text-sm"
                    key={category.id}
                  >
                    <span
                      className={cn(
                        hasDocuments
                          ? "text-green-600"
                          : "text-muted-foreground/50"
                      )}
                    >
                      {hasDocuments ? (
                        <Check className="size-4" />
                      ) : (
                        <span className="flex size-4 items-center justify-center">
                          ○
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "w-28 shrink-0",
                        !hasDocuments && "text-muted-foreground"
                      )}
                    >
                      {category.label} ({categoryDocs.length})
                    </span>
                    <span className="flex-1 truncate text-muted-foreground">
                      {getDocumentNames(category.id)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {missingRecommendations.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <div>
                  <h4 className="font-medium text-amber-800 text-sm">
                    Optional Enhancement
                  </h4>
                  <p className="mt-1 text-amber-700 text-sm">
                    Adding {missingRecommendations.join(" or ")} would improve
                    your analysis.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={() => onEditStep("documents")}
                      size="sm"
                      variant="outline"
                    >
                      Add Now
                    </Button>
                    <Button size="sm" variant="ghost">
                      Continue Without
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </WizardStep>

      <WizardNavigation
        continueLabel="Generate Canvas"
        onBack={onBack}
        onContinue={onGenerate}
      />
    </>
  );
}
