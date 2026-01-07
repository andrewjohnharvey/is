"use node";

import { generateObject } from "ai";
import { v } from "convex/values";
import type { ContentBlock } from "../lib/generation-schemas";
import { GeneratedSectionSchema } from "../lib/generation-schemas";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { gpt51Mini } from "./rag";

/**
 * Type for stored document analysis
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
 * Type for stored plan section
 */
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

/**
 * Type for stored canvas plan
 */
interface StoredCanvasPlan {
  _id: string;
  canvasId: string;
  canvasTitle: string;
  canvasPurpose: string;
  sections: StoredPlanSection[];
  status: string;
}

/**
 * Build prompt for section generation
 */
function buildSectionPrompt(
  section: StoredPlanSection,
  analysis: StoredDocumentAnalysis,
  canvasPurpose: string
): string {
  // Filter relevant document data
  const relevantDocs = analysis.documents.filter(
    (doc) =>
      section.dataSourceIds.includes(doc.documentId) ||
      section.dataSourceIds.length === 0 // If no sources specified, use all
  );

  return `You are generating content for a presentation canvas section.

## Canvas Purpose
${canvasPurpose}

## Section Details
Title: ${section.title}
Purpose: ${section.purpose}
Key Questions to Answer:
${section.keyQuestions.map((q) => `- ${q}`).join("\n")}

## Available Document Data
${JSON.stringify(relevantDocs, null, 2)}

## Content Guidelines from Planning
Narrative Points to Cover:
${section.suggestedContent.narrativePoints.map((p) => `- ${p}`).join("\n")}

Suggested Visualizations:
${section.suggestedContent.visualizations.map((viz) => `- ${viz.type}: ${viz.title} (${viz.dataDescription})`).join("\n") || "None suggested"}

Suggested Callouts:
${section.suggestedContent.callouts.map((c) => `- [${c.type}] ${c.content}`).join("\n") || "None suggested"}

## Your Task
Generate comprehensive section content with:

1. **Narrative Blocks**: Write clear, professional narrative text that addresses the key questions. Use "informative" tone for facts, "persuasive" for recommendations, "cautionary" for warnings, "celebratory" for positive outcomes.

2. **Key Metric Blocks**: If the data contains important metrics, create key_metric blocks with:
   - label: Short descriptive label
   - value: Formatted value (e.g., "$1.2M", "85%", "1,250")
   - change: Optional change indicator with direction (up/down/flat), amount, and context

3. **Visualization Blocks**: Only include if the suggested visualizations make sense with the actual data. For charts:
   - chartType: "bar", "line", "pie", or "table"
   - title: Chart title
   - data: Array of objects with appropriate keys for the chart type
   - insight: Brief insight about what the data shows

4. **Comparison Blocks**: For comparing options, plans, or items
   - items: Array of {label, values} where values is a key-value record

5. **Recommendation Blocks**: For actionable recommendations
   - title, description, impact (high/medium/low), effort (high/medium/low)

6. **Risk Blocks**: For identified risks
   - title, description, severity (critical/high/medium/low), mitigation (optional)

7. **Callout Blocks**: For important highlights
   - style: "info", "warning", "success", or "question"
   - content: The callout text

8. **Timeline Blocks**: For chronological information
   - events: Array of {date, title, description}

## Important Rules
- Only include content blocks that have supporting data
- Don't invent numbers or statistics - use only what's in the documents
- Make visualizations meaningful - don't force them if data doesn't support
- Keep narrative concise but informative
- Cite specific documents as sources
- Set confidence based on how well the data supports the content (0-100)

## Source Citations
For each piece of information, track which document it came from. Include:
- documentId
- documentName
- excerpt (optional): relevant quote from the document
- pageOrLocation (optional): page number or slide number if known`;
}

/**
 * Generate all sections for a canvas based on the approved plan
 * This is called after the plan is approved
 */
export const generateAllSections = action({
  args: {
    canvasId: v.id("canvases"),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    sectionsGenerated: number;
    errors: string[];
  }> => {
    const errors: string[] = [];
    let sectionsGenerated = 0;

    // 1. Update status to "generating"
    await ctx.runMutation(internal.canvasGenerationStatus.update, {
      canvasId: args.canvasId,
      phase: "generating",
      progress: 0,
      currentStep: "Loading canvas plan...",
      startedAt: Date.now(),
    });

    try {
      // 2. Get the approved plan
      const plan = (await ctx.runQuery(internal.canvasPlanHelpers.getInternal, {
        canvasId: args.canvasId,
      })) as StoredCanvasPlan | null;

      if (!plan) {
        throw new Error("No canvas plan found");
      }

      // 3. Get document analysis
      const analysis = (await ctx.runQuery(
        internal.documentAnalysisHelpers.getInternal,
        { canvasId: args.canvasId }
      )) as StoredDocumentAnalysis | null;

      if (!analysis) {
        throw new Error("No document analysis found");
      }

      // 4. Update plan status to generating
      await ctx.runMutation(internal.canvasPlanHelpers.updateStatus, {
        canvasId: args.canvasId,
        status: "generating",
      });

      // Sort sections by generation priority
      const sortedSections = [...plan.sections].sort(
        (a, b) => a.generationPriority - b.generationPriority
      );

      const totalSections = sortedSections.length;

      // 5. Generate each section
      for (let i = 0; i < sortedSections.length; i++) {
        const section = sortedSections[i];

        // Update status
        await ctx.runMutation(internal.canvasGenerationStatus.update, {
          canvasId: args.canvasId,
          progress: Math.round((i / totalSections) * 100),
          currentStep: `Generating section ${i + 1}/${totalSections}: ${section.title}`,
          sectionsTotal: totalSections,
          sectionsCompleted: i,
          currentSectionTitle: section.title,
        });

        // Update section status to generating
        await ctx.runMutation(internal.canvasPlanHelpers.updateSectionStatus, {
          canvasId: args.canvasId,
          sectionId: section.id,
          status: "generating",
        });

        try {
          // Generate section content
          const { object: generatedSection } = await generateObject({
            model: gpt51Mini,
            schema: GeneratedSectionSchema,
            prompt: buildSectionPrompt(section, analysis, plan.canvasPurpose),
          });

          // Transform content blocks for storage
          const contentForStorage = generatedSection.content.map(
            (block: ContentBlock) => ({
              type: block.type,
              data: block,
            })
          );

          // Store the generated section
          await ctx.runMutation(internal.canvasSectionHelpers.store, {
            canvasId: args.canvasId,
            planSectionId: section.id,
            title: generatedSection.title,
            purpose: generatedSection.purpose,
            content: contentForStorage,
            sources: generatedSection.sources,
            confidence: generatedSection.confidence,
            order: i,
          });

          // Update section status to generated
          await ctx.runMutation(
            internal.canvasPlanHelpers.updateSectionStatus,
            {
              canvasId: args.canvasId,
              sectionId: section.id,
              status: "generated",
            }
          );

          sectionsGenerated++;
        } catch (sectionError) {
          const errorMessage =
            sectionError instanceof Error
              ? sectionError.message
              : "Unknown error";
          errors.push(`Section "${section.title}": ${errorMessage}`);

          // Update section status to failed
          await ctx.runMutation(
            internal.canvasPlanHelpers.updateSectionStatus,
            {
              canvasId: args.canvasId,
              sectionId: section.id,
              status: "failed",
            }
          );
        }
      }

      // 6. Mark generation as complete
      const finalStatus = errors.length === 0 ? "completed" : "completed";

      await ctx.runMutation(internal.canvasPlanHelpers.updateStatus, {
        canvasId: args.canvasId,
        status: "completed",
      });

      await ctx.runMutation(internal.canvasGenerationStatus.update, {
        canvasId: args.canvasId,
        phase: finalStatus,
        progress: 100,
        currentStep:
          errors.length === 0
            ? "Canvas generation complete!"
            : `Canvas generated with ${errors.length} errors`,
        sectionsCompleted: sectionsGenerated,
        completedAt: Date.now(),
      });

      return {
        success: errors.length === 0,
        sectionsGenerated,
        errors,
      };
    } catch (error) {
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
 * Regenerate a single section
 */
export const regenerateSection = action({
  args: {
    canvasId: v.id("canvases"),
    planSectionId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      // 1. Get the plan
      const plan = (await ctx.runQuery(internal.canvasPlanHelpers.getInternal, {
        canvasId: args.canvasId,
      })) as StoredCanvasPlan | null;

      if (!plan) {
        return { success: false, error: "No canvas plan found" };
      }

      const section = plan.sections.find((s) => s.id === args.planSectionId);
      if (!section) {
        return { success: false, error: "Section not found in plan" };
      }

      // 2. Get document analysis
      const analysis = (await ctx.runQuery(
        internal.documentAnalysisHelpers.getInternal,
        { canvasId: args.canvasId }
      )) as StoredDocumentAnalysis | null;

      if (!analysis) {
        return { success: false, error: "No document analysis found" };
      }

      // 3. Update section status to generating
      await ctx.runMutation(internal.canvasPlanHelpers.updateSectionStatus, {
        canvasId: args.canvasId,
        sectionId: section.id,
        status: "generating",
      });

      // 4. Get current section order (for preserving position)
      const existingSection = await ctx.runQuery(
        internal.canvasSectionHelpers.getByPlanSectionId,
        {
          canvasId: args.canvasId,
          planSectionId: args.planSectionId,
        }
      );

      const order = existingSection?.order ?? 0;

      // 5. Generate section content
      const { object: generatedSection } = await generateObject({
        model: gpt51Mini,
        schema: GeneratedSectionSchema,
        prompt: buildSectionPrompt(section, analysis, plan.canvasPurpose),
      });

      // Transform content blocks for storage
      const contentForStorage = generatedSection.content.map(
        (block: ContentBlock) => ({
          type: block.type,
          data: block,
        })
      );

      // 6. Store the regenerated section
      await ctx.runMutation(internal.canvasSectionHelpers.store, {
        canvasId: args.canvasId,
        planSectionId: section.id,
        title: generatedSection.title,
        purpose: generatedSection.purpose,
        content: contentForStorage,
        sources: generatedSection.sources,
        confidence: generatedSection.confidence,
        order,
      });

      // 7. Update section status to generated
      await ctx.runMutation(internal.canvasPlanHelpers.updateSectionStatus, {
        canvasId: args.canvasId,
        sectionId: section.id,
        status: "generated",
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Update section status to failed
      await ctx.runMutation(internal.canvasPlanHelpers.updateSectionStatus, {
        canvasId: args.canvasId,
        sectionId: args.planSectionId,
        status: "failed",
      });

      return { success: false, error: errorMessage };
    }
  },
});
