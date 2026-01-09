"use client";

import { StepIndicator } from "../../_components/step-indicator";
import { StepUploadDocuments } from "../../_components/step-upload-documents";
import { useCanvasFlowNavigation } from "../../_hooks/use-canvas-flow-navigation";
import { useCanvasFlow } from "../_context/canvas-flow-context";

export default function DocumentUploadPage() {
  const { canvasId, clientId } = useCanvasFlow();
  const { goToNextStep } = useCanvasFlowNavigation();

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Step Indicator */}
      <div className="border-border border-b">
        <StepIndicator currentStep={1} />
      </div>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <StepUploadDocuments
          canvasId={canvasId}
          clientId={clientId}
          onContinue={goToNextStep}
        />
      </main>
    </div>
  );
}
