"use client";

import { useAction, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { CanvasPlan } from "../_components/mock-data";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface UsePlanChatOptions {
  canvasId: Id<"canvases">;
  plan: CanvasPlan | null;
}

interface UsePlanChatReturn {
  messages: ChatMessage[];
  input: string;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
}

/**
 * Hook for managing the plan refinement chat with AI responses
 * and persistent message storage in Convex.
 */
export function usePlanChat({
  canvasId,
  plan,
}: UsePlanChatOptions): UsePlanChatReturn {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Query stored messages from Convex
  const storedMessages = useQuery(api.planChatMessages.listByCanvas, {
    canvasId,
  });

  // Action to send chat message
  const sendChatMessage = useAction(api.planChat.sendMessage);

  // Transform stored messages to chat format
  const messages: ChatMessage[] = (storedMessages ?? []).map((msg) => ({
    id: msg._id,
    role: msg.role,
    content: msg.content,
    createdAt: new Date(msg.createdAt),
  }));

  // Handle input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!(content.trim() && plan)) return;

      setIsLoading(true);
      setInput("");

      try {
        // Build plan context for the action
        const planContext = {
          canvasTitle: plan.canvasTitle,
          canvasPurpose: plan.canvasPurpose,
          sections: plan.sections.map((s) => ({
            id: s.id,
            title: s.title,
            purpose: s.purpose,
            confidence: s.confidence,
          })),
        };

        // Call the Convex action
        await sendChatMessage({
          canvasId,
          message: content.trim(),
          planContext,
        });

        // Messages will be updated via the useQuery subscription
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [canvasId, plan, sendChatMessage]
  );

  return {
    messages,
    input,
    handleInputChange,
    isLoading,
    sendMessage,
  };
}
