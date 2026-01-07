"use client";

import { Edit, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import type { CanvasType, MockDocument } from "./mock-data";
import { PrototypeStep } from "./prototype-step";

interface StepReviewProps {
  clientName: string;
  canvasType: CanvasType | null;
  documents: Record<string, MockDocument[]>;
  onBack: () => void;
  onGenerate: () => void;
}

const CANVAS_TYPE_LABELS: Record<CanvasType, string> = {
  renewal: "Renewal Presentation",
  "pre-renewal": "Pre-Renewal Analysis",
  benchmarking: "Benchmarking Report",
  "cost-analysis": "Cost Analysis",
};

const CATEGORY_LABELS: Record<string, string> = {
  currentPlans: "Current Plans",
  financial: "Financial Data",
  renewal: "Renewal Package",
  census: "Census Data",
};

export function StepReview({
  clientName,
  canvasType,
  documents,
  onBack,
  onGenerate,
}: StepReviewProps) {
  const totalDocCount = Object.values(documents).reduce(
    (sum, docs) => sum + docs.length,
    0
  );

  const canvasLabel = canvasType ? CANVAS_TYPE_LABELS[canvasType] : "Canvas";

  return (
    <>
      <PrototypeStep
        clientName={clientName}
        description="Confirm everything looks correct before we generate your presentation"
        stepId="review"
        title="Review Your Canvas"
      >
        {/* Canvas Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium text-muted-foreground text-sm">
                CANVAS
              </h3>
              <Button size="sm" variant="ghost">
                <Edit className="mr-1 size-3" />
                Edit
              </Button>
            </div>
            <p className="font-medium">{canvasLabel}</p>
            <p className="text-muted-foreground text-sm">{clientName}</p>
            <p className="text-muted-foreground text-sm">
              Effective: January 1, 2025
            </p>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium text-muted-foreground text-sm">
                DOCUMENTS ({totalDocCount} total)
              </h3>
              <Button size="sm" variant="ghost">
                <Edit className="mr-1 size-3" />
                Edit
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {Object.entries(documents).map(([category, docs]) => {
                if (docs.length === 0) return null;
                return (
                  <div
                    className="flex items-center justify-between text-sm"
                    key={category}
                  >
                    <span>{CATEGORY_LABELS[category] || category}</span>
                    <Badge variant="secondary">{docs.length}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Missing recommendation */}
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 p-4">
            <FileText className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800 text-sm">
                Missing: Large claimant report
              </p>
              <p className="text-amber-700 text-sm">
                Adding this document would improve trend analysis accuracy
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional context */}
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium text-muted-foreground text-sm">
                ADDITIONAL CONTEXT
              </h3>
              <Button size="sm" variant="ghost">
                <Edit className="mr-1 size-3" />
                Edit
              </Button>
            </div>
            <p className="text-muted-foreground text-sm italic">
              "Client had a large claimant in Q3 that skewed medical costs. They
              are also considering a plan design change for the coming year..."
            </p>
          </CardContent>
        </Card>
      </PrototypeStep>

      <WizardNavigation
        canContinue
        className="shrink-0"
        continueLabel="Generate Canvas"
        onBack={onBack}
        onContinue={onGenerate}
      />
    </>
  );
}
