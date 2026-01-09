import type { ContextState } from "@/app/canvas-flow/_components/mock-data";
import type {
  AudienceConfig,
  PriorityConfig,
  PromptTemplateVariables,
} from "./prompt-config-types";

/**
 * Replace template variables in a prompt string
 */
function replaceTemplateVariables(
  template: string,
  variables: Partial<PromptTemplateVariables>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined && value !== null && value !== "") {
      const placeholder = `{{${key}}}`;
      result = result.replaceAll(placeholder, String(value));
    }
  }

  // Replace any remaining unreplaced placeholders with a fallback
  result = result.replace(/\{\{[^}]+\}\}/g, "[not provided]");

  return result;
}

/**
 * Get presentation depth label based on slider value
 */
function getPresentationDepthLabel(depth: number): string {
  if (depth < 33) {
    return "comprehensive and detailed";
  }
  if (depth < 66) {
    return "balanced depth";
  }
  return "focused and concise";
}

/**
 * Format budget comparison for display
 */
function formatBudgetComparison(comparison: string | null): string {
  if (!comparison) return "not specified";

  const labels: Record<string, string> = {
    "significantly-exceeds": "Significantly exceeds budget",
    "slightly-exceeds": "Slightly exceeds budget",
    "on-target": "On target with budget",
    "slightly-under": "Slightly under budget",
    "significantly-under": "Significantly under budget",
  };

  return labels[comparison] || comparison;
}

/**
 * Build the complete planning prompt from selected options and context
 */
export function buildPlanningPromptFromContext(
  audienceConfig: AudienceConfig | undefined,
  priorityConfigs: PriorityConfig[],
  context: ContextState,
  documentAnalysis: string
): string {
  // Prepare template variables
  const variables: PromptTemplateVariables = {
    clientName: context.clientName || "the client",
    renewalPeriod: context.renewalPeriod || "upcoming renewal",
    expectedIncrease: context.expectedIncreasePercent?.toString() ?? "N/A",
    budgetComparison: formatBudgetComparison(context.budgetComparison),
    nationalAverage: context.nationalAveragePercent?.toString() ?? "N/A",
    regionalAverage: context.regionalAveragePercent?.toString() ?? "N/A",
    industryAverage: context.industryAveragePercent?.toString() ?? "N/A",
  };

  const sections: string[] = [];

  // 1. Base prompt header
  sections.push(`You are creating a presentation canvas for a benefits consultant meeting with their client.

## Document Analysis
${documentAnalysis}`);

  // 2. Audience section (if selected)
  if (audienceConfig) {
    const audiencePrompt = replaceTemplateVariables(
      audienceConfig.promptTemplate,
      variables
    );
    sections.push(`## Target Audience: ${audienceConfig.audience}
${audiencePrompt}`);
  }

  // 3. Priority sections (each selected priority gets its own section)
  if (priorityConfigs.length > 0) {
    sections.push("## Client Priorities");
    for (const priority of priorityConfigs) {
      const priorityPrompt = replaceTemplateVariables(
        priority.promptTemplate,
        variables
      );
      sections.push(`### Priority: ${priority.priority}
${priorityPrompt}`);
    }
  }

  // 4. Presentation depth
  const depthLabel = getPresentationDepthLabel(context.presentationDepth);
  sections.push(`## Presentation Style
Create a ${depthLabel} presentation (depth setting: ${context.presentationDepth}/100).`);

  // 5. Strategy ideas (if provided)
  if (context.strategyIdeas?.trim()) {
    sections.push(`## Consultant's Strategy Ideas
The consultant has shared these strategic ideas to consider:
${context.strategyIdeas}`);
  }

  // 6. Additional context (if provided)
  if (context.additionalContext?.trim()) {
    sections.push(`## Additional Context
${context.additionalContext}`);
  }

  // 7. Renewal benchmarks (if provided)
  const benchmarks: string[] = [];
  if (context.expectedIncreasePercent !== null) {
    benchmarks.push(`- Expected increase: ${context.expectedIncreasePercent}%`);
  }
  if (context.budgetComparison) {
    benchmarks.push(
      `- Budget comparison: ${formatBudgetComparison(context.budgetComparison)}`
    );
  }
  if (context.nationalAveragePercent !== null) {
    benchmarks.push(
      `- National average increase: ${context.nationalAveragePercent}%`
    );
  }
  if (context.regionalAveragePercent !== null) {
    benchmarks.push(
      `- Regional average increase: ${context.regionalAveragePercent}%`
    );
  }
  if (context.industryAveragePercent !== null) {
    benchmarks.push(
      `- Industry average increase: ${context.industryAveragePercent}%`
    );
  }
  if (benchmarks.length > 0) {
    sections.push(`## Renewal Benchmarks
${benchmarks.join("\n")}`);
  }

  // 8. Final instructions
  sections.push(`## Your Task
Create a canvas structure that:
1. Addresses the most important topics found in the documents
2. Is tailored to the target audience's needs and communication style
3. Emphasizes the client's stated priorities
4. Presents data in a compelling, actionable way
5. Tells a coherent story across sections
6. Includes visualizations where data supports them`);

  return sections.join("\n\n");
}
