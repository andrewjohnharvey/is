import type * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full min-w-0 rounded-xl border border-border bg-background px-4 py-3 text-base shadow-sm outline-none transition-all duration-150",
        "placeholder:text-muted-foreground",
        "selection:bg-primary selection:text-primary-foreground",
        "hover:border-muted-foreground/30",
        "focus-visible:border-blue-lightest focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-blue-lightest/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "file:mr-3 file:inline-flex file:h-8 file:rounded-md file:border-0 file:bg-primary file:px-3 file:font-medium file:text-primary-foreground file:text-sm",
        className
      )}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}

export { Input };
