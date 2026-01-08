"use client";

import { useCallback, useState } from "react";
import {
  type CanvasType,
  type ContextState,
  MOCK_CLIENT,
  MOCK_UPLOADED_DOCUMENTS,
  type PriorityType,
  type UploadedDocument,
  type WizardStepId,
} from "./mock-data";

// Screen types
export type ScreenType = "dashboard" | "wizard" | "processing" | "editor";

// Prototype state interface
export interface PrototypeState {
  screen: ScreenType;
  wizardStep: WizardStepId;
  canvasType: CanvasType | null;
  documents: UploadedDocument[];
  context: ContextState;
  processingProgress: number;
  processingPhaseIndex: number;
}

// Initial state
const createInitialState = (): PrototypeState => ({
  screen: "dashboard",
  wizardStep: "upload-documents",
  canvasType: null,
  documents: [],
  context: {
    clientName: MOCK_CLIENT.name,
    renewalPeriod: "1/1/2022",
    expectedIncreasePercent: null,
    budgetComparison: null,
    nationalAveragePercent: null,
    regionalAveragePercent: null,
    industryAveragePercent: null,
    audience: null,
    priorities: [],
    presentationDepth: 50,
    strategyIdeas: "",
    additionalContext: "",
  },
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
  goToNextStep: () => void;
  goToPreviousStep: () => void;

  // Document management
  addDocuments: (docs: UploadedDocument[]) => void;
  addMockDocuments: () => void;
  removeDocument: (docId: string) => void;

  // Context management
  updateContext: (partial: Partial<ContextState>) => void;
  togglePriority: (priority: PriorityType) => void;

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
      wizardStep: "upload-documents",
      canvasType,
      documents: [],
      context: {
        clientName: MOCK_CLIENT.name,
        renewalPeriod: "1/1/2022",
        expectedIncreasePercent: null,
        budgetComparison: null,
        nationalAveragePercent: null,
        regionalAveragePercent: null,
        industryAveragePercent: null,
        audience: null,
        priorities: [],
        presentationDepth: 50,
        strategyIdeas: "",
        additionalContext: "",
      },
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

  // Wizard navigation - only 2 steps now
  const goToNextStep = useCallback(() => {
    setState((prev) => {
      if (prev.wizardStep === "upload-documents") {
        return { ...prev, wizardStep: "set-context" };
      }
      // If on set-context, trigger processing instead
      return prev;
    });
  }, []);

  const goToPreviousStep = useCallback(() => {
    setState((prev) => {
      if (prev.wizardStep === "set-context") {
        return { ...prev, wizardStep: "upload-documents" };
      }
      return prev;
    });
  }, []);

  // Document management
  const addDocuments = useCallback((docs: UploadedDocument[]) => {
    setState((prev) => ({
      ...prev,
      documents: [...prev.documents, ...docs],
    }));
  }, []);

  const addMockDocuments = useCallback(() => {
    // Simulate adding mock documents after a brief delay
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        documents: [...prev.documents, ...MOCK_UPLOADED_DOCUMENTS],
      }));
    }, 300);
  }, []);

  const removeDocument = useCallback((docId: string) => {
    setState((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== docId),
    }));
  }, []);

  // Context management
  const updateContext = useCallback((partial: Partial<ContextState>) => {
    setState((prev) => ({
      ...prev,
      context: { ...prev.context, ...partial },
    }));
  }, []);

  const togglePriority = useCallback((priority: PriorityType) => {
    setState((prev) => {
      const currentPriorities = prev.context.priorities;
      const isSelected = currentPriorities.includes(priority);

      let newPriorities: PriorityType[];
      if (isSelected) {
        // Remove if already selected
        newPriorities = currentPriorities.filter((p) => p !== priority);
      } else if (currentPriorities.length < 3) {
        // Add if under limit
        newPriorities = [...currentPriorities, priority];
      } else {
        // At limit, don't add
        return prev;
      }

      return {
        ...prev,
        context: { ...prev.context, priorities: newPriorities },
      };
    });
  }, []);

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
    goToNextStep,
    goToPreviousStep,
    addDocuments,
    addMockDocuments,
    removeDocument,
    updateContext,
    togglePriority,
    updateProcessingProgress,
    reset,
  };
}
