"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Lightbulb,
  Presentation,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface StepSuccessProps {
  canvasId: string;
  canvasTitle: string;
  slideCount: number;
  alertCount: number;
  recommendationCount: number;
  clientId: string;
  onViewCanvas: () => void;
  onExport: () => void;
}

export function StepSuccess({
  canvasTitle,
  slideCount,
  alertCount,
  recommendationCount,
  clientId,
  onViewCanvas,
  onExport,
}: StepSuccessProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 text-center">
          {/* Success icon */}
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="size-8 text-green-600" />
          </div>

          {/* Title */}
          <h2 className="mb-2 font-bold text-2xl">Your Canvas is Ready!</h2>
          <p className="mb-6 text-lg text-muted-foreground">{canvasTitle}</p>

          {/* Preview placeholder */}
          <div className="mx-auto mb-6 flex aspect-video max-w-sm items-center justify-center rounded-xl border border-border bg-muted">
            <Presentation className="size-12 text-muted-foreground" />
          </div>

          {/* Stats */}
          <div className="mb-6 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <FileText className="size-4 text-muted-foreground" />
              <span>{slideCount} slides generated</span>
            </div>
            {alertCount > 0 && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <AlertCircle className="size-4" />
                <span>{alertCount} compliance alerts</span>
              </div>
            )}
            {recommendationCount > 0 && (
              <div className="flex items-center gap-1.5 text-primary">
                <Lightbulb className="size-4" />
                <span>{recommendationCount} recommendations</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              className="flex-1 sm:flex-none"
              onClick={onViewCanvas}
              size="lg"
            >
              View & Edit Canvas
            </Button>
            <Button
              className="flex-1 sm:flex-none"
              onClick={onExport}
              size="lg"
              variant="secondary"
            >
              <Download className="size-4" />
              Export to PowerPoint
            </Button>
          </div>

          {/* Back to dashboard */}
          <div className="mt-6">
            <Button asChild variant="ghost">
              <Link href={`/clients/${clientId}/canvas`}>
                <ArrowLeft className="size-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
