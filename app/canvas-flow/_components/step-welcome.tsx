"use client";

import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  Save,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CanvasType } from "./mock-data";

interface StepWelcomeProps {
  canvasType: CanvasType | null;
  clientName: string;
  onContinue: () => void;
}

const CANVAS_TYPE_LABELS: Record<CanvasType, string> = {
  renewal: "Renewal Presentation",
  "pre-renewal": "Pre-Renewal Analysis",
  benchmarking: "Benchmarking Report",
  "cost-analysis": "Cost Analysis",
};

const FEATURES = [
  {
    icon: FileText,
    title: "Executive Summary",
    description: "Key findings and highlights",
  },
  {
    icon: TrendingUp,
    title: "Claims Analysis",
    description: "Trend insights and patterns",
  },
  {
    icon: Zap,
    title: "Cost Projections",
    description: "Comparison and forecasts",
  },
  {
    icon: CheckCircle,
    title: "Recommendations",
    description: "Actionable renewal options",
  },
];

export function StepWelcome({
  canvasType,
  clientName,
  onContinue,
}: StepWelcomeProps) {
  const canvasLabel = canvasType ? CANVAS_TYPE_LABELS[canvasType] : "Canvas";

  return (
    <div className="flex flex-1 flex-col">
      {/* Main content */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-xl text-center">
          {/* Header */}
          <Badge className="mb-4" variant="secondary">
            {canvasLabel}
          </Badge>
          <h1 className="mb-3 font-semibold font-serif text-3xl">
            Let's Create Your Canvas
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            We'll guide you through a few simple steps to build a professional
            benefits presentation for{" "}
            <span className="font-medium text-foreground">{clientName}</span>.
          </p>

          {/* Features */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            {FEATURES.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="size-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{feature.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info */}
          <div className="mb-8 flex items-center justify-center gap-6 text-muted-foreground text-sm">
            <span className="flex items-center gap-2">
              <Clock className="size-4" />
              5-10 minutes
            </span>
            <span className="flex items-center gap-2">
              <Save className="size-4" />
              Progress saved automatically
            </span>
          </div>

          {/* CTA */}
          <Button onClick={onContinue} size="lg">
            Get Started
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
