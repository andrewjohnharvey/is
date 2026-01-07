"use client";

import { Check, LogOut } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MOCK_CLIENT,
  MOCK_DOCUMENTS,
  STEP_CONTENT,
  WIZARD_STEPS,
  type WizardStepId,
} from "./mock-data";
import type { UsePrototypeStateReturn } from "./prototype-state";
import { StepDocumentUploadWrapper } from "./step-document-upload-wrapper";
import { StepReview } from "./step-review";
import { StepWelcome } from "./step-welcome";

interface PrototypeWizardProps {
  prototype: UsePrototypeStateReturn;
}

export function PrototypeWizard({ prototype }: PrototypeWizardProps) {
  const { state } = prototype;

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <WizardSidebar
        completedSteps={state.completedSteps}
        currentStep={state.wizardStep}
        isStepAccessible={prototype.isStepAccessible}
        onSaveAndExit={prototype.goToDashboard}
        onStepClick={prototype.goToWizardStep}
        progress={prototype.getProgress()}
        skippedSteps={state.skippedSteps}
      />

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <WizardStepContent prototype={prototype} />
      </main>
    </div>
  );
}

// Sidebar component
interface WizardSidebarProps {
  currentStep: WizardStepId;
  completedSteps: WizardStepId[];
  skippedSteps: WizardStepId[];
  progress: number;
  onStepClick: (stepId: WizardStepId) => void;
  onSaveAndExit: () => void;
  isStepAccessible: (stepId: WizardStepId) => boolean;
}

function WizardSidebar({
  currentStep,
  completedSteps,
  skippedSteps,
  progress,
  onStepClick,
  onSaveAndExit,
  isStepAccessible,
}: WizardSidebarProps) {
  return (
    <aside className="flex w-72 flex-col border-border border-r bg-card">
      {/* Steps */}
      <div className="flex-1 p-6">
        <nav className="flex flex-col gap-1">
          {WIZARD_STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isSkipped = skippedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isAccessible = isStepAccessible(step.id);

            return (
              <button
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${isCurrent ? "bg-primary/10 font-medium text-primary" : ""}
                  ${isAccessible && !isCurrent ? "cursor-pointer hover:bg-muted" : ""}
                  ${isAccessible ? "" : "cursor-not-allowed opacity-50"}
                `}
                disabled={!isAccessible}
                key={step.id}
                onClick={() => isAccessible && onStepClick(step.id)}
                type="button"
              >
                <StepIndicator
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  isSkipped={isSkipped}
                  stepNumber={step.stepNumber}
                />
                <span>{step.label}</span>
                {step.isOptional && (
                  <span className="ml-auto text-muted-foreground text-xs">
                    Optional
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Progress + Save */}
      <div className="border-border border-t p-6">
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress className="h-2" value={progress} />
        </div>
        <p className="mb-4 text-muted-foreground text-xs">
          Progress saved automatically
        </p>
        <Button
          className="w-full"
          onClick={onSaveAndExit}
          size="sm"
          variant="outline"
        >
          <LogOut className="mr-2 size-4" />
          Save & Exit
        </Button>
      </div>
    </aside>
  );
}

// Step indicator circle
interface StepIndicatorProps {
  stepNumber: number;
  isCompleted: boolean;
  isSkipped: boolean;
  isCurrent: boolean;
}

function StepIndicator({
  stepNumber,
  isCompleted,
  isSkipped,
  isCurrent,
}: StepIndicatorProps) {
  if (isCompleted) {
    return (
      <div className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-3.5" />
      </div>
    );
  }

  if (isSkipped) {
    return (
      <div className="flex size-6 items-center justify-center rounded-full border-2 border-muted-foreground text-muted-foreground">
        <span className="text-xs">-</span>
      </div>
    );
  }

  if (isCurrent) {
    return (
      <div className="flex size-6 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs">
        {stepNumber}
      </div>
    );
  }

  return (
    <div className="flex size-6 items-center justify-center rounded-full border-2 border-muted text-muted-foreground text-xs">
      {stepNumber}
    </div>
  );
}

// Main content renderer
interface WizardStepContentProps {
  prototype: UsePrototypeStateReturn;
}

function WizardStepContent({ prototype }: WizardStepContentProps) {
  const { state } = prototype;
  const stepContent = STEP_CONTENT[state.wizardStep];

  // Fake upload handler - adds mock documents after a brief delay
  const handleFakeUpload = useCallback(
    (category: string) => {
      const mockDocs = MOCK_DOCUMENTS[category];
      if (mockDocs && mockDocs.length > 0) {
        // Simulate upload delay
        setTimeout(() => {
          prototype.addDocuments(category, mockDocs);
        }, 300);
      }
    },
    [prototype]
  );

  switch (state.wizardStep) {
    case "welcome":
      return (
        <StepWelcome
          canvasType={state.canvasType}
          clientName={MOCK_CLIENT.name}
          onContinue={prototype.goToNextStep}
        />
      );

    case "current-plans":
      return (
        <StepDocumentUploadWrapper
          category="currentPlans"
          clientName={MOCK_CLIENT.name}
          description={stepContent.description}
          documents={prototype.getDocuments("currentPlans")}
          hint={stepContent.hint}
          onBack={prototype.goToPreviousStep}
          onContinue={prototype.goToNextStep}
          onFakeUpload={() => handleFakeUpload("currentPlans")}
          onRemoveDocument={(docId) =>
            prototype.removeDocument("currentPlans", docId)
          }
          stepId="current-plans"
          title={stepContent.title}
        />
      );

    case "financial":
      return (
        <StepDocumentUploadWrapper
          category="financial"
          clientName={MOCK_CLIENT.name}
          description={stepContent.description}
          documents={prototype.getDocuments("financial")}
          hint={stepContent.hint}
          onBack={prototype.goToPreviousStep}
          onContinue={prototype.goToNextStep}
          onFakeUpload={() => handleFakeUpload("financial")}
          onRemoveDocument={(docId) =>
            prototype.removeDocument("financial", docId)
          }
          recommendation={stepContent.recommendation}
          stepId="financial"
          title={stepContent.title}
        />
      );

    case "renewal":
      return (
        <StepDocumentUploadWrapper
          category="renewal"
          clientName={MOCK_CLIENT.name}
          description={stepContent.description}
          documents={prototype.getDocuments("renewal")}
          hint={stepContent.hint}
          isOptional
          onBack={prototype.goToPreviousStep}
          onContinue={prototype.goToNextStep}
          onFakeUpload={() => handleFakeUpload("renewal")}
          onRemoveDocument={(docId) =>
            prototype.removeDocument("renewal", docId)
          }
          onSkip={prototype.skipCurrentStep}
          stepId="renewal"
          title={stepContent.title}
        />
      );

    case "census":
      return (
        <StepDocumentUploadWrapper
          category="census"
          clientName={MOCK_CLIENT.name}
          description={stepContent.description}
          documents={prototype.getDocuments("census")}
          hint={stepContent.hint}
          onBack={prototype.goToPreviousStep}
          onContinue={prototype.goToNextStep}
          onFakeUpload={() => handleFakeUpload("census")}
          onRemoveDocument={(docId) =>
            prototype.removeDocument("census", docId)
          }
          stepId="census"
          title={stepContent.title}
        />
      );

    case "review":
      return (
        <StepReview
          canvasType={state.canvasType}
          clientName={MOCK_CLIENT.name}
          documents={state.documents}
          onBack={prototype.goToPreviousStep}
          onGenerate={prototype.startProcessing}
        />
      );

    default:
      return null;
  }
}
