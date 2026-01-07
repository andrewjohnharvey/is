"use client";

import {
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  Save,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface StepWelcomeProps {
  onGetStarted: () => void;
}

export function StepWelcome({ onGetStarted }: StepWelcomeProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-8 py-12">
      <div className="mx-auto max-w-2xl text-center">
        {/* Hero */}
        <div className="mb-8">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <FileText className="size-8" />
          </div>
          <h1 className="mb-4 font-bold text-3xl tracking-tight">
            Let's Create Your Renewal Presentation
          </h1>
          <p className="text-lg text-muted-foreground">
            We'll guide you through collecting the right documents and
            generating a professional presentation in just a few minutes.
          </p>
        </div>

        {/* What you'll get */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="mb-4 font-semibold text-muted-foreground text-sm uppercase tracking-wide">
              What you'll get
            </h2>
            <ul className="grid gap-3 text-left sm:grid-cols-2">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-500" />
                <span>Executive summary with key metrics</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="mt-0.5 size-5 shrink-0 text-blue-500" />
                <span>Claims trend analysis and visualizations</span>
              </li>
              <li className="flex items-start gap-3">
                <BarChart3 className="mt-0.5 size-5 shrink-0 text-purple-500" />
                <span>Cost comparison and benchmarking</span>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="mt-0.5 size-5 shrink-0 text-orange-500" />
                <span>Renewal options with recommendations</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Time estimate */}
        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4" />
            <span className="text-sm">Estimated time: 5-10 minutes</span>
          </div>
          <div className="hidden size-1 rounded-full bg-border sm:block" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Save className="size-4" />
            <span className="text-sm">
              Your progress is saved automatically
            </span>
          </div>
        </div>

        {/* CTA */}
        <Button className="px-8" onClick={onGetStarted} size="lg">
          Get Started
        </Button>
      </div>
    </div>
  );
}
