"use client";

import { useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { StepIndicator } from "../../_components/step-indicator";
import { StepSetContext } from "../../_components/step-set-context";
import { useCanvasFlowNavigation } from "../../_hooks/use-canvas-flow-navigation";
import { useCanvasFlow } from "../_context/canvas-flow-context";

export default function SetContextPage() {
  const { canvasId, formState, updateContext, togglePriority } =
    useCanvasFlow();
  const { goToNextStep, goToPreviousStep } = useCanvasFlowNavigation();

  // Check prerequisite: must have documents uploaded
  const documents = useQuery(api.documents.listByCanvas, { canvasId });

  // Redirect if no documents uploaded
  if (documents !== undefined && documents.length === 0) {
    redirect(`/canvas-flow/${canvasId}/document-upload`);
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Step Indicator */}
      <div className="border-border border-b">
        <StepIndicator currentStep={2} />
      </div>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <StepSetContext
          context={formState.context}
          onBack={goToPreviousStep}
          onContinue={goToNextStep}
          onTogglePriority={togglePriority}
          onUpdateContext={updateContext}
        />
      </main>
    </div>
  );
}
