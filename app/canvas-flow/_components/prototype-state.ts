"use client";

import { useCallback, useState } from "react";
import type { CanvasType, MockDocument, WizardStepId } from "./mock-data";
import { WIZARD_STEPS } from "./mock-data";

// Screen types
export type ScreenType = "dashboard" | "wizard" | "processing" | "editor";

// Prototype state interface
export interface PrototypeState {
  screen: ScreenType;
  wizardStep: WizardStepId;
  canvasType: CanvasType | null;
  documents: Record<string, MockDocument[]>;
  completedSteps: WizardStepId[];
  skippedSteps: WizardStepId[];
  processingProgress: number;
  processingPhaseIndex: number;
}

// Initial state
const createInitialState = (): PrototypeState => ({
  screen: "dashboard",
  wizardStep: "welcome",
  canvasType: null,
  documents: {
    currentPlans: [],
    financial: [],
    renewal: [],
    census: [],
  },
  completedSteps: [],
  skippedSteps: [],
  processingProgress: 0,
  processingPhaseIndex: 0,
});

// Hook return type
export interface UsePrototypeStateReturn {
  state: PrototypeState;

  // Screen navigation
  goToDashboard: () => void;
  startWizard: (canvasType: CanvasType) => void;
  startProcessing: () => void;
  showEditor: () => void;

  // Wizard navigation
  goToWizardStep: (stepId: WizardStepId) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  skipCurrentStep: () => void;

  // Step state
  isStepCompleted: (stepId: WizardStepId) => boolean;
  isStepAccessible: (stepId: WizardStepId) => boolean;
  getProgress: () => number;

  // Document management
  addDocuments: (category: string, docs: MockDocument[]) => void;
  removeDocument: (category: string, docId: string) => void;
  getDocuments: (category: string) => MockDocument[];
  getTotalDocumentCount: () => number;

  // Processing
  updateProcessingProgress: (progress: number, phaseIndex: number) => void;

  // Reset
  reset: () => void;
}

export function usePrototypeState(): UsePrototypeStateReturn {
  const [state, setState] = useState<PrototypeState>(createInitialState);

  // Screen navigation
  const goToDashboard = useCallback(() => {
    setState(createInitialState());
  }, []);

  const startWizard = useCallback((canvasType: CanvasType) => {
    setState((prev) => ({
      ...prev,
      screen: "wizard",
      wizardStep: "welcome",
      canvasType,
      documents: {
        currentPlans: [],
        financial: [],
        renewal: [],
        census: [],
      },
      completedSteps: [],
      skippedSteps: [],
    }));
  }, []);

  const startProcessing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: "processing",
      processingProgress: 0,
      processingPhaseIndex: 0,
    }));
  }, []);

  const showEditor = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screen: "editor",
    }));
  }, []);

  // Wizard navigation helpers
  const getStepIndex = (stepId: WizardStepId): number =>
    WIZARD_STEPS.findIndex((s) => s.id === stepId);

  const getNextStepId = (currentStepId: WizardStepId): WizardStepId | null => {
    const currentIndex = getStepIndex(currentStepId);
    if (currentIndex < WIZARD_STEPS.length - 1) {
      return WIZARD_STEPS[currentIndex + 1].id;
    }
    return null;
  };

  const getPreviousStepId = (
    currentStepId: WizardStepId
  ): WizardStepId | null => {
    const currentIndex = getStepIndex(currentStepId);
    if (currentIndex > 0) {
      return WIZARD_STEPS[currentIndex - 1].id;
    }
    return null;
  };

  // Wizard navigation
  const goToWizardStep = useCallback((stepId: WizardStepId) => {
    setState((prev) => ({
      ...prev,
      wizardStep: stepId,
    }));
  }, []);

  const goToNextStep = useCallback(() => {
    setState((prev) => {
      const nextStep = getNextStepId(prev.wizardStep);
      if (!nextStep) return prev;

      return {
        ...prev,
        wizardStep: nextStep,
        completedSteps: prev.completedSteps.includes(prev.wizardStep)
          ? prev.completedSteps
          : [...prev.completedSteps, prev.wizardStep],
      };
    });
  }, []);

  const goToPreviousStep = useCallback(() => {
    setState((prev) => {
      const prevStep = getPreviousStepId(prev.wizardStep);
      if (!prevStep) return prev;

      return {
        ...prev,
        wizardStep: prevStep,
      };
    });
  }, []);

  const skipCurrentStep = useCallback(() => {
    setState((prev) => {
      const nextStep = getNextStepId(prev.wizardStep);
      if (!nextStep) return prev;

      return {
        ...prev,
        wizardStep: nextStep,
        skippedSteps: prev.skippedSteps.includes(prev.wizardStep)
          ? prev.skippedSteps
          : [...prev.skippedSteps, prev.wizardStep],
      };
    });
  }, []);

  // Step state
  const isStepCompleted = useCallback(
    (stepId: WizardStepId) => state.completedSteps.includes(stepId),
    [state.completedSteps]
  );

  const isStepAccessible = useCallback(
    (stepId: WizardStepId) => {
      if (stepId === "welcome") return true;
      if (stepId === state.wizardStep) return true;
      return (
        state.completedSteps.includes(stepId) ||
        state.skippedSteps.includes(stepId)
      );
    },
    [state.wizardStep, state.completedSteps, state.skippedSteps]
  );

  const getProgress = useCallback(() => {
    const completedCount =
      state.completedSteps.length + state.skippedSteps.length;
    return Math.round((completedCount / WIZARD_STEPS.length) * 100);
  }, [state.completedSteps, state.skippedSteps]);

  // Document management
  const addDocuments = useCallback((category: string, docs: MockDocument[]) => {
    setState((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [category]: [...(prev.documents[category] || []), ...docs],
      },
    }));
  }, []);

  const removeDocument = useCallback((category: string, docId: string) => {
    setState((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [category]: (prev.documents[category] || []).filter(
          (d) => d.id !== docId
        ),
      },
    }));
  }, []);

  const getDocuments = useCallback(
    (category: string) => state.documents[category] || [],
    [state.documents]
  );

  const getTotalDocumentCount = useCallback(
    () =>
      Object.values(state.documents).reduce(
        (sum, docs) => sum + docs.length,
        0
      ),
    [state.documents]
  );

  // Processing
  const updateProcessingProgress = useCallback(
    (progress: number, phaseIndex: number) => {
      setState((prev) => ({
        ...prev,
        processingProgress: progress,
        processingPhaseIndex: phaseIndex,
      }));
    },
    []
  );

  // Reset
  const reset = useCallback(() => {
    setState(createInitialState());
  }, []);

  return {
    state,
    goToDashboard,
    startWizard,
    startProcessing,
    showEditor,
    goToWizardStep,
    goToNextStep,
    goToPreviousStep,
    skipCurrentStep,
    isStepCompleted,
    isStepAccessible,
    getProgress,
    addDocuments,
    removeDocument,
    getDocuments,
    getTotalDocumentCount,
    updateProcessingProgress,
    reset,
  };
}
