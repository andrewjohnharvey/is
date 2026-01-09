"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { notFound } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { buildPlanningPromptFromContext } from "@/lib/prompt-builder";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type {
  CalloutType,
  CanvasPlan,
  ContextState,
  PriorityType,
} from "../../_components/mock-data";
import { MOCK_CLIENT } from "../../_components/mock-data";
import {
  AUDIENCE_CONFIGS,
  PRIORITY_CONFIGS,
} from "../../_generated/prompt-configs";

// Type for stored plan from database
interface StoredPlanSection {
  id: string;
  title: string;
  purpose: string;
  keyQuestions: string[];
  dataSourceIds: string[];
  suggestedContent: {
    narrativePoints: string[];
    visualizations: Array<{
      type: string;
      title: string;
      dataDescription: string;
      rationale: string;
    }>;
    callouts: Array<{
      type: string;
      content: string;
    }>;
  };
  confidence: number;
  generationPriority: number;
  status: string;
}

interface StoredPlan {
  _id: Id<"canvasPlans">;
  canvasId: Id<"canvases">;
  canvasTitle: string;
  canvasPurpose: string;
  sections: StoredPlanSection[];
  additionalSectionIdeas: Array<{
    title: string;
    description: string;
    wouldRequire: string;
  }>;
  status: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Transform stored plan from database to UI format
 */
function transformStoredPlanToUI(storedPlan: StoredPlan): CanvasPlan {
  return {
    canvasTitle: storedPlan.canvasTitle,
    canvasPurpose: storedPlan.canvasPurpose,
    sections: storedPlan.sections.map((section) => ({
      id: section.id,
      title: section.title,
      purpose: section.purpose,
      confidence: section.confidence,
      suggestedVisualizations: section.suggestedContent.visualizations.map(
        (v) => v.title
      ),
      narrativePoints: section.suggestedContent.narrativePoints,
      callouts: section.suggestedContent.callouts.map((c) => ({
        type: c.type as CalloutType,
        content: c.content,
      })),
    })),
    additionalIdeas: storedPlan.additionalSectionIdeas.map((idea) => ({
      title: idea.title,
      description: idea.description,
    })),
  };
}

// Canvas data type from Convex
type Canvas = {
  _id: Id<"canvases">;
  _creationTime: number;
  clientId: Id<"clients">;
  name: string;
  canvasType?:
    | "general"
    | "pre_renewal"
    | "renewal"
    | "post_renewal"
    | "workforce_investment"
    | "benchmarking"
    | "strategic_roadmap";
  status: "draft" | "in_review" | "published";
  createdAt: number;
  updatedAt: number;
};

// Form state that persists across wizard steps
interface CanvasFormState {
  context: ContextState;
  plan: CanvasPlan | null;
  isPlanGenerating: boolean;
}

interface CanvasFlowContextValue {
  // Canvas data from Convex
  canvas: Canvas;
  canvasId: Id<"canvases">;
  clientId: Id<"clients">;
  isLoading: boolean;

  // Form state
  formState: CanvasFormState;

  // Context management
  updateContext: (partial: Partial<ContextState>) => void;
  togglePriority: (priority: PriorityType) => void;

  // Plan management
  generatePlan: () => void;
  regeneratePlan: () => void;
}

const CanvasFlowContext = createContext<CanvasFlowContextValue | null>(null);

const createInitialFormState = (): CanvasFormState => ({
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
  plan: null,
  isPlanGenerating: false,
});

interface CanvasFlowProviderProps {
  children: ReactNode;
  canvasId: string;
}

export function CanvasFlowProvider({
  children,
  canvasId,
}: CanvasFlowProviderProps) {
  const [formState, setFormState] = useState<CanvasFormState>(
    createInitialFormState
  );
  const hasLoadedPlanRef = useRef(false);

  // Query canvas from Convex
  const canvas = useQuery(api.canvases.get, {
    id: canvasId as Id<"canvases">,
  });

  // Query stored plan from Convex (real-time subscription)
  const storedPlan = useQuery(api.canvasPlanHelpers.get, {
    canvasId: canvasId as Id<"canvases">,
  }) as StoredPlan | null | undefined;

  // Action to generate plan
  const planCanvasAction = useAction(api.canvasPlanning.planCanvas);

  // Mutation to clear chat messages when regenerating
  const clearChatMessages = useMutation(api.planChatMessages.clearByCanvas);

  // Sync stored plan to form state when it changes
  // This enables real-time updates when sections are added/removed via chat
  useEffect(() => {
    if (storedPlan) {
      const transformedPlan = transformStoredPlanToUI(storedPlan);
      setFormState((prev) => ({
        ...prev,
        plan: transformedPlan,
        isPlanGenerating: false,
      }));
      hasLoadedPlanRef.current = true;
    }
  }, [storedPlan]);

  // Loading state
  if (canvas === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading canvas...</div>
      </div>
    );
  }

  // Canvas not found
  if (canvas === null) {
    notFound();
  }

  // Context management
  const updateContext = useCallback((partial: Partial<ContextState>) => {
    setFormState((prev) => ({
      ...prev,
      context: { ...prev.context, ...partial },
    }));
  }, []);

  const togglePriority = useCallback((priority: PriorityType) => {
    setFormState((prev) => {
      const currentPriorities = prev.context.priorities;
      const isSelected = currentPriorities.includes(priority);

      let newPriorities: PriorityType[];
      if (isSelected) {
        newPriorities = currentPriorities.filter((p) => p !== priority);
      } else if (currentPriorities.length < 3) {
        newPriorities = [...currentPriorities, priority];
      } else {
        return prev;
      }

      return {
        ...prev,
        context: { ...prev.context, priorities: newPriorities },
      };
    });
  }, []);

  // Plan management
  const generatePlan = useCallback(async () => {
    // If plan already exists, don't regenerate
    if (formState.plan || storedPlan) {
      return;
    }

    setFormState((prev) => ({ ...prev, isPlanGenerating: true }));

    try {
      // Get selected configs from generated prompt data
      const selectedAudience = AUDIENCE_CONFIGS.find(
        (a) => a.id === formState.context.audience
      );
      const selectedPriorities = PRIORITY_CONFIGS.filter((p) =>
        formState.context.priorities.includes(p.id as PriorityType)
      );

      // Build prompt from markdown templates
      const composedPrompt = buildPlanningPromptFromContext(
        selectedAudience,
        selectedPriorities,
        formState.context,
        "" // Document analysis is added server-side
      );

      // Call Convex action to generate plan
      await planCanvasAction({
        canvasId: canvas._id,
        composedPrompt,
      });

      // Plan will be synced via useEffect when storedPlan updates
    } catch (error) {
      console.error("Failed to generate plan:", error);
      setFormState((prev) => ({ ...prev, isPlanGenerating: false }));
    }
  }, [
    formState.plan,
    formState.context,
    storedPlan,
    canvas._id,
    planCanvasAction,
  ]);

  const regeneratePlan = useCallback(async () => {
    setFormState((prev) => ({
      ...prev,
      plan: null,
      isPlanGenerating: true,
    }));
    hasLoadedPlanRef.current = false;

    try {
      // Clear existing chat messages
      await clearChatMessages({ canvasId: canvas._id });

      // Get selected configs from generated prompt data
      const selectedAudience = AUDIENCE_CONFIGS.find(
        (a) => a.id === formState.context.audience
      );
      const selectedPriorities = PRIORITY_CONFIGS.filter((p) =>
        formState.context.priorities.includes(p.id as PriorityType)
      );

      // Build prompt from markdown templates
      const composedPrompt = buildPlanningPromptFromContext(
        selectedAudience,
        selectedPriorities,
        formState.context,
        "" // Document analysis is added server-side
      );

      // Call Convex action to regenerate plan
      await planCanvasAction({
        canvasId: canvas._id,
        composedPrompt,
      });

      // Plan will be synced via useEffect when storedPlan updates
    } catch (error) {
      console.error("Failed to regenerate plan:", error);
      setFormState((prev) => ({ ...prev, isPlanGenerating: false }));
    }
  }, [formState.context, canvas._id, planCanvasAction, clearChatMessages]);

  const value: CanvasFlowContextValue = {
    canvas,
    canvasId: canvas._id,
    clientId: canvas.clientId,
    isLoading: false,
    formState,
    updateContext,
    togglePriority,
    generatePlan,
    regeneratePlan,
  };

  return (
    <CanvasFlowContext.Provider value={value}>
      {children}
    </CanvasFlowContext.Provider>
  );
}

export function useCanvasFlow(): CanvasFlowContextValue {
  const context = useContext(CanvasFlowContext);
  if (!context) {
    throw new Error("useCanvasFlow must be used within a CanvasFlowProvider");
  }
  return context;
}
