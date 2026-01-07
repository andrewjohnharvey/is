import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { generationPhaseValidator } from "./schema";

/**
 * Get generation status for a canvas (for real-time UI subscription)
 */
export const get = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) =>
    await ctx.db
      .query("canvasGenerationStatus")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first(),
});

/**
 * Internal query to get status (for use in actions)
 */
export const getInternal = internalQuery({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) =>
    await ctx.db
      .query("canvasGenerationStatus")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first(),
});

/**
 * Initialize generation status for a canvas
 */
export const init = internalMutation({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    // Check if status already exists
    const existing = await ctx.db
      .query("canvasGenerationStatus")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (existing) {
      // Reset existing status
      await ctx.db.patch(existing._id, {
        phase: "idle",
        progress: 0,
        currentStep: undefined,
        sectionsTotal: undefined,
        sectionsCompleted: undefined,
        currentSectionTitle: undefined,
        error: undefined,
        startedAt: undefined,
        completedAt: undefined,
      });
      return existing._id;
    }

    // Create new status
    return await ctx.db.insert("canvasGenerationStatus", {
      canvasId: args.canvasId,
      phase: "idle",
    });
  },
});

/**
 * Update generation status (internal, called from actions)
 */
export const update = internalMutation({
  args: {
    canvasId: v.id("canvases"),
    phase: v.optional(generationPhaseValidator),
    progress: v.optional(v.number()),
    currentStep: v.optional(v.string()),
    sectionsTotal: v.optional(v.number()),
    sectionsCompleted: v.optional(v.number()),
    currentSectionTitle: v.optional(v.string()),
    error: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { canvasId, ...updates } = args;

    const existing = await ctx.db
      .query("canvasGenerationStatus")
      .withIndex("by_canvas", (q) => q.eq("canvasId", canvasId))
      .first();

    if (!existing) {
      // Create if doesn't exist
      return await ctx.db.insert("canvasGenerationStatus", {
        canvasId,
        phase: updates.phase ?? "idle",
        progress: updates.progress,
        currentStep: updates.currentStep,
        sectionsTotal: updates.sectionsTotal,
        sectionsCompleted: updates.sectionsCompleted,
        currentSectionTitle: updates.currentSectionTitle,
        error: updates.error,
        startedAt: updates.startedAt,
        completedAt: updates.completedAt,
      });
    }

    // Filter out undefined values to avoid overwriting with undefined
    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    await ctx.db.patch(existing._id, filteredUpdates);
    return existing._id;
  },
});

/**
 * Set status to failed with error message
 */
export const setFailed = internalMutation({
  args: {
    canvasId: v.id("canvases"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("canvasGenerationStatus")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (!existing) {
      return await ctx.db.insert("canvasGenerationStatus", {
        canvasId: args.canvasId,
        phase: "failed",
        error: args.error,
        completedAt: Date.now(),
      });
    }

    await ctx.db.patch(existing._id, {
      phase: "failed",
      error: args.error,
      completedAt: Date.now(),
    });
    return existing._id;
  },
});

/**
 * Set status to completed
 */
export const setCompleted = internalMutation({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("canvasGenerationStatus")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (!existing) {
      return await ctx.db.insert("canvasGenerationStatus", {
        canvasId: args.canvasId,
        phase: "completed",
        progress: 100,
        completedAt: Date.now(),
      });
    }

    await ctx.db.patch(existing._id, {
      phase: "completed",
      progress: 100,
      completedAt: Date.now(),
    });
    return existing._id;
  },
});

/**
 * Reset status to idle (for re-running generation)
 */
export const reset = mutation({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("canvasGenerationStatus")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (!existing) {
      return await ctx.db.insert("canvasGenerationStatus", {
        canvasId: args.canvasId,
        phase: "idle",
      });
    }

    await ctx.db.patch(existing._id, {
      phase: "idle",
      progress: undefined,
      currentStep: undefined,
      sectionsTotal: undefined,
      sectionsCompleted: undefined,
      currentSectionTitle: undefined,
      error: undefined,
      startedAt: undefined,
      completedAt: undefined,
    });
    return existing._id;
  },
});
