"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  FileText,
  Info,
  Plus,
  Send,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  MOCK_ALERTS,
  MOCK_CLIENT,
  MOCK_SLIDES,
  MOCK_SOURCES,
} from "./mock-data";
import { StepIndicator } from "./step-indicator";

type CanvasEditorProps = {
  onExit: () => void;
};

export function CanvasEditor({ onExit }: CanvasEditorProps) {
  const [selectedSlideId, setSelectedSlideId] = useState(MOCK_SLIDES[0].id);
  const [aiPrompt, setAiPrompt] = useState("");

  const selectedSlide = MOCK_SLIDES.find((s) => s.id === selectedSlideId);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Step Indicator */}
      <div className="border-border border-b">
        <StepIndicator currentStep={4} />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between border-border border-b bg-card px-4 py-3">
        <div className="flex items-center gap-4">
          <Button onClick={onExit} size="sm" variant="ghost">
            <ArrowLeft className="mr-2 size-4" />
            Exit
          </Button>
          <div>
            <h1 className="font-medium">{MOCK_CLIENT.name} - 2025 Renewal</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            Export
            <ChevronDown className="ml-2 size-4" />
          </Button>
          <Button size="sm">Publish</Button>
        </div>
      </header>

      {/* Main content - 3 columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left column - Slides */}
        <aside className="w-48 border-border border-r bg-card p-4">
          <h2 className="mb-3 font-medium text-muted-foreground text-xs uppercase">
            Slides
          </h2>
          <div className="flex flex-col gap-2">
            {MOCK_SLIDES.map((slide, index) => (
              <button
                className={`flex items-center gap-2 rounded-lg border p-2 text-left text-sm transition-colors ${
                  selectedSlideId === slide.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted"
                }
                `}
                key={slide.id}
                onClick={() => setSelectedSlideId(slide.id)}
                type="button"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground text-xs">
                  {index + 1}
                </span>
                <span className="truncate">{slide.title}</span>
              </button>
            ))}
          </div>
          <Button className="mt-4 w-full" size="sm" variant="outline">
            <Plus className="mr-2 size-4" />
            Add Slide
          </Button>
        </aside>

        {/* Center column - Editor */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Slide content */}
          <div className="flex-1 overflow-y-auto p-8">
            <Card className="mx-auto aspect-[16/9] max-w-4xl">
              <CardContent className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                  <h2 className="mb-2 font-semibold font-serif text-3xl">
                    {selectedSlide?.title || "Slide"}
                  </h2>
                  <p className="text-muted-foreground">
                    Slide content preview would appear here
                  </p>
                  {selectedSlide?.type === "cost" && (
                    <div className="mt-8">
                      <MockCostChart />
                    </div>
                  )}
                  {selectedSlide?.type === "summary" && (
                    <div className="mx-auto mt-8 max-w-xl text-left">
                      <MockSummaryContent />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI prompt input */}
          <div className="border-border border-t bg-card p-4">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask AI to edit this slide..."
                  value={aiPrompt}
                />
                <Button disabled={!aiPrompt.trim()} size="icon">
                  <Send className="size-4" />
                </Button>
              </div>
              <p className="mt-2 text-muted-foreground text-xs">
                Examples: "Add a comparison chart" • "Simplify the language" •
                "Include stop-loss terms"
              </p>
            </div>
          </div>
        </main>

        {/* Right column - Insights */}
        <aside className="w-64 border-border border-l bg-card p-4">
          {/* Alerts */}
          <div className="mb-6">
            <h2 className="mb-3 font-medium text-muted-foreground text-xs uppercase">
              Alerts
            </h2>
            <div className="flex flex-col gap-2">
              {MOCK_ALERTS.map((alert) => (
                <div
                  className="rounded-lg border border-border bg-background p-3"
                  key={alert.id}
                >
                  <div className="mb-1 flex items-center gap-2">
                    {alert.type === "warning" ? (
                      <AlertTriangle className="size-4 text-amber-500" />
                    ) : (
                      <Info className="size-4 text-blue-500" />
                    )}
                    <span className="font-medium text-sm">{alert.title}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {alert.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div>
            <h2 className="mb-3 font-medium text-muted-foreground text-xs uppercase">
              Sources
            </h2>
            <div className="flex flex-col gap-1">
              {MOCK_SOURCES.map((source) => (
                <div
                  className="flex items-center gap-2 text-muted-foreground text-sm"
                  key={source}
                >
                  <FileText className="size-3" />
                  <span className="truncate">{source}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Mock chart component
function MockCostChart() {
  return (
    <div className="flex items-end justify-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <div className="h-32 w-16 rounded-t bg-blue-400" />
        <span className="text-sm">2023</span>
        <span className="font-medium">$1.2M</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="h-40 w-16 rounded-t bg-blue-500" />
        <span className="text-sm">2024</span>
        <span className="font-medium">$1.4M</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="h-48 w-16 rounded-t bg-blue-600" />
        <span className="text-sm">2025 (Est)</span>
        <span className="font-medium">$1.6M</span>
      </div>
    </div>
  );
}

// Mock summary content
function MockSummaryContent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge className="bg-green-100 text-green-800">Savings</Badge>
        <span>Potential 8% reduction with plan design changes</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge className="bg-amber-100 text-amber-800">Attention</Badge>
        <span>Large claimant impact on Q3 medical costs</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge className="bg-blue-100 text-blue-800">Trend</Badge>
        <span>12% YoY increase in claims frequency</span>
      </div>
    </div>
  );
}
