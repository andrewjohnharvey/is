"use client";

import {
  Check,
  DollarSign,
  Lightbulb,
  MessageSquareText,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { cn } from "@/lib/utils";
import {
  AUDIENCE_OPTIONS,
  type AudienceType,
  BUDGET_COMPARISON_OPTIONS,
  type BudgetComparisonType,
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

          {/* Projected Increase Section */}
          <Card className="mt-8 p-6">
            {/* Projected Increase Header */}
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50">
                <TrendingUp className="size-4 text-blue-600" />
              </div>
              <div>
                <h2 className="font-medium text-foreground">
                  Projected Increase
                </h2>
              </div>
            </div>

            {/* Expected Increase & Budget Comparison Row */}
            <div className="mt-5 grid grid-cols-2 gap-6">
              <div>
                <label
                  className="mb-2 block font-medium text-foreground text-sm"
                  htmlFor="expected-increase"
                >
                  Expected Increase %
                </label>
                <div className="relative">
                  <Input
                    className="pr-8"
                    id="expected-increase"
                    onChange={(e) => {
                      const value = e.target.value;
                      onUpdateContext({
                        expectedIncreasePercent:
                          value === "" ? null : Number(value),
                      });
                    }}
                    placeholder="e.g., 9"
                    type="number"
                    value={context.expectedIncreasePercent ?? ""}
                  />
                  <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-muted-foreground">
                    %
                  </span>
                </div>
                <p className="mt-1.5 text-muted-foreground text-xs">
                  From analytics team based on claims data
                </p>
              </div>
              <div>
                <label
                  className="mb-2 block font-medium text-foreground text-sm"
                  htmlFor="budget-comparison"
                >
                  Budget Comparison
                </label>
                <Select
                  onValueChange={(value: BudgetComparisonType) =>
                    onUpdateContext({ budgetComparison: value })
                  }
                  value={context.budgetComparison ?? undefined}
                >
                  <SelectTrigger className="h-12" id="budget-comparison">
                    <SelectValue placeholder="Select comparison" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_COMPARISON_OPTIONS.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1.5 text-muted-foreground text-xs">
                  How does the increase compare to allocated budget?
                </p>
              </div>
            </div>

            {/* Market Benchmarks Section */}
            <div className="mt-6 border-border border-t pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-green-50">
                  <DollarSign className="size-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    Market Benchmarks{" "}
                    <span className="font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Add context from industry, regional, or national data if
                    available
                  </p>
                </div>
              </div>

              {/* Benchmark Inputs Row */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <label
                    className="mb-2 block font-medium text-foreground text-sm"
                    htmlFor="national-average"
                  >
                    National Average %
                  </label>
                  <div className="relative">
                    <Input
                      className="pr-8"
                      id="national-average"
                      onChange={(e) => {
                        const value = e.target.value;
                        onUpdateContext({
                          nationalAveragePercent:
                            value === "" ? null : Number(value),
                        });
                      }}
                      placeholder="e.g., 8"
                      type="number"
                      value={context.nationalAveragePercent ?? ""}
                    />
                    <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <label
                    className="mb-2 block font-medium text-foreground text-sm"
                    htmlFor="regional-average"
                  >
                    Regional Average %
                  </label>
                  <div className="relative">
                    <Input
                      className="pr-8"
                      id="regional-average"
                      onChange={(e) => {
                        const value = e.target.value;
                        onUpdateContext({
                          regionalAveragePercent:
                            value === "" ? null : Number(value),
                        });
                      }}
                      placeholder="e.g., 8"
                      type="number"
                      value={context.regionalAveragePercent ?? ""}
                    />
                    <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <label
                    className="mb-2 block font-medium text-foreground text-sm"
                    htmlFor="industry-average"
                  >
                    Industry Average %
                  </label>
                  <div className="relative">
                    <Input
                      className="pr-8"
                      id="industry-average"
                      onChange={(e) => {
                        const value = e.target.value;
                        onUpdateContext({
                          industryAveragePercent:
                            value === "" ? null : Number(value),
                        });
                      }}
                      placeholder="e.g., 6"
                      type="number"
                      value={context.industryAveragePercent ?? ""}
                    />
                    <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

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

          {/* AI Context Section */}
          <Card className="mt-10 p-6">
            {/* Strategy Ideas */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50">
                  <Lightbulb className="size-4 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-medium text-foreground">
                    Strategy Ideas{" "}
                    <span className="font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </h2>
                  <p className="text-muted-foreground text-xs">
                    Share cost-saving strategies or ideas for the AI to consider
                  </p>
                </div>
              </div>
              <textarea
                className="mt-4 min-h-[100px] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                id="strategy-ideas"
                onChange={(e) =>
                  onUpdateContext({ strategyIdeas: e.target.value })
                }
                placeholder="e.g., Increase employee contributions, raise deductibles, explore HDHPs with HSA options, consider voluntary benefits..."
                value={context.strategyIdeas}
              />
            </div>

            {/* Additional Context */}
            <div className="mt-6 border-border border-t pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-50">
                  <MessageSquareText className="size-4 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-medium text-foreground">
                    Additional Context{" "}
                    <span className="font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </h2>
                  <p className="text-muted-foreground text-xs">
                    Any other information that could help generate better
                    insights
                  </p>
                </div>
              </div>
              <textarea
                className="mt-4 min-h-[100px] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                id="additional-context"
                onChange={(e) =>
                  onUpdateContext({ additionalContext: e.target.value })
                }
                placeholder="e.g., Company is planning layoffs next quarter, recent acquisition pending, union negotiations upcoming..."
                value={context.additionalContext}
              />
            </div>
          </Card>
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
