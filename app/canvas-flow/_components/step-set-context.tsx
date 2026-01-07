"use client";

import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { cn } from "@/lib/utils";
import {
  AUDIENCE_OPTIONS,
  type AudienceType,
  type ContextState,
  PRIORITY_OPTIONS,
  type PriorityType,
} from "./mock-data";

interface StepSetContextProps {
  context: ContextState;
  onUpdateContext: (partial: Partial<ContextState>) => void;
  onTogglePriority: (priority: PriorityType) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function StepSetContext({
  context,
  onUpdateContext,
  onTogglePriority,
  onContinue,
  onBack,
}: StepSetContextProps) {
  const canContinue =
    context.audience !== null && context.priorities.length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <h1 className="font-semibold font-serif text-3xl text-foreground">
            Set Context
          </h1>
          <p className="mt-2 text-muted-foreground">
            Help us understand your audience and priorities
          </p>

          {/* Client Name & Renewal Period Row */}
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <label
                className="mb-2 block font-medium text-foreground text-sm"
                htmlFor="client-name"
              >
                Client Name
              </label>
              <Input
                id="client-name"
                onChange={(e) =>
                  onUpdateContext({ clientName: e.target.value })
                }
                placeholder="Enter client name"
                value={context.clientName}
              />
            </div>
            <div>
              <label
                className="mb-2 block font-medium text-foreground text-sm"
                htmlFor="renewal-period"
              >
                Renewal Period
              </label>
              <Input
                id="renewal-period"
                onChange={(e) =>
                  onUpdateContext({ renewalPeriod: e.target.value })
                }
                placeholder="e.g., 1/1/2025"
                value={context.renewalPeriod}
              />
            </div>
          </div>

          {/* Audience Selection */}
          <div className="mt-10">
            <p className="mb-4 text-muted-foreground text-sm">
              Who is the primary audience for this presentation?
            </p>
            <div className="grid grid-cols-2 gap-4">
              {AUDIENCE_OPTIONS.map((audience) => (
                <AudienceCard
                  audience={audience}
                  isSelected={context.audience === audience.id}
                  key={audience.id}
                  onSelect={() => onUpdateContext({ audience: audience.id })}
                />
              ))}
            </div>
          </div>

          {/* Priority Selection */}
          <div className="mt-10">
            <p className="mb-4 text-muted-foreground text-sm">
              What are the top priorities for this renewal?{" "}
              <span className="text-muted-foreground/70">(Select up to 3)</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PRIORITY_OPTIONS.map((priority) => (
                <PriorityCard
                  isDisabled={
                    context.priorities.length >= 3 &&
                    !context.priorities.includes(priority.id)
                  }
                  isSelected={context.priorities.includes(priority.id)}
                  key={priority.id}
                  onToggle={() => onTogglePriority(priority.id)}
                  priority={priority}
                />
              ))}
            </div>
          </div>

          {/* Presentation Depth Slider */}
          <div className="mt-10">
            <p className="mb-4 text-muted-foreground text-sm">
              Presentation Depth
            </p>
            <div className="flex items-center gap-4">
              <span className="w-32 text-foreground text-sm">
                Comprehensive
              </span>
              <input
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                max="100"
                min="0"
                onChange={(e) =>
                  onUpdateContext({ presentationDepth: Number(e.target.value) })
                }
                type="range"
                value={context.presentationDepth}
              />
              <span className="w-20 text-right text-foreground text-sm">
                Focused
              </span>
            </div>
          </div>
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

interface AudienceCardProps {
  audience: { id: AudienceType; label: string; description: string };
  isSelected: boolean;
  onSelect: () => void;
}

function AudienceCard({ audience, isSelected, onSelect }: AudienceCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer p-4 transition-all",
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "hover:border-primary/50"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
            isSelected
              ? "border-primary bg-primary"
              : "border-muted-foreground/30"
          )}
        >
          {isSelected && <Check className="size-3 text-primary-foreground" />}
        </div>
        <div>
          <p className="font-medium text-sm">{audience.label}</p>
          <p className="mt-0.5 text-muted-foreground text-xs">
            {audience.description}
          </p>
        </div>
      </div>
    </Card>
  );
}

interface PriorityCardProps {
  priority: { id: PriorityType; label: string; description: string };
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}

function PriorityCard({
  priority,
  isSelected,
  isDisabled,
  onToggle,
}: PriorityCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer p-3 transition-all",
        isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50",
        isDisabled && "cursor-not-allowed opacity-50 hover:border-border"
      )}
      onClick={() => !isDisabled && onToggle()}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border-2",
            isSelected
              ? "border-primary bg-primary"
              : "border-muted-foreground/30"
          )}
        >
          {isSelected && <Check className="size-2.5 text-primary-foreground" />}
        </div>
        <div>
          <p className="font-medium text-sm">{priority.label}</p>
          <p className="mt-0.5 text-muted-foreground text-xs">
            {priority.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
