"use client";

import { ArrowLeft, ArrowRight, SkipForward } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WizardNavigationProps {
  onBack?: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  canGoBack?: boolean;
  canContinue?: boolean;
  continueLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  showSkip?: boolean;
  className?: string;
}

export function WizardNavigation({
  onBack,
  onContinue,
  onSkip,
  canGoBack = true,
  canContinue = true,
  continueLabel = "Continue",
  backLabel = "Back",
  skipLabel = "Skip",
  showSkip = false,
  className,
}: WizardNavigationProps) {
  return (
    <footer
      className={cn(
        "border-border border-t bg-background px-8 py-4",
        className
      )}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        {/* Back button */}
        <div>
          {onBack && canGoBack && (
            <Button onClick={onBack} variant="ghost">
              <ArrowLeft className="size-4" />
              {backLabel}
            </Button>
          )}
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-3">
          {showSkip && onSkip && (
            <Button onClick={onSkip} variant="ghost">
              {skipLabel}
              <SkipForward className="size-4" />
            </Button>
          )}
          <Button disabled={!canContinue} onClick={onContinue}>
            {continueLabel}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
