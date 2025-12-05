import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold text-sm outline-none transition-all duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-blue-medium hover:shadow-md active:bg-blue-deep active:shadow-sm",
        secondary:
          "border border-border bg-secondary text-secondary-foreground shadow-sm hover:bg-muted hover:shadow-md active:bg-muted/80",
        // Tertiary: for navigation CTAs (Learn More, Read More, View All, Load More)
        tertiary:
          "bg-transparent text-foreground underline-offset-4 hover:underline active:text-muted-foreground",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground active:bg-blue-deep",
        ghost: "text-foreground hover:bg-muted active:bg-muted/80",
        link: "text-primary underline-offset-4 hover:underline",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 active:bg-destructive/80",
        // Arrow: circular button that animates to fully round on hover
        arrow:
          "rounded-lg border border-border bg-transparent text-foreground hover:rounded-full hover:border-transparent hover:bg-primary hover:text-primary-foreground active:bg-blue-deep",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 gap-1.5 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-base",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
        // Arrow button size (48px circular)
        arrow: "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      data-slot="button"
      {...props}
    />
  );
}

export { Button, buttonVariants };
