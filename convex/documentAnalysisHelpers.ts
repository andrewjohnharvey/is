import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { dataPointTypeValidator } from "./schema";

/**
 * Document analysis result structure for storage
 */
const documentAnalysisValidator = v.object({
  documentId: v.string(),
  filename: v.string(),
  primaryDomain: v.string(),
  topics: v.array(v.string()),
  dataPoints: v.array(
    v.object({
      name: v.string(),
      type: dataPointTypeValidator,
      value: v.any(),
      context: v.string(),
    })
  ),
  keyInsights: v.array(v.string()),
  relatedDocuments: v.array(v.string()),
});

const themeValidator = v.object({
  theme: v.string(),
  relevance: v.number(),
  supportingDocuments: v.array(v.string()),
});

/**
 * Get document analysis for a canvas (for real-time UI subscription)
 */
export const get = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) =>
    await ctx.db
      .query("documentAnalysis")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first(),
});

/**
 * Internal query to get analysis (for use in actions)
 */
export const getInternal = internalQuery({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) =>
    await ctx.db
      .query("documentAnalysis")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first(),
});

/**
 * Store document analysis results
 */
export const store = internalMutation({
  args: {
    canvasId: v.id("canvases"),
    documents: v.array(documentAnalysisValidator),
    overallThemes: v.array(themeValidator),
    suggestedCanvasFocus: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if analysis already exists for this canvas
    const existing = await ctx.db
      .query("documentAnalysis")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (existing) {
      // Update existing analysis
      await ctx.db.patch(existing._id, {
        documents: args.documents,
        overallThemes: args.overallThemes,
        suggestedCanvasFocus: args.suggestedCanvasFocus,
        analyzedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new analysis
    return await ctx.db.insert("documentAnalysis", {
      canvasId: args.canvasId,
      documents: args.documents,
      overallThemes: args.overallThemes,
      suggestedCanvasFocus: args.suggestedCanvasFocus,
      analyzedAt: Date.now(),
    });
  },
});

/**
 * Merge new document analysis with existing (for incremental analysis)
 */
export const merge = internalMutation({
  args: {
    canvasId: v.id("canvases"),
    newDocuments: v.array(documentAnalysisValidator),
    newThemes: v.array(themeValidator),
    updatedFocus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("documentAnalysis")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (!existing) {
      // No existing analysis, just store the new one
      return await ctx.db.insert("documentAnalysis", {
        canvasId: args.canvasId,
        documents: args.newDocuments,
        overallThemes: args.newThemes,
        suggestedCanvasFocus: args.updatedFocus ?? "Analysis pending",
        analyzedAt: Date.now(),
      });
    }

    // Merge documents (add new ones, don't duplicate)
    const existingDocIds = new Set(existing.documents.map((d) => d.documentId));
    const mergedDocuments = [
      ...existing.documents,
      ...args.newDocuments.filter((d) => !existingDocIds.has(d.documentId)),
    ];

    // Merge themes (combine and dedupe by theme name)
    const themeMap = new Map<string, (typeof existing.overallThemes)[0]>();
    for (const theme of existing.overallThemes) {
      themeMap.set(theme.theme, theme);
    }
    for (const theme of args.newThemes) {
      const existingTheme = themeMap.get(theme.theme);
      if (existingTheme) {
        // Merge supporting documents and update relevance
        themeMap.set(theme.theme, {
          theme: theme.theme,
          relevance: Math.max(existingTheme.relevance, theme.relevance),
          supportingDocuments: [
            ...new Set([
              ...existingTheme.supportingDocuments,
              ...theme.supportingDocuments,
            ]),
          ],
        });
      } else {
        themeMap.set(theme.theme, theme);
      }
    }
    const mergedThemes = Array.from(themeMap.values());

    await ctx.db.patch(existing._id, {
      documents: mergedDocuments,
      overallThemes: mergedThemes,
      suggestedCanvasFocus: args.updatedFocus ?? existing.suggestedCanvasFocus,
      analyzedAt: Date.now(),
    });

    return existing._id;
  },
});

/**
 * Delete analysis for a canvas
 */
export const remove = internalMutation({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("documentAnalysis")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

/**
 * Check if analysis exists for a canvas
 */
export const exists = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const analysis = await ctx.db
      .query("documentAnalysis")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .first();
    return analysis !== null;
  },
});
