"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { StepIndicator } from "../../_components/step-indicator";
import { StepReviewPlan } from "../../_components/step-review-plan";
import { useCanvasFlowNavigation } from "../../_hooks/use-canvas-flow-navigation";
import { useCanvasFlow } from "../_context/canvas-flow-context";

export default function ReviewPlanPage() {
  const { canvasId, formState, generatePlan, regeneratePlan } = useCanvasFlow();
  const { goToPreviousStep, startProcessing } = useCanvasFlowNavigation();

  // Direct mutation for removing sections (persists to Convex)
  const removeSectionMutation = useMutation(
    api.canvasPlanHelpers.removeSection
  );

  const handleRemoveSection = async (sectionId: string) => {
    await removeSectionMutation({ canvasId, sectionId });
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Step Indicator */}
      <div className="border-border border-b">
        <StepIndicator currentStep={3} />
      </div>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <StepReviewPlan
          canvasId={canvasId}
          isPlanGenerating={formState.isPlanGenerating}
          onBack={goToPreviousStep}
          onContinue={startProcessing}
          onGeneratePlan={generatePlan}
          onRegeneratePlan={regeneratePlan}
          onRemoveSection={handleRemoveSection}
          plan={formState.plan}
        />
      </main>
    </div>
  );
}
