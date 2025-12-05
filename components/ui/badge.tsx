import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

// Group-hover styles for badges inside interactive cards
// - group-hover: for desktop hover state
// - max-md:group-data-[interactive]: for mobile persistent dark state
const groupHoverInvert = [
  "group-hover:border-primary-foreground/20 group-hover:bg-primary-foreground/15 group-hover:text-primary-foreground",
  "max-md:group-data-[interactive]:border-primary-foreground/20 max-md:group-data-[interactive]:bg-primary-foreground/15 max-md:group-data-[interactive]:text-primary-foreground",
].join(" ");

// Group-hover styles for badges in tables/lists - switch to solid on hover
// Uses named group "row" to scope hover to table rows only
const groupHoverSolid = {
  blue: "group-hover/row:bg-blue-dark group-hover/row:text-neutral-off-white",
  green: "group-hover/row:bg-green-dark group-hover/row:text-neutral-off-white",
  yellow: "group-hover/row:bg-yellow-lightest group-hover/row:text-yellow-deep",
  orange: "group-hover/row:bg-orange-lightest group-hover/row:text-orange-deep",
  neutral:
    "group-hover/row:bg-neutral-dark group-hover/row:text-neutral-off-white",
};

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-md border px-2.5 py-1 font-semibold text-xs tracking-wide transition-colors [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-transparent text-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
        // Industry accent variants - with group-hover solid for tables/lists
        blue: `border-transparent bg-blue-dark/10 text-blue-dark ${groupHoverSolid.blue}`,
        green: `border-transparent bg-green-dark/10 text-green-dark ${groupHoverSolid.green}`,
        yellow: `border-transparent bg-yellow-dark/10 text-yellow-dark ${groupHoverSolid.yellow}`,
        orange: `border-transparent bg-orange-dark/10 text-orange-dark ${groupHoverSolid.orange}`,
        neutral: `border-transparent bg-neutral-dark/10 text-neutral-dark ${groupHoverSolid.neutral}`,
        // Industry accent variants - with group-hover inversion for interactive cards
        "blue-invert": `border-transparent bg-blue-dark/10 text-blue-dark ${groupHoverInvert}`,
        "green-invert": `border-transparent bg-green-dark/10 text-green-dark ${groupHoverInvert}`,
        "yellow-invert": `border-transparent bg-yellow-dark/10 text-yellow-dark ${groupHoverInvert}`,
        "orange-invert": `border-transparent bg-orange-dark/10 text-orange-dark ${groupHoverInvert}`,
        "neutral-invert": `border-transparent bg-neutral-dark/10 text-neutral-dark ${groupHoverInvert}`,
        // Solid accent variants
        "blue-solid": "border-transparent bg-blue-dark text-neutral-off-white",
        "green-solid":
          "border-transparent bg-green-dark text-neutral-off-white",
        "yellow-solid":
          "border-transparent bg-yellow-lightest text-yellow-deep",
        "orange-solid":
          "border-transparent bg-orange-lightest text-orange-deep",
        // Inverted variant for explicit dark background usage
        inverted:
          "border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      className={cn(badgeVariants({ variant }), className)}
      data-slot="badge"
      {...props}
    />
  );
}

export { Badge, badgeVariants };
