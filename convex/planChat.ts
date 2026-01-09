"use node";

import { generateText } from "ai";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action } from "./_generated/server";
import { gpt51Mini } from "./rag";

/**
 * Section structure for plan context
 */
const planSectionValidator = v.object({
  id: v.string(),
  title: v.string(),
  purpose: v.string(),
  confidence: v.number(),
});

/**
 * Send a chat message and get an AI response
 * The AI can modify the plan by calling appropriate mutations
 */
export const sendMessage = action({
  args: {
    canvasId: v.id("canvases"),
    message: v.string(),
    planContext: v.object({
      canvasTitle: v.string(),
      canvasPurpose: v.string(),
      sections: v.array(planSectionValidator),
    }),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    response: string;
    action: "none" | "add_section" | "remove_section" | "update_section";
    sectionId?: string;
    sectionTitle?: string;
  }> => {
    // Build the system prompt with plan context
    const sectionsDescription = args.planContext.sections
      .map(
        (s, i) =>
          `${i + 1}. "${s.title}" (ID: ${s.id}) - ${s.purpose} [${s.confidence}% confidence]`
      )
      .join("\n");

    const systemPrompt = `You are a helpful assistant that helps consultants refine their presentation canvas plans.

## Current Plan
**Title:** ${args.planContext.canvasTitle}
**Purpose:** ${args.planContext.canvasPurpose}

## Current Sections
${sectionsDescription || "No sections yet"}

## Your Task
Analyze the user's request and determine the appropriate action:
1. If they want to ADD a section, respond with action "ADD_SECTION" followed by the section details
2. If they want to REMOVE a section, respond with action "REMOVE_SECTION" followed by the section ID
3. If they want to UPDATE a section, respond with action "UPDATE_SECTION" followed by the changes
4. If it's just a question or conversation, respond naturally with action "NONE"

## Response Format
Always respond in this exact format:
ACTION: [NONE|ADD_SECTION|REMOVE_SECTION|UPDATE_SECTION]
SECTION_ID: [section-id if applicable, otherwise "none"]
SECTION_TITLE: [title for new section if adding, or current title if removing/updating]
SECTION_PURPOSE: [purpose for new section if adding]
RESPONSE: [Your conversational response to the user]

Be helpful, professional, and concise.`;

    try {
      const { text } = await generateText({
        model: gpt51Mini,
        maxOutputTokens: 1000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: args.message },
        ],
      });

      // Parse the response
      const actionMatch = text.match(/ACTION:\s*(\w+)/i);
      const sectionIdMatch = text.match(/SECTION_ID:\s*([^\n]+)/i);
      const sectionTitleMatch = text.match(/SECTION_TITLE:\s*([^\n]+)/i);
      const sectionPurposeMatch = text.match(/SECTION_PURPOSE:\s*([^\n]+)/i);
      const responseMatch = text.match(/RESPONSE:\s*([\s\S]*?)$/i);

      const detectedAction = actionMatch?.[1]?.toUpperCase() || "NONE";
      const sectionId = sectionIdMatch?.[1]?.trim();
      const sectionTitle = sectionTitleMatch?.[1]?.trim();
      const sectionPurpose = sectionPurposeMatch?.[1]?.trim();
      const response = responseMatch?.[1]?.trim() || text;

      // Execute the action
      let actionType:
        | "none"
        | "add_section"
        | "remove_section"
        | "update_section" = "none";

      if (detectedAction === "ADD_SECTION" && sectionTitle) {
        actionType = "add_section";

        // Add the section via mutation
        const newSection = {
          id: `section-${Date.now()}`,
          title: sectionTitle,
          purpose: sectionPurpose || `Content about ${sectionTitle}`,
          keyQuestions: [],
          dataSourceIds: [],
          suggestedContent: {
            narrativePoints: [`Key information about ${sectionTitle}`],
            visualizations: [],
            callouts: [
              {
                type: "insight",
                content: `Important insight about ${sectionTitle}`,
              },
            ],
          },
          confidence: 75,
          generationPriority: args.planContext.sections.length + 1,
          status: "pending" as const,
        };

        await ctx.runMutation(api.canvasPlanHelpers.addSection, {
          canvasId: args.canvasId,
          section: newSection,
        });
      } else if (
        detectedAction === "REMOVE_SECTION" &&
        sectionId &&
        sectionId !== "none"
      ) {
        actionType = "remove_section";

        // Find section by ID or by title match
        let targetSectionId = sectionId;
        if (!args.planContext.sections.find((s) => s.id === sectionId)) {
          // Try to find by title
          const sectionByTitle = args.planContext.sections.find((s) =>
            s.title.toLowerCase().includes(sectionTitle?.toLowerCase() || "")
          );
          if (sectionByTitle) {
            targetSectionId = sectionByTitle.id;
          }
        }

        await ctx.runMutation(api.canvasPlanHelpers.removeSection, {
          canvasId: args.canvasId,
          sectionId: targetSectionId,
        });
      } else if (
        detectedAction === "UPDATE_SECTION" &&
        sectionId &&
        sectionId !== "none"
      ) {
        actionType = "update_section";

        await ctx.runMutation(api.canvasPlanHelpers.updateSection, {
          canvasId: args.canvasId,
          sectionId,
          updates: {
            ...(sectionTitle && { title: sectionTitle }),
            ...(sectionPurpose && { purpose: sectionPurpose }),
          },
        });
      }

      // Save the messages
      await ctx.runMutation(internal.planChatMessages.saveMessagesInternal, {
        canvasId: args.canvasId,
        userMessage: args.message,
        assistantMessage: response,
        action: actionType,
        sectionId: sectionId !== "none" ? sectionId : undefined,
        sectionTitle,
      });

      return {
        response,
        action: actionType,
        sectionId: sectionId !== "none" ? sectionId : undefined,
        sectionTitle,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Chat error:", errorMessage);

      return {
        response: `I'm sorry, I encountered an error processing your request. Please try again. Error: ${errorMessage}`,
        action: "none",
      };
    }
  },
});
