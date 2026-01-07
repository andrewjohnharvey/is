import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

// ============================================================================
// Status Queries (run in V8 runtime, not Node.js)
// ============================================================================

/**
 * Get processing status for a document.
 */
export const getProcessingStatus = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) =>
    await ctx.db
      .query("documentProcessingStatus")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .first(),
});

/**
 * Get all processing statuses for a canvas.
 */
export const getProcessingStatusesByCanvas = query({
  args: {
    canvasId: v.id("canvases"),
  },
  handler: async (ctx, args) => {
    // Get all documents for this canvas
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    // Get processing status for each document
    const statuses = await Promise.all(
      documents.map(async (doc) => {
        const status = await ctx.db
          .query("documentProcessingStatus")
          .withIndex("by_document", (q) => q.eq("documentId", doc._id))
          .first();

        return {
          documentId: doc._id,
          filename: doc.filename,
          status: status?.status ?? "pending",
          chunksProcessed: status?.chunksProcessed ?? 0,
          totalChunks: status?.totalChunks ?? 0,
          error: status?.error,
        };
      })
    );

    return statuses;
  },
});

// ============================================================================
// Internal Queries
// ============================================================================

/**
 * Get document by ID (internal query).
 */
export const getDocument = internalQuery({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => await ctx.db.get(args.documentId),
});

// ============================================================================
// Internal Mutations
// ============================================================================

/**
 * Initialize processing status for a document.
 */
export const initProcessingStatus = internalMutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    // Check if status already exists
    const existing = await ctx.db
      .query("documentProcessingStatus")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .first();

    if (existing) {
      // Reset existing status
      await ctx.db.patch(existing._id, {
        status: "pending",
        chunksProcessed: 0,
        totalChunks: 0,
        error: undefined,
        startedAt: undefined,
        completedAt: undefined,
      });
    } else {
      // Create new status
      await ctx.db.insert("documentProcessingStatus", {
        documentId: args.documentId,
        status: "pending",
        chunksProcessed: 0,
        totalChunks: 0,
      });
    }
  },
});

/**
 * Update processing status.
 */
export const updateProcessingStatus = internalMutation({
  args: {
    documentId: v.id("documents"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    chunksProcessed: v.optional(v.number()),
    totalChunks: v.optional(v.number()),
    error: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("documentProcessingStatus")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .first();

    if (existing) {
      const updates: Record<string, unknown> = { status: args.status };
      if (args.chunksProcessed !== undefined)
        updates.chunksProcessed = args.chunksProcessed;
      if (args.totalChunks !== undefined)
        updates.totalChunks = args.totalChunks;
      if (args.error !== undefined) updates.error = args.error;
      if (args.startedAt !== undefined) updates.startedAt = args.startedAt;
      if (args.completedAt !== undefined)
        updates.completedAt = args.completedAt;

      await ctx.db.patch(existing._id, updates);
    }
  },
});

/**
 * Reset processing status for retry.
 */
export const resetProcessingStatus = internalMutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("documentProcessingStatus")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "pending",
        chunksProcessed: 0,
        totalChunks: 0,
        error: undefined,
        startedAt: undefined,
        completedAt: undefined,
      });
    }
  },
});

/**
 * Store a processed chunk.
 */
export const storeChunk = internalMutation({
  args: {
    documentId: v.id("documents"),
    canvasId: v.id("canvases"),
    clientId: v.id("clients"),
    chunkIndex: v.number(),
    contentType: v.union(v.literal("text"), v.literal("image")),
    content: v.string(),
    slideNumber: v.optional(v.number()),
    pageNumber: v.optional(v.number()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("documentChunks", {
      ...args,
      processedAt: Date.now(),
    });
  },
});

/**
 * Store multiple chunks at once for faster processing.
 */
export const storeChunksBatch = internalMutation({
  args: {
    documentId: v.id("documents"),
    canvasId: v.id("canvases"),
    clientId: v.id("clients"),
    chunks: v.array(
      v.object({
        chunkIndex: v.number(),
        contentType: v.union(v.literal("text"), v.literal("image")),
        content: v.string(),
        slideNumber: v.optional(v.number()),
        pageNumber: v.optional(v.number()),
        imageStorageId: v.optional(v.id("_storage")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const chunk of args.chunks) {
      await ctx.db.insert("documentChunks", {
        documentId: args.documentId,
        canvasId: args.canvasId,
        clientId: args.clientId,
        chunkIndex: chunk.chunkIndex,
        contentType: chunk.contentType,
        content: chunk.content,
        slideNumber: chunk.slideNumber,
        pageNumber: chunk.pageNumber,
        imageStorageId: chunk.imageStorageId,
        processedAt: now,
      });
    }
  },
});

/**
 * Delete all chunks for a document (for retry).
 */
export const deleteChunksForDocument = internalMutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("documentChunks")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();

    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }
  },
});
