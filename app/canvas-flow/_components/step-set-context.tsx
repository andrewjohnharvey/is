"use client";

import { Check, Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type StepSetContextProps = {
  context: ContextState;
  onUpdateContext: (partial: Partial<ContextState>) => void;
  onTogglePriority: (priority: PriorityType) => void;
  onContinue: () => void;
  onBack: () => void;
};

export function StepSetContext({
  context,
  onUpdateContext,
  onTogglePriority,
  onContinue,
  onBack,
}: StepSetContextProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editRenewalPeriod, setEditRenewalPeriod] = useState(
    context.renewalPeriod
  );

  const canContinue =
    context.audience !== null && context.priorities.length > 0;

  const handleOpenEditDialog = () => {
    setEditRenewalPeriod(context.renewalPeriod);
    setIsEditDialogOpen(true);
  };

  const handleSaveRenewalPeriod = () => {
    onUpdateContext({
      renewalPeriod: editRenewalPeriod,
    });
    setIsEditDialogOpen(false);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Edit Renewal Period Dialog */}
      <Dialog onOpenChange={setIsEditDialogOpen} open={isEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Renewal Period</DialogTitle>
            <DialogDescription>
              Update the renewal period for this presentation.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <label
              className="mb-1.5 block font-medium text-foreground text-sm"
              htmlFor="edit-renewal-period"
            >
              Renewal Period
            </label>
            <Input
              className="h-10 rounded-lg px-3 text-sm"
              id="edit-renewal-period"
              onChange={(e) => setEditRenewalPeriod(e.target.value)}
              placeholder="e.g., 1/1/2025"
              value={editRenewalPeriod}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsEditDialogOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRenewalPeriod}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

          {/* Client info inline display */}
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              Client:{" "}
              <span className="font-medium text-foreground">
                {context.clientName || "Not set"}
              </span>
            </span>
            <span className="text-muted-foreground/50">|</span>
            <span className="text-muted-foreground">
              Renewal:{" "}
              <span className="font-medium text-foreground">
                {context.renewalPeriod || "Not set"}
              </span>
            </span>
            <button
              className="ml-1 inline-flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
              onClick={handleOpenEditDialog}
              type="button"
            >
              <Pencil className="size-3" />
            </button>
          </div>

          {/* Required Fields Section */}
          <div className="mt-8 flex flex-col gap-6">
            {/* Audience Selection Section */}
            <div>
              <h2 className="mb-1 font-semibold text-base text-foreground">
                Primary Audience
              </h2>
              <p className="mb-3 text-muted-foreground text-sm">
                Who is the primary audience for this presentation?
              </p>
              <div className="grid grid-cols-2 gap-2">
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

            {/* Priority Selection Section */}
            <div>
              <h2 className="mb-1 font-semibold text-base text-foreground">
                Top Priorities
              </h2>
              <p className="mb-3 text-muted-foreground text-sm">
                What are the top priorities for this renewal?{" "}
                <span className="text-muted-foreground/70">
                  (Select up to 3)
                </span>
              </p>
              <div className="grid grid-cols-3 gap-2">
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
          </div>

          {/* Additional Context Section */}
          <div className="mt-8 flex flex-col gap-6">
            {/* Projected Increase */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="mb-1.5 block font-medium text-foreground text-sm"
                  htmlFor="expected-increase"
                >
                  Expected Increase %
                </label>
                <div className="relative">
                  <Input
                    className="h-10 rounded-lg px-3 pr-8 text-sm"
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
                  <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
              </div>
              <div>
                <label
                  className="mb-1.5 block font-medium text-foreground text-sm"
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
                  <SelectTrigger
                    className="h-10 rounded-lg text-sm"
                    id="budget-comparison"
                  >
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
              </div>
            </div>

            {/* Market Benchmarks */}
            <div>
              <span className="mb-1.5 block font-medium text-foreground text-sm">
                Market Benchmarks
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <Input
                    className="h-10 rounded-lg px-3 pr-8 text-sm"
                    id="national-average"
                    onChange={(e) => {
                      const value = e.target.value;
                      onUpdateContext({
                        nationalAveragePercent:
                          value === "" ? null : Number(value),
                      });
                    }}
                    placeholder="National %"
                    type="number"
                    value={context.nationalAveragePercent ?? ""}
                  />
                  <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
                <div className="relative">
                  <Input
                    className="h-10 rounded-lg px-3 pr-8 text-sm"
                    id="regional-average"
                    onChange={(e) => {
                      const value = e.target.value;
                      onUpdateContext({
                        regionalAveragePercent:
                          value === "" ? null : Number(value),
                      });
                    }}
                    placeholder="Regional %"
                    type="number"
                    value={context.regionalAveragePercent ?? ""}
                  />
                  <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
                <div className="relative">
                  <Input
                    className="h-10 rounded-lg px-3 pr-8 text-sm"
                    id="industry-average"
                    onChange={(e) => {
                      const value = e.target.value;
                      onUpdateContext({
                        industryAveragePercent:
                          value === "" ? null : Number(value),
                      });
                    }}
                    placeholder="Industry %"
                    type="number"
                    value={context.industryAveragePercent ?? ""}
                  />
                  <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Strategy Ideas */}
            <div>
              <label
                className="mb-1.5 block font-medium text-foreground text-sm"
                htmlFor="strategy-ideas"
              >
                Strategy Ideas
              </label>
              <textarea
                className="min-h-[70px] w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                id="strategy-ideas"
                onChange={(e) =>
                  onUpdateContext({ strategyIdeas: e.target.value })
                }
                placeholder="e.g., Increase employee contributions, raise deductibles, explore HDHPs with HSA options..."
                value={context.strategyIdeas}
              />
            </div>

            {/* Additional Context */}
            <div>
              <label
                className="mb-1.5 block font-medium text-foreground text-sm"
                htmlFor="additional-context"
              >
                Additional Context
              </label>
              <textarea
                className="min-h-[70px] w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                id="additional-context"
                onChange={(e) =>
                  onUpdateContext({ additionalContext: e.target.value })
                }
                placeholder="e.g., Company is planning layoffs next quarter, recent acquisition pending..."
                value={context.additionalContext}
              />
            </div>

            {/* Presentation Depth Slider */}
            <div>
              <h2 className="mb-3 font-semibold text-base text-foreground">
                Presentation Depth
              </h2>
              <div className="flex items-center gap-4">
                <span className="w-28 text-foreground text-sm">
                  Comprehensive
                </span>
                <input
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                  max="100"
                  min="0"
                  onChange={(e) =>
                    onUpdateContext({
                      presentationDepth: Number(e.target.value),
                    })
                  }
                  type="range"
                  value={context.presentationDepth}
                />
                <span className="w-16 text-right text-foreground text-sm">
                  Focused
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation footer */}
      <WizardNavigation
        canContinue={canContinue}
        canGoBack
        continueLabel="Review Plan"
        onBack={onBack}
        onContinue={onContinue}
      />
    </div>
  );
}

type AudienceCardProps = {
  audience: { id: AudienceType; label: string; description: string };
  isSelected: boolean;
  onSelect: () => void;
};

function AudienceCard({ audience, isSelected, onSelect }: AudienceCardProps) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-background p-3 text-left transition-all",
        isSelected
          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
          : "border-border/50 hover:border-border hover:bg-muted/30"
      )}
      onClick={onSelect}
      type="button"
    >
      <div
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full border",
          isSelected
            ? "border-primary bg-primary"
            : "border-muted-foreground/40"
        )}
      >
        {isSelected ? (
          <Check className="size-2.5 text-primary-foreground" />
        ) : null}
      </div>
      <div className="min-w-0">
        <span className="font-medium text-sm">{audience.label}</span>
        <span className="ml-1.5 text-muted-foreground/70 text-xs">
          {audience.description}
        </span>
      </div>
    </button>
  );
}

type PriorityCardProps = {
  priority: { id: PriorityType; label: string; description: string };
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
};

function PriorityCard({
  priority,
  isSelected,
  isDisabled,
  onToggle,
}: PriorityCardProps) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-left transition-all",
        isSelected
          ? "border-primary/40 bg-primary/5"
          : "border-border/30 hover:border-border/50 hover:bg-muted/20",
        isDisabled ? "cursor-not-allowed opacity-40" : null
      )}
      disabled={isDisabled}
      onClick={onToggle}
      type="button"
    >
      <div
        className={cn(
          "flex size-3.5 shrink-0 items-center justify-center rounded border",
          isSelected
            ? "border-primary bg-primary"
            : "border-muted-foreground/40"
        )}
      >
        {isSelected ? (
          <Check className="size-2 text-primary-foreground" />
        ) : null}
      </div>
      <span className="font-medium text-sm">{priority.label}</span>
    </button>
  );
}
