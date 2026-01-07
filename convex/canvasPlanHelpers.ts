import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import {
  canvasPlanStatusValidator,
  planSectionStatusValidator,
} from "./schema";

/**
 * Section plan structure for storage
 */
const sectionPlanValidator = v.object({
  id: v.string(),
  title: v.string(),
  purpose: v.string(),
  keyQuestions: v.array(v.string()),
  dataSourceIds: v.array(v.string()),
  suggestedContent: v.object({
    narrativePoints: v.array(v.string()),
    visualizations: v.array(
      v.object({
        type: v.string(),
        title: v.string(),
        dataDescription: v.string(),
        rationale: v.string(),
      })
    ),
    callouts: v.array(
      v.object({
        type: v.string(),
        content: v.string(),
      })
    ),
  }),
  confidence: v.number(),
  generationPriority: v.number(),
  status: planSectionStatusValidator,
});

const additionalIdeaValidator = v.object({
  title: v.string(),
  description: v.string(),
  wouldRequire: v.string(),
});

/**
 * Get canvas plan (for real-time UI subscription)
 */
export const get = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) =>
    await ctx.db
      .query("canvasPlans")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first(),
});

/**
 * Internal query to get plan (for use in actions)
 */
export const getInternal = internalQuery({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) =>
    await ctx.db
      .query("canvasPlans")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first(),
});

/**
 * Store a new canvas plan
 */
export const store = internalMutation({
  args: {
    canvasId: v.id("canvases"),
    canvasTitle: v.string(),
    canvasPurpose: v.string(),
    sections: v.array(sectionPlanValidator),
    additionalSectionIdeas: v.array(additionalIdeaValidator),
    consultantGuidance: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if plan already exists
    const existing = await ctx.db
      .query("canvasPlans")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing plan
      await ctx.db.patch(existing._id, {
        canvasTitle: args.canvasTitle,
        canvasPurpose: args.canvasPurpose,
        sections: args.sections,
        additionalSectionIdeas: args.additionalSectionIdeas,
        consultantGuidance: args.consultantGuidance,
        status: "draft",
        updatedAt: now,
      });
      return existing._id;
    }

    // Create new plan
    return await ctx.db.insert("canvasPlans", {
      canvasId: args.canvasId,
      canvasTitle: args.canvasTitle,
      canvasPurpose: args.canvasPurpose,
      sections: args.sections,
      additionalSectionIdeas: args.additionalSectionIdeas,
      consultantGuidance: args.consultantGuidance,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update plan status
 */
export const updateStatus = internalMutation({
  args: {
    canvasId: v.id("canvases"),
    status: canvasPlanStatusValidator,
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("canvasPlans")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (!plan) {
      throw new Error("Plan not found");
    }

    await ctx.db.patch(plan._id, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update a specific section's status
 */
export const updateSectionStatus = internalMutation({
  args: {
    canvasId: v.id("canvases"),
    sectionId: v.string(),
    status: planSectionStatusValidator,
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("canvasPlans")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (!plan) {
      throw new Error("Plan not found");
    }

    const updatedSections = plan.sections.map((section) =>
      section.id === args.sectionId
        ? { ...section, status: args.status }
        : section
    );

    await ctx.db.patch(plan._id, {
      sections: updatedSections,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Approve the plan and mark it ready for generation
 */
export const approve = mutation({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("canvasPlans")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (!plan) {
      throw new Error("Plan not found");
    }

    await ctx.db.patch(plan._id, {
      status: "approved",
      updatedAt: Date.now(),
    });

    return plan._id;
  },
});

/**
 * Add a new section to the plan
 */
export const addSection = mutation({
  args: {
    canvasId: v.id("canvases"),
    section: sectionPlanValidator,
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("canvasPlans")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (!plan) {
      throw new Error("Plan not found");
    }

    const updatedSections = [...plan.sections, args.section];

    await ctx.db.patch(plan._id, {
      sections: updatedSections,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Internal: Add a new section to the plan (for use in actions)
 */
export const addSectionInternal = internalMutation({
  args: {
    canvasId: v.id("canvases"),
    section: sectionPlanValidator,
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("canvasPlans")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (!plan) {
      throw new Error("Plan not found");
    }

    const updatedSections = [...plan.sections, args.section];

    await ctx.db.patch(plan._id, {
      sections: updatedSections,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Remove a section from the plan
 */
export const removeSection = mutation({
  args: {
    canvasId: v.id("canvases"),
    sectionId: v.string(),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("canvasPlans")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (!plan) {
      throw new Error("Plan not found");
    }

    const updatedSections = plan.sections.filter(
      (section) => section.id !== args.sectionId
    );

    await ctx.db.patch(plan._id, {
      sections: updatedSections,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Reorder sections in the plan
 */
export const reorderSections = mutation({
  args: {
    canvasId: v.id("canvases"),
    sectionIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("canvasPlans")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (!plan) {
      throw new Error("Plan not found");
    }

    // Reorder sections based on provided IDs
    const sectionMap = new Map(plan.sections.map((s) => [s.id, s]));
    const reorderedSections = args.sectionIds
      .map((id) => sectionMap.get(id))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);

    // Update generation priorities based on new order
    const sectionsWithPriority = reorderedSections.map((section, index) => ({
      ...section,
      generationPriority: index + 1,
    }));

    await ctx.db.patch(plan._id, {
      sections: sectionsWithPriority,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update consultant guidance
 */
export const updateGuidance = mutation({
  args: {
    canvasId: v.id("canvases"),
    guidance: v.string(),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("canvasPlans")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (!plan) {
      throw new Error("Plan not found");
    }

    await ctx.db.patch(plan._id, {
      consultantGuidance: args.guidance,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Check if a plan exists for a canvas
 */
export const exists = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("canvasPlans")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();
    return plan !== null;
  },
});

/**
 * Delete plan for a canvas
 */
export const remove = internalMutation({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("canvasPlans")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (plan) {
      await ctx.db.delete(plan._id);
    }
  },
});
