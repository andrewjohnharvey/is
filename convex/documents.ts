import { v } from "convex/values";
import { api } from "./_generated/api";
import { internalQuery, mutation, query } from "./_generated/server";

/**
 * Generate a pre-signed URL for uploading a file to Convex storage.
 * This URL is short-lived and should be used immediately.
 */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

/**
 * Create a document record after successful file upload.
 * Automatically schedules document processing for RAG indexing.
 */
export const create = mutation({
  args: {
    clientId: v.id("clients"),
    canvasId: v.id("canvases"),
    filename: v.string(),
    fileType: v.string(),
    size: v.number(),
    storageId: v.id("_storage"),
  },
  returns: v.id("documents"),
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      clientId: args.clientId,
      canvasId: args.canvasId,
      filename: args.filename,
      fileType: args.fileType,
      size: args.size,
      storageId: args.storageId,
      uploadedAt: Date.now(),
    });

    // Schedule document processing for RAG indexing
    await ctx.scheduler.runAfter(0, api.documentProcessing.processDocument, {
      documentId,
      canvasId: args.canvasId,
      clientId: args.clientId,
    });

    return documentId;
  },
});

/**
 * Delete a document and its associated storage file.
 */
export const remove = mutation({
  args: {
    id: v.id("documents"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id);

    if (!document) {
      throw new Error("Document not found");
    }

    // Delete the file from storage
    await ctx.storage.delete(document.storageId);

    // Delete the document record
    await ctx.db.delete(args.id);

    return null;
  },
});

/**
 * List all documents for a specific canvas.
 */
export const listByCanvas = query({
  args: {
    canvasId: v.id("canvases"),
  },
  returns: v.array(
    v.object({
      _id: v.id("documents"),
      _creationTime: v.number(),
      clientId: v.id("clients"),
      canvasId: v.id("canvases"),
      filename: v.string(),
      fileType: v.string(),
      size: v.number(),
      storageId: v.id("_storage"),
      uploadedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    return documents;
  },
});

/**
 * Get the count of documents for a canvas.
 */
export const countByCanvas = query({
  args: {
    canvasId: v.id("canvases"),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    return documents.length;
  },
});

/**
 * Internal query to list documents by canvas (for use in actions)
 */
export const listByCanvasInternal = internalQuery({
  args: {
    canvasId: v.id("canvases"),
  },
  handler: async (ctx, args) =>
    await ctx.db
      .query("documents")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect(),
});
