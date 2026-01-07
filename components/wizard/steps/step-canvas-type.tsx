"use client";

import {
  BarChart3,
  DollarSign,
  FileText,
  Presentation,
  Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { WizardStep } from "@/components/wizard/wizard-step";
import type { CanvasType } from "@/lib/canvas-types";
import { cn } from "@/lib/utils";

interface CanvasTypeOption {
  type: CanvasType;
  title: string;
  description: string;
  bestFor: string;
  icon: React.ReactNode;
  isRecommended?: boolean;
}

const CANVAS_TYPES: CanvasTypeOption[] = [
  {
    type: "renewal",
    title: "Renewal Presentation",
    description: "Complete renewal analysis with options and recommendations",
    bestFor: "Annual renewal meetings with decision-makers",
    icon: <Presentation className="size-5" />,
    isRecommended: true,
  },
  {
    type: "pre_renewal",
    title: "Pre-Renewal Analysis",
    description: "Early look at trends before carrier quotes arrive",
    bestFor: "Planning meetings 60-90 days before renewal",
    icon: <FileText className="size-5" />,
  },
  {
    type: "benchmarking",
    title: "Benchmarking Report",
    description: "Industry comparison focused on plan competitiveness",
    bestFor: "Strategic planning and competitive analysis",
    icon: <BarChart3 className="size-5" />,
  },
  {
    type: "workforce_investment",
    title: "Cost Analysis",
    description: "Deep dive into claims experience and cost drivers",
    bestFor: "CFO/finance-focused conversations",
    icon: <DollarSign className="size-5" />,
  },
];

interface StepCanvasTypeProps {
  selectedType: CanvasType | null;
  onSelectType: (type: CanvasType) => void;
  onBack: () => void;
  onContinue: () => void;
  clientName?: string | null;
}

export function StepCanvasType({
  selectedType,
  onSelectType,
  onBack,
  onContinue,
  clientName,
}: StepCanvasTypeProps) {
  return (
    <>
      <WizardStep
        clientName={clientName}
        description="Choose the format that best fits your meeting goals."
        stepId="canvas-type"
        title="What type of presentation do you need?"
      >
        <div className="flex flex-col gap-3">
          {CANVAS_TYPES.map((option) => (
            <Card
              className={cn(
                "cursor-pointer p-4 transition-all hover:border-primary",
                selectedType === option.type &&
                  "border-primary bg-primary/5 ring-1 ring-primary"
              )}
              key={option.type}
              onClick={() => onSelectType(option.type)}
            >
              <div className="flex items-start gap-4">
                {/* Radio indicator */}
                <div
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                    selectedType === option.type
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  )}
                >
                  {selectedType === option.type && (
                    <div className="size-2 rounded-full bg-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{option.icon}</span>
                    <h4 className="font-semibold">{option.title}</h4>
                    {option.isRecommended && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 text-xs">
                        <Star className="size-3 fill-amber-500" />
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {option.description}
                  </p>
                  <p className="mt-1.5 text-muted-foreground text-xs">
                    Best for: {option.bestFor}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tip */}
        <p className="mt-6 text-center text-muted-foreground text-sm">
          Not sure? Renewal Presentation works for most situations.
        </p>
      </WizardStep>

      <WizardNavigation
        canContinue={selectedType !== null}
        onBack={onBack}
        onContinue={onContinue}
      />
    </>
  );
}
