"use client";

import { useCallback, useState } from "react";

import type { CanvasType } from "@/lib/canvas-types";
import {
  calculateProgress,
  createInitialWizardState,
  type DocumentCategory,
  getNextStep,
  getPreviousStep,
  type WizardDocument,
  type WizardState,
  type WizardStepId,
} from "@/lib/wizard-types";

export interface UseWizardStateReturn {
  state: WizardState;
  progress: number;

  // Navigation
  goToStep: (stepId: WizardStepId) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;

  // Step completion
  completeCurrentStep: () => void;
  skipCurrentStep: () => void;
  isStepCompleted: (stepId: WizardStepId) => boolean;
  isStepAccessible: (stepId: WizardStepId) => boolean;

  // Data setters
  setClient: (data: {
    id: string;
    name: string;
    industry?: string;
    location?: string;
    employeeCount?: number;
  }) => void;
  setRenewalDate: (date: Date) => void;
  setCanvasType: (type: CanvasType) => void;
  setHasRenewalPackage: (value: boolean) => void;

  // Document management
  addDocument: (category: DocumentCategory, document: WizardDocument) => void;
  addDocuments: (
    category: DocumentCategory,
    documents: WizardDocument[]
  ) => void;
  removeDocument: (category: DocumentCategory, documentId: string) => void;
  getDocuments: (category: DocumentCategory) => WizardDocument[];
  getTotalDocumentCount: () => number;

  // Generation
  startGeneration: () => void;
  updateGenerationProgress: (progress: number, phase: string) => void;
  completeGeneration: () => void;

  // Reset
  reset: () => void;
}

export function useWizardState(): UseWizardStateReturn {
  const [state, setState] = useState<WizardState>(createInitialWizardState);

  const progress = calculateProgress(state);

  // Navigation
  const goToStep = useCallback((stepId: WizardStepId) => {
    setState((prev) => ({
      ...prev,
      currentStepId: stepId,
      lastSavedAt: new Date(),
    }));
  }, []);

  const goToNextStep = useCallback(() => {
    const nextStep = getNextStep(state.currentStepId);
    if (nextStep) {
      setState((prev) => ({
        ...prev,
        currentStepId: nextStep,
        completedSteps: prev.completedSteps.includes(prev.currentStepId)
          ? prev.completedSteps
          : [...prev.completedSteps, prev.currentStepId],
        lastSavedAt: new Date(),
      }));
    }
  }, [state.currentStepId]);

  const goToPreviousStep = useCallback(() => {
    const prevStep = getPreviousStep(state.currentStepId);
    if (prevStep) {
      setState((prev) => ({
        ...prev,
        currentStepId: prevStep,
        lastSavedAt: new Date(),
      }));
    }
  }, [state.currentStepId]);

  const canGoNext = getNextStep(state.currentStepId) !== null;
  const canGoPrevious = getPreviousStep(state.currentStepId) !== null;

  // Step completion
  const completeCurrentStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(prev.currentStepId)
        ? prev.completedSteps
        : [...prev.completedSteps, prev.currentStepId],
      lastSavedAt: new Date(),
    }));
  }, []);

  const skipCurrentStep = useCallback(() => {
    const nextStep = getNextStep(state.currentStepId);
    if (nextStep) {
      setState((prev) => ({
        ...prev,
        currentStepId: nextStep,
        skippedSteps: prev.skippedSteps.includes(prev.currentStepId)
          ? prev.skippedSteps
          : [...prev.skippedSteps, prev.currentStepId],
        lastSavedAt: new Date(),
      }));
    }
  }, [state.currentStepId]);

  const isStepCompleted = useCallback(
    (stepId: WizardStepId) => state.completedSteps.includes(stepId),
    [state.completedSteps]
  );

  const isStepAccessible = useCallback(
    (stepId: WizardStepId) => {
      // Welcome is always accessible
      if (stepId === "welcome") return true;
      // Current step is accessible
      if (stepId === state.currentStepId) return true;
      // Completed steps are accessible
      return state.completedSteps.includes(stepId);
    },
    [state.currentStepId, state.completedSteps]
  );

  // Data setters
  const setClient = useCallback(
    (data: {
      id: string;
      name: string;
      industry?: string;
      location?: string;
      employeeCount?: number;
    }) => {
      setState((prev) => ({
        ...prev,
        clientId: data.id,
        clientName: data.name,
        clientIndustry: data.industry ?? null,
        clientLocation: data.location ?? null,
        clientEmployeeCount: data.employeeCount ?? null,
        lastSavedAt: new Date(),
      }));
    },
    []
  );

  const setRenewalDate = useCallback((date: Date) => {
    setState((prev) => ({
      ...prev,
      renewalDate: date,
      lastSavedAt: new Date(),
    }));
  }, []);

  const setCanvasType = useCallback((type: CanvasType) => {
    setState((prev) => ({
      ...prev,
      canvasType: type,
      lastSavedAt: new Date(),
    }));
  }, []);

  const setHasRenewalPackage = useCallback((value: boolean) => {
    setState((prev) => ({
      ...prev,
      hasRenewalPackage: value,
      lastSavedAt: new Date(),
    }));
  }, []);

  // Document management
  const addDocument = useCallback(
    (category: DocumentCategory, document: WizardDocument) => {
      setState((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [category]: [...prev.documents[category], document],
        },
        lastSavedAt: new Date(),
      }));
    },
    []
  );

  const addDocuments = useCallback(
    (category: DocumentCategory, documents: WizardDocument[]) => {
      setState((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [category]: [...prev.documents[category], ...documents],
        },
        lastSavedAt: new Date(),
      }));
    },
    []
  );

  const removeDocument = useCallback(
    (category: DocumentCategory, documentId: string) => {
      setState((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [category]: prev.documents[category].filter(
            (d) => d.id !== documentId
          ),
        },
        lastSavedAt: new Date(),
      }));
    },
    []
  );

  const getDocuments = useCallback(
    (category: DocumentCategory) => state.documents[category],
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

  // Generation
  const startGeneration = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStepId: "processing",
      isGenerating: true,
      generationProgress: 0,
      generationPhase: "Initializing...",
      lastSavedAt: new Date(),
    }));
  }, []);

  const updateGenerationProgress = useCallback(
    (progress: number, phase: string) => {
      setState((prev) => ({
        ...prev,
        generationProgress: progress,
        generationPhase: phase,
      }));
    },
    []
  );

  const completeGeneration = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStepId: "success",
      isGenerating: false,
      generationProgress: 100,
      completedSteps: [...prev.completedSteps, "processing"],
      lastSavedAt: new Date(),
    }));
  }, []);

  // Reset
  const reset = useCallback(() => {
    setState(createInitialWizardState());
  }, []);

  return {
    state,
    progress,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canGoNext,
    canGoPrevious,
    completeCurrentStep,
    skipCurrentStep,
    isStepCompleted,
    isStepAccessible,
    setClient,
    setRenewalDate,
    setCanvasType,
    setHasRenewalPackage,
    addDocument,
    addDocuments,
    removeDocument,
    getDocuments,
    getTotalDocumentCount,
    startGeneration,
    updateGenerationProgress,
    completeGeneration,
    reset,
  };
}
