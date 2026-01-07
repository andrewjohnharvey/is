import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { contentBlockTypeValidator } from "./schema";

/**
 * Content block validator for section content
 */
const contentBlockValidator = v.object({
  type: contentBlockTypeValidator,
  data: v.any(),
});

/**
 * Source citation validator
 */
const sourceCitationValidator = v.object({
  documentId: v.string(),
  documentName: v.string(),
  excerpt: v.optional(v.string()),
  pageOrLocation: v.optional(v.string()),
});

/**
 * Get all sections for a canvas (ordered)
 */
export const listByCanvas = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const sections = await ctx.db
      .query("canvasSections")
      .withIndex("by_canvas_order", (q) => q.eq("canvasId", args.canvasId))
      .collect();
    return sections;
  },
});

/**
 * Internal: Get all sections for a canvas
 */
export const listByCanvasInternal = internalQuery({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const sections = await ctx.db
      .query("canvasSections")
      .withIndex("by_canvas_order", (q) => q.eq("canvasId", args.canvasId))
      .collect();
    return sections;
  },
});

/**
 * Get a single section by ID
 */
export const get = query({
  args: { sectionId: v.id("canvasSections") },
  handler: async (ctx, args) => await ctx.db.get(args.sectionId),
});

/**
 * Internal: Get section by plan section ID
 */
export const getByPlanSectionId = internalQuery({
  args: {
    canvasId: v.id("canvases"),
    planSectionId: v.string(),
  },
  handler: async (ctx, args) => {
    const sections = await ctx.db
      .query("canvasSections")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();
    return sections.find((s) => s.planSectionId === args.planSectionId) ?? null;
  },
});

/**
 * Store a new generated section
 */
export const store = internalMutation({
  args: {
    canvasId: v.id("canvases"),
    planSectionId: v.string(),
    title: v.string(),
    purpose: v.string(),
    content: v.array(contentBlockValidator),
    sources: v.array(sourceCitationValidator),
    confidence: v.number(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if section already exists
    const existing = await ctx.db
      .query("canvasSections")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    const existingSection = existing.find(
      (s) => s.planSectionId === args.planSectionId
    );

    if (existingSection) {
      // Update existing section
      await ctx.db.patch(existingSection._id, {
        title: args.title,
        purpose: args.purpose,
        content: args.content,
        sources: args.sources,
        confidence: args.confidence,
        lastModified: Date.now(),
      });
      return existingSection._id;
    }

    // Create new section
    return await ctx.db.insert("canvasSections", {
      canvasId: args.canvasId,
      planSectionId: args.planSectionId,
      title: args.title,
      purpose: args.purpose,
      content: args.content,
      sources: args.sources,
      confidence: args.confidence,
      generatedAt: Date.now(),
      order: args.order,
    });
  },
});

/**
 * Update section content (for manual editing)
 */
export const updateContent = mutation({
  args: {
    sectionId: v.id("canvasSections"),
    content: v.array(contentBlockValidator),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sectionId, {
      content: args.content,
      lastModified: Date.now(),
    });
  },
});

/**
 * Update section title
 */
export const updateTitle = mutation({
  args: {
    sectionId: v.id("canvasSections"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sectionId, {
      title: args.title,
      lastModified: Date.now(),
    });
  },
});

/**
 * Reorder sections
 */
export const reorder = mutation({
  args: {
    canvasId: v.id("canvases"),
    sectionIds: v.array(v.id("canvasSections")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.sectionIds.length; i++) {
      await ctx.db.patch(args.sectionIds[i], {
        order: i,
        lastModified: Date.now(),
      });
    }
  },
});

/**
 * Delete a section
 */
export const remove = mutation({
  args: { sectionId: v.id("canvasSections") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sectionId);
  },
});

/**
 * Delete all sections for a canvas
 */
export const removeAllByCanvas = internalMutation({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const sections = await ctx.db
      .query("canvasSections")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    for (const section of sections) {
      await ctx.db.delete(section._id);
    }
  },
});

/**
 * Count sections for a canvas
 */
export const count = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const sections = await ctx.db
      .query("canvasSections")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();
    return sections.length;
  },
});

/**
 * Internal: Count sections for a canvas
 */
export const countInternal = internalQuery({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const sections = await ctx.db
      .query("canvasSections")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();
    return sections.length;
  },
});

/**
 * Add a single content block to a section
 */
export const addContentBlock = mutation({
  args: {
    sectionId: v.id("canvasSections"),
    block: contentBlockValidator,
    index: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const section = await ctx.db.get(args.sectionId);
    if (!section) {
      throw new Error("Section not found");
    }

    const content = [...section.content];
    const insertIndex = args.index ?? content.length;
    content.splice(insertIndex, 0, args.block);

    await ctx.db.patch(args.sectionId, {
      content,
      lastModified: Date.now(),
    });
  },
});

/**
 * Remove a content block from a section
 */
export const removeContentBlock = mutation({
  args: {
    sectionId: v.id("canvasSections"),
    blockIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const section = await ctx.db.get(args.sectionId);
    if (!section) {
      throw new Error("Section not found");
    }

    const content = [...section.content];
    content.splice(args.blockIndex, 1);

    await ctx.db.patch(args.sectionId, {
      content,
      lastModified: Date.now(),
    });
  },
});

/**
 * Update a single content block
 */
export const updateContentBlock = mutation({
  args: {
    sectionId: v.id("canvasSections"),
    blockIndex: v.number(),
    block: contentBlockValidator,
  },
  handler: async (ctx, args) => {
    const section = await ctx.db.get(args.sectionId);
    if (!section) {
      throw new Error("Section not found");
    }

    const content = [...section.content];
    content[args.blockIndex] = args.block;

    await ctx.db.patch(args.sectionId, {
      content,
      lastModified: Date.now(),
    });
  },
});
