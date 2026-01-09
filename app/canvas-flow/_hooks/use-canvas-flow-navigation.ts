"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

export type WizardStepSlug = "document-upload" | "set-context" | "review-plan";
export type ScreenSlug = WizardStepSlug | "processing" | "editor";

const STEP_ORDER: ScreenSlug[] = [
  "document-upload",
  "set-context",
  "review-plan",
  "processing",
  "editor",
];

const WIZARD_STEPS: WizardStepSlug[] = [
  "document-upload",
  "set-context",
  "review-plan",
];

interface UseCanvasFlowNavigationReturn {
  canvasId: string;
  currentStep: ScreenSlug | null;
  currentStepIndex: number;
  isWizardStep: boolean;

  // Navigation
  goToStep: (step: ScreenSlug) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToDashboard: () => void;
  startProcessing: () => void;
  showEditor: () => void;

  // URL builders
  getStepUrl: (step: ScreenSlug) => string;
}

export function useCanvasFlowNavigation(): UseCanvasFlowNavigationReturn {
  const router = useRouter();
  const params = useParams();
  const canvasId = params.canvasId as string;

  // Determine current step from URL pathname
  const currentStep = useMemo((): ScreenSlug | null => {
    if (typeof window === "undefined") return null;

    const pathname = window.location.pathname;
    const segments = pathname.split("/").filter(Boolean);

    // URL pattern: /canvas-flow/[canvasId]/[step]
    // segments: ["canvas-flow", canvasId, step]
    if (segments.length >= 3 && segments[0] === "canvas-flow") {
      const step = segments[2] as ScreenSlug;
      if (STEP_ORDER.includes(step)) {
        return step;
      }
    }
    return null;
  }, []);

  const currentStepIndex = currentStep ? STEP_ORDER.indexOf(currentStep) : -1;
  const isWizardStep = currentStep
    ? WIZARD_STEPS.includes(currentStep as WizardStepSlug)
    : false;

  const getStepUrl = useCallback(
    (step: ScreenSlug): string => `/canvas-flow/${canvasId}/${step}`,
    [canvasId]
  );

  const goToStep = useCallback(
    (step: ScreenSlug) => {
      router.push(getStepUrl(step));
    },
    [router, getStepUrl]
  );

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < 0 || currentStepIndex >= STEP_ORDER.length - 1) {
      return;
    }
    const nextStep = STEP_ORDER[currentStepIndex + 1];
    goToStep(nextStep);
  }, [currentStepIndex, goToStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex <= 0) {
      return;
    }
    const prevStep = STEP_ORDER[currentStepIndex - 1];
    goToStep(prevStep);
  }, [currentStepIndex, goToStep]);

  const goToDashboard = useCallback(() => {
    router.push("/canvas-flow");
  }, [router]);

  const startProcessing = useCallback(() => {
    goToStep("processing");
  }, [goToStep]);

  const showEditor = useCallback(() => {
    goToStep("editor");
  }, [goToStep]);

  return {
    canvasId,
    currentStep,
    currentStepIndex,
    isWizardStep,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    goToDashboard,
    startProcessing,
    showEditor,
    getStepUrl,
  };
}
