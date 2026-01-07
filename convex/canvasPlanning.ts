"use node";

import { generateObject } from "ai";
import { v } from "convex/values";
import type { PlannedSection } from "../lib/generation-schemas";
import { GenerativeCanvasPlanSchema } from "../lib/generation-schemas";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { gpt51Mini } from "./rag";

/**
 * Type for document analysis from database
 */
interface StoredDocumentAnalysis {
  canvasId: string;
  documents: Array<{
    documentId: string;
    filename: string;
    primaryDomain: string;
    topics: string[];
    dataPoints: Array<{
      name: string;
      type: string;
      value: unknown;
      context: string;
    }>;
    keyInsights: string[];
    relatedDocuments: string[];
  }>;
  overallThemes: Array<{
    theme: string;
    relevance: number;
    supportingDocuments: string[];
  }>;
  suggestedCanvasFocus: string;
  analyzedAt: number;
}

/**
 * Build prompt for canvas planning
 */
function buildPlanningPrompt(
  analysis: StoredDocumentAnalysis,
  consultantGuidance?: string
): string {
  return `You are creating a presentation canvas for a consultant meeting with their client.

## Document Analysis
${JSON.stringify(analysis, null, 2)}

## Consultant Guidance
${consultantGuidance || "No specific guidance provided - create the most valuable canvas possible"}

## Your Task
Create a canvas structure that:
1. Addresses the most important topics found in the documents
2. Presents data in a compelling, actionable way
3. Tells a coherent story across sections
4. Includes visualizations WHERE THEY ADD VALUE (not everywhere)
5. Prioritizes insights that help the client make decisions

## Guidelines
- Generate 3-10 sections based on content richness
- Section titles should be specific and descriptive (not generic like "Overview")
- Each section should have a clear purpose
- Don't force visualizations - only suggest them when data supports it
- Include an executive summary if there's enough content
- Be creative - if the data supports a unique insight, create a section for it

## Section IDs
Generate unique IDs for each section using format "section-{number}" (e.g., "section-1", "section-2")

## Remember
This could be about ANY topic: health benefits, 401(k), executive comp, HR consulting, compliance, etc.
Create sections that make sense for THIS specific content.`;
}

/**
 * Plan a generative canvas based on document analysis
 * This is the second step in the generative canvas workflow
 */
export const planCanvas = action({
  args: {
    canvasId: v.id("canvases"),
    consultantGuidance: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    sectionsPlanned: number;
    canvasTitle: string;
  }> => {
    // 1. Update status to "planning"
    await ctx.runMutation(internal.canvasGenerationStatus.update, {
      canvasId: args.canvasId,
      phase: "planning",
      progress: 0,
      currentStep: "Loading document analysis...",
      startedAt: Date.now(),
    });

    try {
      // 2. Get document analysis
      const analysis = (await ctx.runQuery(
        internal.documentAnalysisHelpers.getInternal,
        { canvasId: args.canvasId }
      )) as StoredDocumentAnalysis | null;

      if (!analysis) {
        throw new Error(
          "No document analysis found. Please analyze documents first."
        );
      }

      // 3. Update progress
      await ctx.runMutation(internal.canvasGenerationStatus.update, {
        canvasId: args.canvasId,
        progress: 20,
        currentStep: "Generating canvas plan with AI...",
      });

      // 4. Generate canvas plan using AI SDK
      const { object: plan } = await generateObject({
        model: gpt51Mini,
        schema: GenerativeCanvasPlanSchema,
        prompt: buildPlanningPrompt(analysis, args.consultantGuidance),
      });

      // 5. Update progress
      await ctx.runMutation(internal.canvasGenerationStatus.update, {
        canvasId: args.canvasId,
        progress: 80,
        currentStep: "Storing canvas plan...",
      });

      // 6. Transform sections to include status
      const sectionsWithStatus = plan.sections.map(
        (section: PlannedSection) => ({
          ...section,
          status: "pending" as const,
        })
      );

      // 7. Store the plan
      await ctx.runMutation(internal.canvasPlanHelpers.store, {
        canvasId: args.canvasId,
        canvasTitle: plan.canvasTitle,
        canvasPurpose: plan.canvasPurpose,
        sections: sectionsWithStatus,
        additionalSectionIdeas: plan.additionalSectionIdeas,
        consultantGuidance: args.consultantGuidance,
      });

      // 8. Mark planning as complete
      await ctx.runMutation(internal.canvasGenerationStatus.update, {
        canvasId: args.canvasId,
        phase: "planning",
        progress: 100,
        currentStep: "Canvas plan ready for review",
      });

      return {
        success: true,
        sectionsPlanned: plan.sections.length,
        canvasTitle: plan.canvasTitle,
      };
    } catch (error) {
      // Handle failure
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      await ctx.runMutation(internal.canvasGenerationStatus.setFailed, {
        canvasId: args.canvasId,
        error: errorMessage,
      });

      throw error;
    }
  },
});

/**
 * Regenerate the canvas plan with new guidance
 * Note: This duplicates some logic from planCanvas because actions cannot call other actions
 */
export const regeneratePlan = action({
  args: {
    canvasId: v.id("canvases"),
    consultantGuidance: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    sectionsPlanned: number;
    canvasTitle: string;
  }> => {
    // Delete existing plan first
    await ctx.runMutation(internal.canvasPlanHelpers.remove, {
      canvasId: args.canvasId,
    });

    // 1. Update status to "planning"
    await ctx.runMutation(internal.canvasGenerationStatus.update, {
      canvasId: args.canvasId,
      phase: "planning",
      progress: 0,
      currentStep: "Loading document analysis...",
      startedAt: Date.now(),
    });

    try {
      // 2. Get document analysis
      const analysis = (await ctx.runQuery(
        internal.documentAnalysisHelpers.getInternal,
        { canvasId: args.canvasId }
      )) as StoredDocumentAnalysis | null;

      if (!analysis) {
        throw new Error(
          "No document analysis found. Please analyze documents first."
        );
      }

      // 3. Update progress
      await ctx.runMutation(internal.canvasGenerationStatus.update, {
        canvasId: args.canvasId,
        progress: 20,
        currentStep: "Regenerating canvas plan with AI...",
      });

      // 4. Generate canvas plan using AI SDK
      const { object: plan } = await generateObject({
        model: gpt51Mini,
        schema: GenerativeCanvasPlanSchema,
        prompt: buildPlanningPrompt(analysis, args.consultantGuidance),
      });

      // 5. Update progress
      await ctx.runMutation(internal.canvasGenerationStatus.update, {
        canvasId: args.canvasId,
        progress: 80,
        currentStep: "Storing canvas plan...",
      });

      // 6. Transform sections to include status
      const sectionsWithStatus = plan.sections.map(
        (section: PlannedSection) => ({
          ...section,
          status: "pending" as const,
        })
      );

      // 7. Store the plan
      await ctx.runMutation(internal.canvasPlanHelpers.store, {
        canvasId: args.canvasId,
        canvasTitle: plan.canvasTitle,
        canvasPurpose: plan.canvasPurpose,
        sections: sectionsWithStatus,
        additionalSectionIdeas: plan.additionalSectionIdeas,
        consultantGuidance: args.consultantGuidance,
      });

      // 8. Mark planning as complete
      await ctx.runMutation(internal.canvasGenerationStatus.update, {
        canvasId: args.canvasId,
        phase: "planning",
        progress: 100,
        currentStep: "Canvas plan ready for review",
      });

      return {
        success: true,
        sectionsPlanned: plan.sections.length,
        canvasTitle: plan.canvasTitle,
      };
    } catch (error) {
      // Handle failure
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      await ctx.runMutation(internal.canvasGenerationStatus.setFailed, {
        canvasId: args.canvasId,
        error: errorMessage,
      });

      throw error;
    }
  },
});

/**
 * Generate a single section on-demand based on natural language description
 */
export const planSectionOnDemand = action({
  args: {
    canvasId: v.id("canvases"),
    description: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    section?: PlannedSection;
    reason?: string;
  }> => {
    try {
      // 1. Get existing plan to understand context
      const existingPlan = await ctx.runQuery(
        internal.canvasPlanHelpers.getInternal,
        { canvasId: args.canvasId }
      );

      // 2. Get document analysis
      const analysis = (await ctx.runQuery(
        internal.documentAnalysisHelpers.getInternal,
        { canvasId: args.canvasId }
      )) as StoredDocumentAnalysis | null;

      if (!analysis) {
        return {
          success: false,
          reason: "No document analysis found. Please analyze documents first.",
        };
      }

      // 3. Generate section plan
      const { object: result } = await generateObject({
        model: gpt51Mini,
        schema: GenerativeCanvasPlanSchema.pick({ sections: true }),
        prompt: buildOnDemandSectionPrompt(
          args.description,
          analysis,
          existingPlan,
          args.context
        ),
      });

      if (result.sections.length === 0) {
        return {
          success: false,
          reason:
            "Could not generate a section based on the available documents. Try a different description or upload relevant documents.",
        };
      }

      const newSection = {
        ...result.sections[0],
        status: "pending" as const,
      };

      // 4. Add section to existing plan if it exists
      if (existingPlan) {
        await ctx.runMutation(internal.canvasPlanHelpers.addSectionInternal, {
          canvasId: args.canvasId,
          section: newSection,
        });
      }

      return {
        success: true,
        section: result.sections[0],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        reason: errorMessage,
      };
    }
  },
});

/**
 * Build prompt for on-demand section generation
 */
function buildOnDemandSectionPrompt(
  description: string,
  analysis: StoredDocumentAnalysis,
  existingPlan: { sections: Array<{ id: string; title: string }> } | null,
  context?: string
): string {
  const existingTitles = existingPlan?.sections.map((s) => s.title) || [];
  const nextId = `section-${(existingPlan?.sections.length || 0) + 1}`;

  return `A consultant wants to add a new section to their canvas.

## Request
"${description}"

## Additional Context
${context || "No additional context provided"}

## Available Document Analysis
${JSON.stringify(analysis, null, 2)}

## Existing Sections
${existingTitles.length > 0 ? existingTitles.map((t) => `- ${t}`).join("\n") : "No sections yet"}

## Your Task
Generate exactly ONE section that addresses the consultant's request.

Requirements:
- Use ID: "${nextId}"
- Base the section on the available document content
- Make it distinct from existing sections
- Include visualizations only if the data supports them
- Set confidence based on how well the available data supports the request

If you cannot generate a useful section based on the available documents, return an empty sections array.`;
}
