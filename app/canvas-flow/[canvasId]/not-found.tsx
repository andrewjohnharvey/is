"use client";

import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CanvasNotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 bg-background p-8">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="size-8 text-muted-foreground" />
      </div>

      <div className="text-center">
        <h1 className="mb-2 font-semibold text-2xl">Canvas Not Found</h1>
        <p className="max-w-md text-muted-foreground">
          The canvas you're looking for doesn't exist or may have been deleted.
        </p>
      </div>

      <Button asChild>
        <Link href="/canvas-flow">Return to Dashboard</Link>
      </Button>
    </div>
  );
}
