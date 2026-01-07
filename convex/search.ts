"use node";

import { generateText } from "ai";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { gpt51Mini, rag } from "./rag";

/**
 * Type for individual search result from RAG.
 */
interface RagSearchResult {
  entryId: string;
  order: number;
  content: Array<{ metadata?: Record<string, unknown>; text: string }>;
  startOrder: number;
  score: number;
}

/**
 * Type for enriched search result with document metadata.
 */
interface EnrichedSearchResult {
  text: string;
  score: number;
  documentId: string | undefined;
  filename: string | undefined;
  contentType: "text" | "image" | undefined;
  slideNumber: number | undefined;
  pageNumber: number | undefined;
}

/**
 * Type for source citation in Q&A responses.
 */
interface SourceCitation {
  text: string;
  score: number;
  documentId: string | undefined;
  filename: string | undefined;
  slideNumber: number | undefined;
  pageNumber: number | undefined;
}

/**
 * Type for Q&A response.
 */
interface QAResponse {
  answer: string;
  sources: SourceCitation[];
  hasContext: boolean;
}

/**
 * Extract text from a RAG search result.
 */
function getResultText(result: RagSearchResult): string {
  return result.content.map((c) => c.text).join("\n");
}

// Note: Query functions are defined in searchHelpers.ts
// (they run in V8 runtime, not Node.js runtime)
// Frontend should import from api.searchHelpers instead

// ============================================================================
// RAG Search Actions
// ============================================================================

/**
 * Search documents within a canvas namespace using RAG.
 * Returns relevant chunks with source document information.
 */
export const searchDocuments = action({
  args: {
    canvasId: v.id("canvases"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<EnrichedSearchResult[]> => {
    const limit = args.limit ?? 5;

    // Search using RAG with canvas namespace
    const searchResponse = await rag.search(ctx, {
      namespace: args.canvasId,
      query: args.query,
      limit,
    });

    const results = searchResponse.results as RagSearchResult[];

    // Enrich results with document metadata
    const enrichedResults: EnrichedSearchResult[] = await Promise.all(
      results.map(async (result): Promise<EnrichedSearchResult> => {
        const text = getResultText(result);

        // Get chunk metadata if available
        const chunkInfo = await ctx.runQuery(
          internal.searchHelpers.getChunkByContent,
          {
            canvasId: args.canvasId,
            contentPrefix: text.slice(0, 100),
          }
        );

        return {
          text,
          score: result.score,
          documentId: chunkInfo?.documentId,
          filename: chunkInfo?.filename,
          contentType: chunkInfo?.contentType,
          slideNumber: chunkInfo?.slideNumber,
          pageNumber: chunkInfo?.pageNumber,
        };
      })
    );

    return enrichedResults;
  },
});

/**
 * Ask a question and get an AI-generated answer based on canvas documents.
 * Uses RAG to find relevant context, then generates a response.
 */
export const askQuestion = action({
  args: {
    canvasId: v.id("canvases"),
    question: v.string(),
    contextLimit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<QAResponse> => {
    const contextLimit = args.contextLimit ?? 8;

    // 1. Search for relevant context
    const searchResponse = await rag.search(ctx, {
      namespace: args.canvasId,
      query: args.question,
      limit: contextLimit,
    });

    const results = searchResponse.results as RagSearchResult[];

    if (results.length === 0) {
      return {
        answer:
          "I couldn't find any relevant information in the uploaded documents to answer your question.",
        sources: [],
        hasContext: false,
      };
    }

    // 2. Build context from search results
    const context = results
      .map((result, index) => {
        const text = getResultText(result);
        return `[Source ${index + 1}]:\n${text}`;
      })
      .join("\n\n---\n\n");

    // 3. Generate answer using GPT-5.1 Mini
    const { text: answer } = await generateText({
      model: gpt51Mini,
      maxOutputTokens: 2000,
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that answers questions based on the provided document context. 
- Only answer based on the information in the provided context
- If the context doesn't contain enough information to fully answer, say so
- Cite source numbers when referencing specific information
- Be concise but thorough
- If you find conflicting information, note it`,
        },
        {
          role: "user",
          content: `Context from uploaded documents:

${context}

---

Question: ${args.question}

Please answer the question based on the context above.`,
        },
      ],
    });

    // 4. Get source metadata for results
    const sources: SourceCitation[] = await Promise.all(
      results.map(async (result): Promise<SourceCitation> => {
        const text = getResultText(result);

        const chunkInfo = await ctx.runQuery(
          internal.searchHelpers.getChunkByContent,
          {
            canvasId: args.canvasId,
            contentPrefix: text.slice(0, 100),
          }
        );

        return {
          text: text.slice(0, 200) + (text.length > 200 ? "..." : ""),
          score: result.score,
          documentId: chunkInfo?.documentId,
          filename: chunkInfo?.filename,
          slideNumber: chunkInfo?.slideNumber,
          pageNumber: chunkInfo?.pageNumber,
        };
      })
    );

    return {
      answer,
      sources,
      hasContext: true,
    };
  },
});
