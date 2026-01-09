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

// Import plan types
import type { CanvasPlan, ChatMessage, PlanSection } from "./mock-data";

// Helper function to extract topic from user message
function extractTopicFromMessage(message: string): string {
  const lowerMsg = message.toLowerCase();
  // Remove common words
  const cleanedMsg = lowerMsg
    .replace(/add|section|slide|about|can you|please|a|the|for|on/gi, "")
    .trim();
  // Capitalize first letter of each word
  return cleanedMsg
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper function to find section by keywords in message
function findSectionByKeywords(
  sections: PlanSection[],
  message: string
): PlanSection | undefined {
  const lowerMsg = message.toLowerCase();
  return sections.find((section) => {
    const lowerTitle = section.title.toLowerCase();
    // Check if any significant word from the title is in the message
    const words = lowerTitle.split(" ").filter((word) => word.length > 3);
    return words.some((word) => lowerMsg.includes(word));
  });
}

// Prototype state interface
export interface PrototypeState {
  screen: ScreenType;
  wizardStep: WizardStepId;
  canvasType: CanvasType | null;
  documents: UploadedDocument[];
  context: ContextState;
  processingProgress: number;
  processingPhaseIndex: number;
  // Plan step state
  plan: CanvasPlan | null;
  chatMessages: ChatMessage[];
  isPlanGenerating: boolean;
  isAiResponding: boolean;
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
  // Plan step state
  plan: null,
  chatMessages: [],
  isPlanGenerating: false,
  isAiResponding: false,
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

  // Plan management
  generatePlan: () => void;
  addChatMessage: (content: string) => void;
  updatePlanSection: (sectionId: string, updates: Partial<PlanSection>) => void;
  removePlanSection: (sectionId: string) => void;
  addPlanSection: (title: string, purpose: string) => void;
  regeneratePlan: () => void;

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

  // Wizard navigation - 3 steps now
  const goToNextStep = useCallback(() => {
    setState((prev) => {
      if (prev.wizardStep === "upload-documents") {
        return { ...prev, wizardStep: "set-context" };
      }
      if (prev.wizardStep === "set-context") {
        return { ...prev, wizardStep: "review-plan" };
      }
      // If on review-plan, caller should use startProcessing instead
      return prev;
    });
  }, []);

  const goToPreviousStep = useCallback(() => {
    setState((prev) => {
      if (prev.wizardStep === "set-context") {
        return { ...prev, wizardStep: "upload-documents" };
      }
      if (prev.wizardStep === "review-plan") {
        return { ...prev, wizardStep: "set-context" };
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

  // Plan management
  const generatePlan = useCallback(() => {
    setState((prev) => ({ ...prev, isPlanGenerating: true }));

    // Simulate AI generation time (1.5-2.5 seconds)
    setTimeout(
      () => {
        setState((prev) => {
          // Import and use MOCK_INITIAL_PLAN
          const { MOCK_INITIAL_PLAN } = require("./mock-data");
          const welcomeMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: `I've analyzed your documents and created a plan for "${MOCK_INITIAL_PLAN.canvasTitle}". This canvas will have ${MOCK_INITIAL_PLAN.sections.length} sections focused on helping ${prev.context.audience ? prev.context.audience.replace("-", " ") : "your audience"} understand the renewal situation.\n\nFeel free to ask me to add, remove, or modify any sections. For example, you can say "add a section about benchmarking" or "remove the claims trends section".`,
            timestamp: new Date(),
          };

          return {
            ...prev,
            isPlanGenerating: false,
            plan: MOCK_INITIAL_PLAN,
            chatMessages: [welcomeMessage],
          };
        });
      },
      1500 + Math.random() * 1000
    );
  }, []);

  const addChatMessage = useCallback((content: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, userMessage],
      isAiResponding: true,
    }));

    // Simulate AI response with plan updates
    setTimeout(
      () => {
        setState((prev) => {
          const lowerContent = content.toLowerCase();
          let updatedPlan = prev.plan;
          let responseText = "";

          // Pattern match for plan modifications
          if (
            lowerContent.includes("add") &&
            (lowerContent.includes("section") || lowerContent.includes("slide"))
          ) {
            // Extract topic from message
            const topic = extractTopicFromMessage(content);
            const newSection: PlanSection = {
              id: `section-${Date.now()}`,
              title: topic || "New Section",
              purpose: `Cover ${topic || "the requested topic"} based on available data`,
              confidence: 75,
              suggestedVisualizations: [],
              narrativePoints: [
                `Key data points about ${topic || "this topic"}`,
                "Analysis of relevant trends",
                "Impact on overall strategy",
              ],
              callouts: [
                {
                  type: "insight",
                  content: `This section will provide insights on ${topic || "the requested topic"}`,
                },
              ],
            };

            if (updatedPlan) {
              updatedPlan = {
                ...updatedPlan,
                sections: [...updatedPlan.sections, newSection],
              };
            }
            responseText = `Done! I've added a new section "${newSection.title}" to your plan. You can see it in the list on the left. Let me know if you'd like to modify the title or purpose.`;
          } else if (
            lowerContent.includes("remove") ||
            lowerContent.includes("delete")
          ) {
            // Try to find section to remove
            if (updatedPlan) {
              const sectionToRemove = findSectionByKeywords(
                updatedPlan.sections,
                content
              );
              if (sectionToRemove) {
                updatedPlan = {
                  ...updatedPlan,
                  sections: updatedPlan.sections.filter(
                    (s) => s.id !== sectionToRemove.id
                  ),
                };
                responseText = `Done! I've removed the "${sectionToRemove.title}" section from your plan. The remaining sections will flow together well.`;
              } else {
                responseText =
                  "I couldn't find a matching section to remove. Could you be more specific about which section you'd like to remove?";
              }
            }
          } else if (lowerContent.includes("benchmark")) {
            const newSection: PlanSection = {
              id: `section-${Date.now()}`,
              title: "Benchmarking Analysis",
              purpose:
                "Compare costs and plan designs to industry and regional averages",
              confidence: 82,
              suggestedVisualizations: ["comparison table", "bar chart"],
              narrativePoints: [
                "Comparison to national averages: 7.2% industry trend",
                "Regional benchmark: 6.8% for similar-sized employers",
                "Plan design competitiveness vs. market",
                "Cost per employee vs. industry median",
              ],
              callouts: [
                {
                  type: "insight",
                  content: "Current costs 4% above regional average",
                },
                {
                  type: "recommendation",
                  content: "Plan designs are competitive with market",
                },
              ],
            };

            if (updatedPlan) {
              updatedPlan = {
                ...updatedPlan,
                sections: [...updatedPlan.sections, newSection],
              };
            }
            responseText = `Great idea! I've added a Benchmarking Analysis section that will compare your client's costs and plan designs to industry averages. This will help provide market context for your recommendations.`;
          } else if (lowerContent.includes("employee impact")) {
            const newSection: PlanSection = {
              id: `section-${Date.now()}`,
              title: "Employee Impact Analysis",
              purpose:
                "Show how proposed changes affect different employee groups and cost sharing",
              confidence: 78,
              suggestedVisualizations: ["comparison table"],
              narrativePoints: [
                "Employee-only tier: +$12/month avg. increase",
                "Family tier: +$45/month avg. increase",
                "HDHP option reduces premiums by $85/month",
                "HSA employer contribution offsets deductible",
              ],
              callouts: [
                {
                  type: "warning",
                  content: "Family tier increases exceed 5% threshold",
                },
                {
                  type: "recommendation",
                  content: "Consider tiered contribution strategy",
                },
                {
                  type: "insight",
                  content: "62% of employees are single/no dependents",
                },
              ],
            };

            if (updatedPlan) {
              updatedPlan = {
                ...updatedPlan,
                sections: [...updatedPlan.sections, newSection],
              };
            }
            responseText = `I've added an Employee Impact Analysis section. This will help leadership understand how different employee groups would be affected by the proposed changes.`;
          } else {
            // Default response
            responseText =
              'I understand. I can help you refine the plan further. You can ask me to:\n\n• Add new sections (e.g., "add a section about benchmarking")\n• Remove sections (e.g., "remove the claims trends section")\n• Explain my recommendations\n\nWhat would you like to change?';
          }

          const aiMessage: ChatMessage = {
            id: `msg-${Date.now() + 1}`,
            role: "assistant",
            content: responseText,
            timestamp: new Date(),
          };

          return {
            ...prev,
            plan: updatedPlan,
            chatMessages: [...prev.chatMessages, aiMessage],
            isAiResponding: false,
          };
        });
      },
      800 + Math.random() * 700
    );
  }, []);

  const updatePlanSection = useCallback(
    (sectionId: string, updates: Partial<PlanSection>) => {
      setState((prev) => {
        if (!prev.plan) return prev;
        return {
          ...prev,
          plan: {
            ...prev.plan,
            sections: prev.plan.sections.map((s) =>
              s.id === sectionId ? { ...s, ...updates } : s
            ),
          },
        };
      });
    },
    []
  );

  const removePlanSection = useCallback((sectionId: string) => {
    setState((prev) => {
      if (!prev.plan) return prev;
      return {
        ...prev,
        plan: {
          ...prev.plan,
          sections: prev.plan.sections.filter((s) => s.id !== sectionId),
        },
      };
    });
  }, []);

  const addPlanSection = useCallback((title: string, purpose: string) => {
    setState((prev) => {
      if (!prev.plan) return prev;
      const newSection: PlanSection = {
        id: `section-${Date.now()}`,
        title,
        purpose,
        confidence: 70,
        suggestedVisualizations: [],
        narrativePoints: [],
        callouts: [],
      };
      return {
        ...prev,
        plan: {
          ...prev.plan,
          sections: [...prev.plan.sections, newSection],
        },
      };
    });
  }, []);

  const regeneratePlan = useCallback(() => {
    setState((prev) => ({
      ...prev,
      plan: null,
      chatMessages: [],
      isPlanGenerating: true,
    }));

    // Simulate regeneration
    setTimeout(
      () => {
        setState((prev) => {
          const { MOCK_INITIAL_PLAN } = require("./mock-data");
          const welcomeMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: `I've regenerated the plan based on your documents. The new plan has ${MOCK_INITIAL_PLAN.sections.length} sections. Let me know if you'd like to make any adjustments.`,
            timestamp: new Date(),
          };

          return {
            ...prev,
            isPlanGenerating: false,
            plan: MOCK_INITIAL_PLAN,
            chatMessages: [welcomeMessage],
          };
        });
      },
      1500 + Math.random() * 1000
    );
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
    generatePlan,
    addChatMessage,
    updatePlanSection,
    removePlanSection,
    addPlanSection,
    regeneratePlan,
    reset,
  };
}
