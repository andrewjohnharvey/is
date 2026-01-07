"use client";

import type { UsePrototypeStateReturn } from "./prototype-state";
import { StepIndicator } from "./step-indicator";
import { StepSetContext } from "./step-set-context";
import { StepUploadDocuments } from "./step-upload-documents";

type PrototypeWizardProps = {
  prototype: UsePrototypeStateReturn;
};

export function PrototypeWizard({ prototype }: PrototypeWizardProps) {
  const { state } = prototype;
  const currentStep = state.wizardStep === "upload-documents" ? 1 : 2;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Step Indicator */}
      <div className="border-border border-b">
        <StepIndicator currentStep={currentStep as 1 | 2} />
      </div>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <WizardStepContent prototype={prototype} />
      </main>
    </div>
  );
}

type WizardStepContentProps = {
  prototype: UsePrototypeStateReturn;
};

function WizardStepContent({ prototype }: WizardStepContentProps) {
  const { state } = prototype;

  switch (state.wizardStep) {
    case "upload-documents":
      return (
        <StepUploadDocuments
          documents={state.documents}
          onAddMockDocuments={prototype.addMockDocuments}
          onContinue={prototype.goToNextStep}
          onRemoveDocument={prototype.removeDocument}
        />
      );

    case "set-context":
      return (
        <StepSetContext
          context={state.context}
          onBack={prototype.goToPreviousStep}
          onContinue={prototype.startProcessing}
          onTogglePriority={prototype.togglePriority}
          onUpdateContext={prototype.updateContext}
        />
      );

    default:
      return null;
  }
}
