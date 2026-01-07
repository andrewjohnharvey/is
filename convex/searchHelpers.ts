import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";

/**
 * Get all documents and their chunks for a canvas.
 * Useful for debugging and understanding what content is indexed.
 */
export const getIndexedContent = query({
  args: {
    canvasId: v.id("canvases"),
  },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("documentChunks")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    // Group chunks by document
    const documentMap = new Map<
      string,
      {
        documentId: string;
        filename: string;
        chunks: Array<{
          chunkIndex: number;
          contentType: "text" | "image";
          contentPreview: string;
          slideNumber?: number;
          pageNumber?: number;
        }>;
      }
    >();

    for (const chunk of chunks) {
      const docId = chunk.documentId.toString();

      if (!documentMap.has(docId)) {
        // Get document info
        const doc = await ctx.db.get(chunk.documentId);
        documentMap.set(docId, {
          documentId: docId,
          filename: doc?.filename ?? "Unknown",
          chunks: [],
        });
      }

      const docInfo = documentMap.get(docId);
      if (docInfo) {
        docInfo.chunks.push({
          chunkIndex: chunk.chunkIndex,
          contentType: chunk.contentType,
          contentPreview:
            chunk.content.slice(0, 150) +
            (chunk.content.length > 150 ? "..." : ""),
          slideNumber: chunk.slideNumber,
          pageNumber: chunk.pageNumber,
        });
      }
    }

    return {
      totalChunks: chunks.length,
      documents: Array.from(documentMap.values()),
    };
  },
});

/**
 * Get all document chunks with full content for a canvas.
 * Used for document analysis when we need all content without RAG search.
 */
export const getAllChunksForCanvas = internalQuery({
  args: {
    canvasId: v.id("canvases"),
  },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("documentChunks")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    // Get unique document IDs
    const documentIds = [...new Set(chunks.map((c) => c.documentId))];

    // Get document info for each
    const documentsInfo = await Promise.all(
      documentIds.map(async (docId) => {
        const doc = await ctx.db.get(docId);
        return {
          documentId: docId.toString(),
          filename: doc?.filename ?? "Unknown",
        };
      })
    );

    // Create a map for quick lookup
    const docMap = new Map(
      documentsInfo.map((d) => [d.documentId, d.filename])
    );

    // Return chunks with document info
    return chunks.map((chunk) => ({
      documentId: chunk.documentId.toString(),
      filename: docMap.get(chunk.documentId.toString()) ?? "Unknown",
      chunkIndex: chunk.chunkIndex,
      contentType: chunk.contentType,
      content: chunk.content,
      slideNumber: chunk.slideNumber,
      pageNumber: chunk.pageNumber,
    }));
  },
});

/**
 * Find a chunk by its content prefix to get source metadata.
 * Used to enrich RAG search results with document info.
 */
export const getChunkByContent = internalQuery({
  args: {
    canvasId: v.id("canvases"),
    contentPrefix: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    documentId: string;
    filename: string;
    contentType: "text" | "image";
    slideNumber?: number;
    pageNumber?: number;
  } | null> => {
    // Get all chunks for this canvas
    const chunks = await ctx.db
      .query("documentChunks")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    // Find chunk that starts with the prefix
    const matchingChunk = chunks.find((chunk) =>
      chunk.content.startsWith(args.contentPrefix)
    );

    if (!matchingChunk) {
      return null;
    }

    // Get document info
    const doc = await ctx.db.get(matchingChunk.documentId);

    return {
      documentId: matchingChunk.documentId.toString(),
      filename: doc?.filename ?? "Unknown",
      contentType: matchingChunk.contentType,
      slideNumber: matchingChunk.slideNumber,
      pageNumber: matchingChunk.pageNumber,
    };
  },
});
