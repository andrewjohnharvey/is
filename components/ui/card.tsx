import type * as React from "react";

import { cn } from "@/lib/utils";

interface CardProps extends React.ComponentProps<"div"> {
  interactive?: boolean;
}

function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-5 rounded-2xl border border-border/50 bg-background p-6 text-foreground shadow-sm",
        "transition-all duration-200 ease-out",
        interactive
          ? [
              "cursor-pointer",
              // Hover state
              "hover:border-transparent hover:bg-primary hover:text-primary-foreground hover:shadow-lg",
              "[&_[data-slot=card-title]]:hover:text-primary-foreground",
              "[&_[data-slot=card-description]]:hover:text-primary-foreground/80",
              // Mobile persistent dark state
              "max-md:border-transparent max-md:bg-primary max-md:text-primary-foreground max-md:shadow-lg",
              "[&_[data-slot=card-title]]:max-md:text-primary-foreground",
              "[&_[data-slot=card-description]]:max-md:text-primary-foreground/80",
            ]
          : null,
        className
      )}
      data-interactive={interactive || undefined}
      data-slot="card"
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1.5", className)}
      data-slot="card-header"
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "font-semibold text-lg leading-tight tracking-tight transition-colors",
        className
      )}
      data-slot="card-title"
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-muted-foreground text-sm leading-relaxed transition-colors",
        className
      )}
      data-slot="card-description"
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("absolute top-4 right-4", className)}
      data-slot="card-action"
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-3", className)}
      data-slot="card-content"
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-auto flex items-center pt-2", className)}
      data-slot="card-footer"
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
