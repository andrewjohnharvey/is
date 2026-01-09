"use client";

import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { cn } from "@/lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { usePlanChat } from "../_hooks/use-plan-chat";
import type { CanvasPlan, PlanSection } from "./mock-data";

// Chat message type from usePlanChat hook
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

type StepReviewPlanProps = {
  canvasId?: Id<"canvases">;
  plan: CanvasPlan | null;
  isPlanGenerating: boolean;
  onBack: () => void;
  onContinue: () => void;
  onGeneratePlan: () => void;
  onRemoveSection: (sectionId: string) => void;
  onRegeneratePlan: () => void;
};

export function StepReviewPlan({
  canvasId,
  plan,
  isPlanGenerating,
  onBack,
  onContinue,
  onGeneratePlan,
  onRemoveSection,
  onRegeneratePlan,
}: StepReviewPlanProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Use the chat hook only when canvasId is provided
  // This is a workaround for the prototype mode which doesn't have a canvasId
  const chatHook = usePlanChat({
    canvasId: canvasId as Id<"canvases">,
    plan,
  });

  // When canvasId is not provided, use fallback values
  const messages = canvasId ? chatHook.messages : [];
  const input = canvasId ? chatHook.input : "";
  const handleInputChange = canvasId ? chatHook.handleInputChange : () => {};
  const isLoading = canvasId ? chatHook.isLoading : false;
  const sendMessage = canvasId ? chatHook.sendMessage : async () => {};

  // Auto-generate plan on mount if not already generated
  useEffect(() => {
    if (!(plan || isPlanGenerating)) {
      onGeneratePlan();
    }
  }, [plan, isPlanGenerating, onGeneratePlan]);

  // Auto-scroll chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const canContinue = plan !== null && plan.sections.length > 0;

  // Show loading state while generating
  if (isPlanGenerating || !plan) {
    return <PlanGeneratingState />;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Main content - two column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left column: Plan display */}
        <div className="flex-1 overflow-y-auto border-border border-r p-6">
          <PlanDisplay
            onRegeneratePlan={onRegeneratePlan}
            onRemoveSection={onRemoveSection}
            plan={plan}
          />
        </div>

        {/* Right column: Chat interface */}
        <div className="flex w-[400px] flex-col bg-muted/30">
          <StreamingChatInterface
            chatEndRef={chatEndRef}
            handleInputChange={handleInputChange}
            input={input}
            isLoading={isLoading}
            messages={messages}
            onKeyDown={handleKeyDown}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>

      {/* Navigation footer */}
      <WizardNavigation
        canContinue={canContinue}
        canGoBack
        continueLabel="Generate Canvas"
        onBack={onBack}
        onContinue={onContinue}
      />
    </div>
  );
}

function PlanGeneratingState() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Sparkles className="size-12 text-primary" />
            <div className="absolute inset-0 animate-ping">
              <Sparkles className="size-12 text-primary/30" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="font-semibold text-lg">Analyzing Your Documents</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Creating a presentation plan based on your context...
            </p>
          </div>
          <Loader2 className="mt-2 size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

type PlanDisplayProps = {
  plan: CanvasPlan;
  onRemoveSection: (sectionId: string) => void;
  onRegeneratePlan: () => void;
};

function PlanDisplay({
  plan,
  onRemoveSection,
  onRegeneratePlan,
}: PlanDisplayProps) {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-semibold font-serif text-2xl text-foreground">
          {plan.canvasTitle}
        </h1>
        <p className="mt-2 text-muted-foreground">{plan.canvasPurpose}</p>
      </div>

      {/* Sections */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4" />
            Proposed Sections ({plan.sections.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan.sections.map((section, index) => (
            <SectionCard
              index={index}
              key={section.id}
              onRemove={() => onRemoveSection(section.id)}
              section={section}
            />
          ))}
        </CardContent>
      </Card>

      {/* Additional Ideas */}
      {plan.additionalIdeas.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Additional Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {plan.additionalIdeas.map((idea, index) => (
                <div
                  className="flex items-start gap-2 text-muted-foreground text-sm"
                  key={index}
                >
                  <Plus className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <span className="font-medium text-foreground">
                      {idea.title}
                    </span>
                    <span className="ml-1">- {idea.description}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-muted-foreground text-xs">
              Ask in the chat to add any of these sections to your plan.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Regenerate button */}
      <div className="mt-6">
        <Button onClick={onRegeneratePlan} variant="outline">
          <RefreshCw className="size-4" />
          Regenerate Plan
        </Button>
      </div>
    </div>
  );
}

type SectionCardProps = {
  section: PlanSection;
  index: number;
  onRemove: () => void;
};

function SectionCard({ section, index, onRemove }: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetails =
    (section.narrativePoints && section.narrativePoints.length > 0) ||
    (section.callouts && section.callouts.length > 0);

  return (
    <div className="rounded-lg border">
      {/* Header - always visible */}
      <div
        className={cn(
          "flex items-start gap-3 p-4",
          hasDetails && "cursor-pointer hover:bg-muted/30",
          isExpanded && "border-b"
        )}
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
      >
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-sm">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{section.title}</h4>
            <Badge
              className="text-xs"
              variant={
                section.confidence >= 80
                  ? "default"
                  : section.confidence >= 60
                    ? "secondary"
                    : "outline"
              }
            >
              {section.confidence}%
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground text-sm">
            {section.purpose}
          </p>
          {section.suggestedVisualizations.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {section.suggestedVisualizations.map((viz, i) => (
                <Badge className="text-xs" key={i} variant="outline">
                  {viz}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {hasDetails && (
            <div className="text-muted-foreground">
              {isExpanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </div>
          )}
          <Button
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            size="icon"
            variant="ghost"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && hasDetails && (
        <div className="bg-muted/20 p-4 pt-3">
          {/* Narrative Points */}
          {section.narrativePoints && section.narrativePoints.length > 0 && (
            <div className="mb-4">
              <h5 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Key Points
              </h5>
              <ul className="space-y-1.5">
                {section.narrativePoints.map((point, i) => (
                  <li className="flex items-start gap-2 text-sm" key={i}>
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Callouts */}
          {section.callouts && section.callouts.length > 0 && (
            <div>
              <h5 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Insights
              </h5>
              <div className="space-y-2">
                {section.callouts.map((callout, i) => (
                  <CalloutItem
                    content={callout.content}
                    key={i}
                    type={callout.type}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CalloutItem({ type, content }: { type: string; content: string }) {
  const getIcon = () => {
    switch (type) {
      case "insight":
        return <Lightbulb className="size-4 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="size-4 text-amber-500" />;
      case "recommendation":
        return <ArrowRight className="size-4 text-green-500" />;
      default:
        return <Lightbulb className="size-4 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "insight":
        return "bg-blue-50 dark:bg-blue-950/30";
      case "warning":
        return "bg-amber-50 dark:bg-amber-950/30";
      case "recommendation":
        return "bg-green-50 dark:bg-green-950/30";
      default:
        return "bg-muted";
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md p-2 text-sm",
        getBgColor()
      )}
    >
      <span className="mt-0.5 shrink-0">{getIcon()}</span>
      <span>{content}</span>
    </div>
  );
}

type StreamingChatInterfaceProps = {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSendMessage: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
};

function StreamingChatInterface({
  messages,
  input,
  isLoading,
  handleInputChange,
  onSendMessage,
  onKeyDown,
  chatEndRef,
}: StreamingChatInterfaceProps) {
  return (
    <>
      {/* Chat header */}
      <div className="border-border border-b px-4 py-3">
        <h3 className="font-medium text-sm">Refine Your Plan</h3>
        <p className="text-muted-foreground text-xs">
          Chat with AI to adjust sections
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm">
              <p>Ask me to add, remove, or modify sections in your plan.</p>
              <p className="mt-2 text-xs">
                Try: "Add a section about employee wellness" or "Remove the
                claims trends section"
              </p>
            </div>
          )}
          {messages.map((message) => (
            <StreamingChatMessageBubble key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="size-3 text-primary" />
              </div>
              <div className="rounded-lg bg-background p-3">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-border border-t p-4">
        <div className="flex gap-2">
          <Input
            disabled={isLoading}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            placeholder="Ask to add, remove, or modify sections..."
            value={input}
          />
          <Button
            disabled={!input.trim() || isLoading}
            onClick={onSendMessage}
            size="icon"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

type StreamingChatMessageBubbleProps = {
  message: ChatMessage;
};

function StreamingChatMessageBubble({
  message,
}: StreamingChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-start gap-2", isUser && "flex-row-reverse")}>
      {!isUser && (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="size-3 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-lg p-3 text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-background"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
