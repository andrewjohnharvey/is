import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { canvasStatusValidator, canvasTypeValidator } from "./schema";

/**
 * Create a new draft canvas for a client.
 */
export const createDraft = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.string(),
    canvasType: canvasTypeValidator,
  },
  returns: v.id("canvases"),
  handler: async (ctx, args) => {
    const now = Date.now();

    const canvasId = await ctx.db.insert("canvases", {
      clientId: args.clientId,
      name: args.name,
      canvasType: args.canvasType,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    return canvasId;
  },
});

/**
 * Get a single canvas by ID.
 */
export const get = query({
  args: {
    id: v.id("canvases"),
  },
  returns: v.union(
    v.object({
      _id: v.id("canvases"),
      _creationTime: v.number(),
      clientId: v.id("clients"),
      name: v.string(),
      canvasType: v.optional(canvasTypeValidator),
      status: canvasStatusValidator,
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => await ctx.db.get(args.id),
});

/**
 * Update the name of a canvas.
 */
export const updateName = mutation({
  args: {
    id: v.id("canvases"),
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.id);

    if (!canvas) {
      throw new Error("Canvas not found");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Update the status of a canvas.
 */
export const updateStatus = mutation({
  args: {
    id: v.id("canvases"),
    status: canvasStatusValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.id);

    if (!canvas) {
      throw new Error("Canvas not found");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Delete a canvas and all its associated documents.
 */
export const remove = mutation({
  args: {
    id: v.id("canvases"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.id);

    if (!canvas) {
      throw new Error("Canvas not found");
    }

    // Delete all associated documents and their storage files
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.id))
      .collect();

    for (const doc of documents) {
      await ctx.storage.delete(doc.storageId);
      await ctx.db.delete(doc._id);
    }

    // Delete the canvas
    await ctx.db.delete(args.id);

    return null;
  },
});

/**
 * Update the canvas type.
 */
export const updateType = mutation({
  args: {
    id: v.id("canvases"),
    canvasType: canvasTypeValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const canvas = await ctx.db.get(args.id);

    if (!canvas) {
      throw new Error("Canvas not found");
    }

    await ctx.db.patch(args.id, {
      canvasType: args.canvasType,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * List all canvases for a client.
 */
export const listByClient = query({
  args: {
    clientId: v.id("clients"),
  },
  returns: v.array(
    v.object({
      _id: v.id("canvases"),
      _creationTime: v.number(),
      clientId: v.id("clients"),
      name: v.string(),
      canvasType: v.optional(canvasTypeValidator),
      status: canvasStatusValidator,
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const canvases = await ctx.db
      .query("canvases")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();

    return canvases;
  },
});
