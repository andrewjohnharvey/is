import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

/**
 * Tool call structure for tracking AI tool usage
 */
const toolCallValidator = v.object({
  toolName: v.string(),
  args: v.any(),
  result: v.optional(v.any()),
});

/**
 * Internal mutation to save chat messages from the action
 */
export const saveMessagesInternal = internalMutation({
  args: {
    canvasId: v.id("canvases"),
    userMessage: v.string(),
    assistantMessage: v.string(),
    action: v.string(),
    sectionId: v.optional(v.string()),
    sectionTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Save user message
    await ctx.db.insert("planChatMessages", {
      canvasId: args.canvasId,
      role: "user",
      content: args.userMessage,
      createdAt: now,
    });

    // Save assistant message with action metadata
    await ctx.db.insert("planChatMessages", {
      canvasId: args.canvasId,
      role: "assistant",
      content: args.assistantMessage,
      toolCalls:
        args.action !== "none"
          ? [
              {
                toolName: args.action,
                args: {
                  sectionId: args.sectionId,
                  sectionTitle: args.sectionTitle,
                },
                result: { success: true },
              },
            ]
          : undefined,
      createdAt: now + 1,
    });
  },
});

/**
 * Get all chat messages for a canvas, ordered by creation time
 */
export const listByCanvas = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("planChatMessages")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    // Sort by creation time ascending (oldest first)
    return messages.sort((a, b) => a.createdAt - b.createdAt);
  },
});

/**
 * Add a user message to the chat
 */
export const addUserMessage = mutation({
  args: {
    canvasId: v.id("canvases"),
    content: v.string(),
  },
  handler: async (ctx, args) =>
    await ctx.db.insert("planChatMessages", {
      canvasId: args.canvasId,
      role: "user",
      content: args.content,
      createdAt: Date.now(),
    }),
});

/**
 * Add an assistant message to the chat
 */
export const addAssistantMessage = mutation({
  args: {
    canvasId: v.id("canvases"),
    content: v.string(),
    toolCalls: v.optional(v.array(toolCallValidator)),
  },
  handler: async (ctx, args) =>
    await ctx.db.insert("planChatMessages", {
      canvasId: args.canvasId,
      role: "assistant",
      content: args.content,
      toolCalls: args.toolCalls,
      createdAt: Date.now(),
    }),
});

/**
 * Clear all chat messages for a canvas (used when regenerating plan)
 */
export const clearByCanvas = mutation({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("planChatMessages")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    return { deleted: messages.length };
  },
});

/**
 * Get the count of messages for a canvas
 */
export const countByCanvas = query({
  args: { canvasId: v.id("canvases") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("planChatMessages")
      .withIndex("by_canvas", (q) => q.eq("canvasId", args.canvasId))
      .collect();

    return messages.length;
  },
});
