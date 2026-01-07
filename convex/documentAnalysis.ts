"use node";

import { generateObject } from "ai";
import { v } from "convex/values";
import { DocumentUnderstandingSchema } from "../lib/generation-schemas";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { gpt51Mini } from "./rag";

/**
 * Type for document chunk from database
 */
interface DocumentChunk {
  documentId: string;
  filename: string;
  chunkIndex: number;
  contentType: "text" | "image";
  content: string;
  slideNumber?: number;
  pageNumber?: number;
}

/**
 * Type for document from database
 */
type DocumentRecord = Doc<"documents">;

/**
 * Type for existing analysis
 */
interface ExistingAnalysis {
  documents: Array<{
    documentId: string;
    filename: string;
    primaryDomain: string;
    topics: string[];
  }>;
  overallThemes: Array<{ theme: string; relevance: number }>;
  suggestedCanvasFocus: string;
}

/**
 * Build the analysis prompt for document understanding
 */
function buildAnalysisPrompt(
  documents: Array<{ _id: Id<"documents">; filename: string }>,
  chunks: DocumentChunk[]
): string {
  // Group chunks by document
  const contentByDoc = new Map<string, string[]>();

  for (const chunk of chunks) {
    const docId = chunk.documentId;
    const existing = contentByDoc.get(docId) || [];
    existing.push(chunk.content);
    contentByDoc.set(docId, existing);
  }

  // Format content per document
  const formattedContent = documents
    .map((doc) => {
      const docChunks = contentByDoc.get(doc._id.toString()) || [];
      return `### ${doc.filename}\n${docChunks.join("\n\n")}`;
    })
    .join("\n\n---\n\n");

  return `You are an expert consultant. Analyze these documents and understand what they contain.

## Documents Uploaded
${documents.map((d) => `- ${d.filename} (ID: ${d._id})`).join("\n")}

## Document Content
${formattedContent}

## Your Task
1. Identify what domain each document belongs to (health benefits, retirement, HR consulting, compliance, etc.)
2. Extract specific topics and data points from each document
3. Find relationships between documents
4. Identify overarching themes across all documents
5. Suggest what the consultant's canvas should focus on

## CRITICAL: Do NOT assume content type
This could be about ANYTHING:
- Health & Welfare Benefits (medical, dental, vision, life, disability)
- Retirement Plans (401(k), pension, deferred compensation)
- HR Consulting (compensation studies, org design, compliance audits)
- Executive Benefits (SERP, split-dollar, golden parachutes)
- Voluntary Benefits (pet insurance, legal plans, identity theft)
- Compliance (ACA reporting, ERISA audits, 5500 filings)
- M&A Due Diligence (benefits integration, liability assessment)
- Or something entirely different

Analyze what's ACTUALLY in the documents.

## Response Format
Return a structured analysis with:
- Per-document analysis (domain, topics, data points, insights)
- Overall themes across all documents
- Suggested focus for the canvas`;
}

/**
 * Build prompt for incremental analysis
 */
function buildIncrementalAnalysisPrompt(
  existingAnalysis: ExistingAnalysis | null,
  newDocuments: Array<{ _id: Id<"documents">; filename: string }>,
  chunks: DocumentChunk[]
): string {
  // Group chunks by document
  const contentByDoc = new Map<string, string[]>();

  for (const chunk of chunks) {
    const docId = chunk.documentId;
    const existing = contentByDoc.get(docId) || [];
    existing.push(chunk.content);
    contentByDoc.set(docId, existing);
  }

  // Format content per document
  const allContent = newDocuments
    .map((doc) => {
      const docChunks = contentByDoc.get(doc._id.toString()) || [];
      return `### ${doc.filename}\n${docChunks.join("\n\n")}`;
    })
    .join("\n\n---\n\n");

  const existingContext = existingAnalysis
    ? `
## Existing Analysis Context
Previously analyzed documents:
${existingAnalysis.documents.map((d) => `- ${d.filename}: ${d.primaryDomain}`).join("\n")}

Current themes:
${existingAnalysis.overallThemes.map((t) => `- ${t.theme} (${t.relevance}% relevance)`).join("\n")}

Current focus: ${existingAnalysis.suggestedCanvasFocus}
`
    : "";

  return `You are an expert consultant. Analyze these NEW documents that have been added to an existing analysis.

${existingContext}

## New Documents to Analyze
${newDocuments.map((d) => `- ${d.filename} (ID: ${d._id})`).join("\n")}

## New Document Content
${allContent}

## Your Task
1. Analyze ONLY the new documents
2. Identify how they relate to the existing analysis
3. Find any new themes they introduce
4. Update the suggested canvas focus if the new documents significantly change the scope

Focus on what's NEW and how it changes or enhances the existing understanding.`;
}

/**
 * Analyze all documents for a canvas to understand their content
 * This is the first step in the generative canvas workflow
 */
export const analyzeDocuments = action({
  args: {
    canvasId: v.id("canvases"),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    documentsAnalyzed: number;
    themesFound: number;
    suggestedFocus: string;
  }> => {
    // 1. Initialize/update status to "analyzing"
    await ctx.runMutation(internal.canvasGenerationStatus.update, {
      canvasId: args.canvasId,
      phase: "analyzing",
      progress: 0,
      currentStep: "Initializing document analysis...",
      startedAt: Date.now(),
    });

    try {
      // 2. Get all documents for this canvas
      const documents: DocumentRecord[] = await ctx.runQuery(
        internal.documents.listByCanvasInternal,
        {
          canvasId: args.canvasId,
        }
      );

      if (documents.length === 0) {
        throw new Error("No documents found for this canvas");
      }

      // 3. Update progress
      await ctx.runMutation(internal.canvasGenerationStatus.update, {
        canvasId: args.canvasId,
        progress: 10,
        currentStep: `Found ${documents.length} documents. Retrieving content...`,
      });

      // 4. Get all document chunks from database
      const chunks: DocumentChunk[] = await ctx.runQuery(
        internal.searchHelpers.getAllChunksForCanvas,
        { canvasId: args.canvasId }
      );

      if (chunks.length === 0) {
        throw new Error(
          "No document content found. Please wait for document processing to complete."
        );
      }

      // 5. Update progress
      await ctx.runMutation(internal.canvasGenerationStatus.update, {
        canvasId: args.canvasId,
        progress: 30,
        currentStep: `Analyzing ${chunks.length} content chunks with AI...`,
      });

      // 6. Generate structured understanding using AI SDK
      const { object: analysis } = await generateObject({
        model: gpt51Mini,
        schema: DocumentUnderstandingSchema,
        prompt: buildAnalysisPrompt(
          documents.map((d) => ({ _id: d._id, filename: d.filename })),
          chunks
        ),
      });

      // 7. Update progress
      await ctx.runMutation(internal.canvasGenerationStatus.update, {
        canvasId: args.canvasId,
        progress: 80,
        currentStep: "Storing analysis results...",
      });

      // 8. Store analysis results
      await ctx.runMutation(internal.documentAnalysisHelpers.store, {
        canvasId: args.canvasId,
        documents: analysis.documents,
        overallThemes: analysis.overallThemes,
        suggestedCanvasFocus: analysis.suggestedCanvasFocus,
      });

      // 9. Mark analysis as complete
      await ctx.runMutation(internal.canvasGenerationStatus.update, {
        canvasId: args.canvasId,
        phase: "analyzing",
        progress: 100,
        currentStep: "Analysis complete",
      });

      return {
        success: true,
        documentsAnalyzed: documents.length,
        themesFound: analysis.overallThemes.length,
        suggestedFocus: analysis.suggestedCanvasFocus,
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
 * Analyze only new documents and merge with existing analysis (incremental)
 * Used when documents are uploaded mid-flow
 */
export const analyzeNewDocuments = action({
  args: {
    canvasId: v.id("canvases"),
    newDocumentIds: v.array(v.id("documents")),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    newDocumentsAnalyzed: number;
    newThemesFound: number;
  }> => {
    // 1. Update status
    await ctx.runMutation(internal.canvasGenerationStatus.update, {
      canvasId: args.canvasId,
      phase: "analyzing",
      progress: 0,
      currentStep: "Analyzing new documents...",
      startedAt: Date.now(),
    });

    try {
      // 2. Get existing analysis
      const existingAnalysis = (await ctx.runQuery(
        internal.documentAnalysisHelpers.getInternal,
        { canvasId: args.canvasId }
      )) as ExistingAnalysis | null;

      // 3. Get new document metadata
      const allDocuments: DocumentRecord[] = await ctx.runQuery(
        internal.documents.listByCanvasInternal,
        {
          canvasId: args.canvasId,
        }
      );

      const newDocuments = allDocuments.filter((d: DocumentRecord) =>
        args.newDocumentIds.some((id) => id === d._id)
      );

      if (newDocuments.length === 0) {
        throw new Error("No new documents found");
      }

      // 4. Get all document chunks from database
      const allChunks: DocumentChunk[] = await ctx.runQuery(
        internal.searchHelpers.getAllChunksForCanvas,
        { canvasId: args.canvasId }
      );

      // Filter to chunks belonging to new documents
      const newDocumentIdStrings = args.newDocumentIds.map((id) =>
        id.toString()
      );
      const newChunks = allChunks.filter((chunk) =>
        newDocumentIdStrings.includes(chunk.documentId)
      );

      // 5. Update progress
      await ctx.runMutation(internal.canvasGenerationStatus.update, {
        canvasId: args.canvasId,
        progress: 40,
        currentStep: `Analyzing ${newChunks.length} new content chunks...`,
      });

      // 6. Generate analysis for new documents
      const { object: newAnalysis } = await generateObject({
        model: gpt51Mini,
        schema: DocumentUnderstandingSchema,
        prompt: buildIncrementalAnalysisPrompt(
          existingAnalysis,
          newDocuments.map((d: DocumentRecord) => ({
            _id: d._id,
            filename: d.filename,
          })),
          newChunks
        ),
      });

      // 7. Merge with existing analysis
      await ctx.runMutation(internal.documentAnalysisHelpers.merge, {
        canvasId: args.canvasId,
        newDocuments: newAnalysis.documents,
        newThemes: newAnalysis.overallThemes,
        updatedFocus: newAnalysis.suggestedCanvasFocus,
      });

      // 8. Mark complete
      await ctx.runMutation(internal.canvasGenerationStatus.update, {
        canvasId: args.canvasId,
        phase: "analyzing",
        progress: 100,
        currentStep: "Incremental analysis complete",
      });

      return {
        success: true,
        newDocumentsAnalyzed: newDocuments.length,
        newThemesFound: newAnalysis.overallThemes.length,
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
