import { ArrowRight } from "lucide-react";
import type * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ArrowButtonProps
  extends Omit<React.ComponentProps<"button">, "children"> {
  asChild?: boolean;
}

/**
 * ArrowButton - A circular button with an arrow icon that animates to fully round on hover.
 * Per brand guidelines (Image 6): "Arrow buttons will animate to fully round, circular buttons on hover"
 *
 * Supports group-hover for use inside interactive cards:
 * - Desktop: inverts on card hover
 * - Mobile: shows inverted state by default (matches card's persistent dark state)
 */
function ArrowButton({
  className,
  asChild = false,
  ...props
}: ArrowButtonProps) {
  return (
    <Button
      asChild={asChild}
      className={cn(
        // Group-hover support for interactive cards (desktop hover)
        "group-hover:rounded-full group-hover:border-transparent group-hover:bg-primary-foreground group-hover:text-primary",
        // Mobile persistent dark state (matches card's max-md dark state)
        "max-md:group-data-[interactive]:rounded-full max-md:group-data-[interactive]:border-transparent max-md:group-data-[interactive]:bg-primary-foreground max-md:group-data-[interactive]:text-primary",
        className
      )}
      size="arrow"
      variant="arrow"
      {...props}
    >
      <ArrowRight className="size-5" />
    </Button>
  );
}

export { ArrowButton };
