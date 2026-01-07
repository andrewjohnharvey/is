import type { CanvasType } from "./canvas-types";

export type WizardStepId =
  | "welcome"
  | "client"
  | "renewal-period"
  | "canvas-type"
  | "current-plans"
  | "financial"
  | "renewal-package"
  | "census"
  | "optional-docs"
  | "review"
  | "processing"
  | "success";

export type WizardStepStatus = "pending" | "current" | "completed" | "skipped";

export interface WizardStep {
  id: WizardStepId;
  label: string;
  shortLabel?: string;
  status: WizardStepStatus;
  isOptional?: boolean;
  isHidden?: boolean; // For processing/success which are modals
}

export interface WizardDocument {
  id: string;
  name: string;
  size?: number;
  type?: string;
  isAutoDetected?: boolean;
  uploadedAt?: Date;
}

export type DocumentCategory =
  | "currentPlans"
  | "financial"
  | "renewal"
  | "census"
  | "benchmarking"
  | "compliance"
  | "other";

export interface WizardState {
  currentStepId: WizardStepId;
  completedSteps: WizardStepId[];
  skippedSteps: WizardStepId[];

  // Step data
  clientId: string | null;
  clientName: string | null;
  clientIndustry: string | null;
  clientLocation: string | null;
  clientEmployeeCount: number | null;

  renewalDate: Date | null;
  canvasType: CanvasType | null;
  hasRenewalPackage: boolean | null;

  // Documents by category
  documents: Record<DocumentCategory, WizardDocument[]>;

  // Processing state
  isGenerating: boolean;
  generationProgress: number;
  generationPhase: string | null;

  // Metadata
  createdAt: Date;
  lastSavedAt: Date;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: "welcome", label: "Get Started", status: "current" },
  { id: "client", label: "Select Client", status: "pending" },
  { id: "renewal-period", label: "Renewal Period", status: "pending" },
  { id: "canvas-type", label: "Canvas Type", status: "pending" },
  { id: "current-plans", label: "Current Plans", status: "pending" },
  { id: "financial", label: "Financial Data", status: "pending" },
  { id: "renewal-package", label: "Renewal Package", status: "pending" },
  { id: "census", label: "Census Data", status: "pending" },
  {
    id: "optional-docs",
    label: "Optional Docs",
    status: "pending",
    isOptional: true,
  },
  { id: "review", label: "Review", status: "pending" },
  { id: "processing", label: "Generate", status: "pending", isHidden: true },
  { id: "success", label: "Done", status: "pending", isHidden: true },
];

export const VISIBLE_STEPS = WIZARD_STEPS.filter((step) => !step.isHidden);

export function getStepIndex(stepId: WizardStepId): number {
  return VISIBLE_STEPS.findIndex((step) => step.id === stepId);
}

export function getStepById(stepId: WizardStepId): WizardStep | undefined {
  return WIZARD_STEPS.find((step) => step.id === stepId);
}

export function getNextStep(currentStepId: WizardStepId): WizardStepId | null {
  const allSteps = WIZARD_STEPS.map((s) => s.id);
  const currentIndex = allSteps.indexOf(currentStepId);
  if (currentIndex === -1 || currentIndex === allSteps.length - 1) {
    return null;
  }
  return allSteps[currentIndex + 1];
}

export function getPreviousStep(
  currentStepId: WizardStepId
): WizardStepId | null {
  const allSteps = WIZARD_STEPS.map((s) => s.id);
  const currentIndex = allSteps.indexOf(currentStepId);
  if (currentIndex <= 0) {
    return null;
  }
  return allSteps[currentIndex - 1];
}

export function calculateProgress(state: WizardState): number {
  const visibleSteps = VISIBLE_STEPS;
  const currentIndex = visibleSteps.findIndex(
    (s) => s.id === state.currentStepId
  );
  if (currentIndex === -1) return 0;
  return Math.round((currentIndex / (visibleSteps.length - 1)) * 100);
}

export function createInitialWizardState(): WizardState {
  return {
    currentStepId: "welcome",
    completedSteps: [],
    skippedSteps: [],
    clientId: null,
    clientName: null,
    clientIndustry: null,
    clientLocation: null,
    clientEmployeeCount: null,
    renewalDate: null,
    canvasType: null,
    hasRenewalPackage: null,
    documents: {
      currentPlans: [],
      financial: [],
      renewal: [],
      census: [],
      benchmarking: [],
      compliance: [],
      other: [],
    },
    isGenerating: false,
    generationProgress: 0,
    generationPhase: null,
    createdAt: new Date(),
    lastSavedAt: new Date(),
  };
}
