"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  FileText,
  Info,
  Plus,
  Send,
  TrendingDown,
  TrendingUp,
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
            <Card className="mx-auto aspect-[16/9] max-w-4xl overflow-hidden">
              <CardContent className="flex h-full flex-col p-0">
                <SlideContent
                  slideTitle={selectedSlide?.title}
                  slideType={selectedSlide?.type}
                />
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
                      <AlertTriangle className="size-4 text-orange-dark" />
                    ) : (
                      <Info className="size-4 text-blue-dark" />
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

type SlideContentProps = {
  slideType?: string;
  slideTitle?: string;
};

function SlideContent({ slideType, slideTitle }: SlideContentProps) {
  switch (slideType) {
    case "cover":
      return <CoverSlide />;
    case "summary":
      return <SummarySlide />;
    case "cost":
      return <CostSlide />;
    case "analysis":
      return <AnalysisSlide title={slideTitle} />;
    case "trends":
      return <TrendsSlide />;
    case "benchmark":
      return <BenchmarkSlide />;
    case "recommendations":
      return <RecommendationsSlide />;
    default:
      return <CoverSlide />;
  }
}

function CoverSlide() {
  return (
    <div className="flex h-full flex-col bg-blue-dark text-neutral-off-white">
      <div className="flex flex-1 flex-col justify-center px-12">
        <p className="mb-4 font-medium text-blue-lightest text-sm uppercase tracking-widest">
          2025 Benefits Renewal
        </p>
        <h1 className="mb-6 font-semibold font-serif text-5xl leading-tight">
          Acme Corporation
        </h1>
        <p className="max-w-md text-lg text-neutral-warm-white/80">
          Strategic benefits analysis and renewal recommendations for the
          upcoming plan year
        </p>
      </div>
      <div className="flex items-center justify-between border-neutral-off-white/10 border-t px-12 py-6">
        <div>
          <p className="text-neutral-warm-white/60 text-sm">Prepared by</p>
          <p className="font-medium">Island Benefits Consulting</p>
        </div>
        <div className="text-right">
          <p className="text-neutral-warm-white/60 text-sm">Effective Date</p>
          <p className="font-medium">January 1, 2025</p>
        </div>
      </div>
    </div>
  );
}

function SummarySlide() {
  return (
    <div className="flex h-full flex-col bg-neutral-off-white p-8">
      <h2 className="mb-6 font-semibold font-serif text-2xl text-blue-dark">
        Executive Summary
      </h2>
      <div className="grid flex-1 grid-cols-3 gap-6">
        <div className="rounded-xl bg-green-dark/10 p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingDown className="size-5 text-green-dark" />
            <span className="font-semibold text-green-dark text-sm uppercase">
              Opportunity
            </span>
          </div>
          <p className="mb-2 font-semibold font-serif text-3xl text-green-dark">
            $127K
          </p>
          <p className="text-neutral-muted text-sm">
            Potential savings through plan design optimization and vendor
            negotiations
          </p>
        </div>
        <div className="rounded-xl bg-orange-lightest/20 p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="size-5 text-orange-dark" />
            <span className="font-semibold text-orange-dark text-sm uppercase">
              Attention
            </span>
          </div>
          <p className="mb-2 font-semibold font-serif text-3xl text-orange-dark">
            +8.2%
          </p>
          <p className="text-neutral-muted text-sm">
            Medical trend driven by large claimant activity in Q3 2024
          </p>
        </div>
        <div className="rounded-xl bg-blue-dark/10 p-5">
          <div className="mb-3 flex items-center gap-2">
            <ArrowRight className="size-5 text-blue-dark" />
            <span className="font-semibold text-blue-dark text-sm uppercase">
              Action
            </span>
          </div>
          <p className="mb-2 font-semibold font-serif text-3xl text-blue-dark">
            3 Items
          </p>
          <p className="text-neutral-muted text-sm">
            Key decisions needed before December 15th renewal deadline
          </p>
        </div>
      </div>
      <div className="mt-6 rounded-lg bg-neutral-warm-white p-4">
        <p className="text-neutral-muted text-sm">
          <span className="font-semibold text-foreground">Bottom line:</span>{" "}
          Despite elevated claims, strategic adjustments can deliver a 4-6%
          reduction from initial renewal rates while maintaining competitive
          benefits positioning.
        </p>
      </div>
    </div>
  );
}

function CostSlide() {
  return (
    <div className="flex h-full flex-col bg-neutral-off-white p-8">
      <h2 className="mb-2 font-semibold font-serif text-2xl text-blue-dark">
        Total Cost Overview
      </h2>
      <p className="mb-6 text-neutral-muted text-sm">
        Annual benefits spend across all coverage lines
      </p>

      <div className="flex flex-1 items-end justify-center gap-8 pb-4">
        {/* 2023 */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3 w-20">
            <div className="h-28 rounded-t-lg bg-blue-medium" />
          </div>
          <p className="font-semibold text-foreground">$1.24M</p>
          <p className="text-neutral-muted text-sm">2023</p>
        </div>
        {/* 2024 */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3 w-20">
            <div className="h-36 rounded-t-lg bg-blue-dark" />
            <div className="-top-6 -translate-x-1/2 absolute left-1/2 whitespace-nowrap rounded-full bg-orange-lightest px-2 py-0.5 font-semibold text-white text-xs">
              +9.7%
            </div>
          </div>
          <p className="font-semibold text-foreground">$1.36M</p>
          <p className="text-neutral-muted text-sm">2024</p>
        </div>
        {/* 2025 Initial */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3 w-20">
            <div className="h-44 rounded-t-lg bg-orange-lightest" />
            <div className="-top-6 -translate-x-1/2 absolute left-1/2 whitespace-nowrap rounded-full bg-orange-dark px-2 py-0.5 font-semibold text-white text-xs">
              +10.3%
            </div>
          </div>
          <p className="font-semibold text-foreground">$1.50M</p>
          <p className="text-neutral-muted text-sm">2025 Initial</p>
        </div>
        {/* 2025 Negotiated */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3 w-20">
            <div className="h-40 rounded-t-lg bg-green-dark" />
            <div className="-top-6 -translate-x-1/2 absolute left-1/2 whitespace-nowrap rounded-full bg-green-dark px-2 py-0.5 font-semibold text-white text-xs">
              +6.6%
            </div>
          </div>
          <p className="font-semibold text-foreground">$1.45M</p>
          <p className="text-neutral-muted text-sm">2025 Target</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-green-dark/10 p-3">
        <TrendingDown className="size-4 text-green-dark" />
        <p className="font-medium text-green-dark text-sm">
          $50,000 annual savings vs. initial renewal through negotiations
        </p>
      </div>
    </div>
  );
}

function AnalysisSlide({ title }: { title?: string }) {
  const isMedical = title?.includes("Medical");

  return (
    <div className="flex h-full flex-col bg-neutral-off-white p-8">
      <h2 className="mb-2 font-semibold font-serif text-2xl text-blue-dark">
        {title || "Plan Analysis"}
      </h2>
      <p className="mb-6 text-neutral-muted text-sm">
        {isMedical
          ? "Medical plan performance and renewal details"
          : "Ancillary benefits overview"}
      </p>

      <div className="grid flex-1 grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="mb-1 text-neutral-muted text-xs uppercase">
              Current Premium
            </p>
            <p className="font-semibold font-serif text-2xl text-foreground">
              {isMedical ? "$892,400" : "$124,800"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="mb-1 text-neutral-muted text-xs uppercase">
              Renewal Rate
            </p>
            <div className="flex items-center gap-2">
              <p className="font-semibold font-serif text-2xl text-foreground">
                {isMedical ? "+9.8%" : "+4.2%"}
              </p>
              <Badge variant={isMedical ? "orange" : "green"}>
                {isMedical ? "Above target" : "On target"}
              </Badge>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="mb-1 text-neutral-muted text-xs uppercase">
              Loss Ratio
            </p>
            <p className="font-semibold font-serif text-2xl text-foreground">
              {isMedical ? "94.2%" : "68.5%"}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-4">
          <p className="mb-3 font-semibold text-foreground text-sm">
            Key Drivers
          </p>
          <div className="space-y-3">
            {isMedical ? (
              <>
                <div className="flex items-start gap-2">
                  <ArrowUp className="mt-0.5 size-4 text-orange-dark" />
                  <div>
                    <p className="font-medium text-sm">Large Claimant</p>
                    <p className="text-neutral-muted text-xs">
                      $312K oncology case in Q3
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowUp className="mt-0.5 size-4 text-orange-dark" />
                  <div>
                    <p className="font-medium text-sm">Specialty Rx</p>
                    <p className="text-neutral-muted text-xs">
                      23% increase in GLP-1 utilization
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="mt-0.5 size-4 text-blue-dark" />
                  <div>
                    <p className="font-medium text-sm">Network Utilization</p>
                    <p className="text-neutral-muted text-xs">
                      92% in-network, above benchmark
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2">
                  <TrendingDown className="mt-0.5 size-4 text-green-dark" />
                  <div>
                    <p className="font-medium text-sm">Stable Claims</p>
                    <p className="text-neutral-muted text-xs">
                      Utilization within expected range
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="mt-0.5 size-4 text-blue-dark" />
                  <div>
                    <p className="font-medium text-sm">Preventive Focus</p>
                    <p className="text-neutral-muted text-xs">
                      85% exam completion rate
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendsSlide() {
  return (
    <div className="flex h-full flex-col bg-neutral-off-white p-8">
      <h2 className="mb-2 font-semibold font-serif text-2xl text-blue-dark">
        Claims Trends
      </h2>
      <p className="mb-6 text-neutral-muted text-sm">
        12-month rolling analysis of claims patterns
      </p>

      <div className="flex flex-1 items-center justify-center">
        {/* Simple line chart representation */}
        <div className="relative h-40 w-full max-w-2xl">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div className="border-neutral-warm-white border-b" key={i} />
            ))}
          </div>
          {/* Trend line (SVG) */}
          <svg
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 400 160"
          >
            <path
              d="M 0 120 L 33 115 L 66 110 L 100 105 L 133 100 L 166 95 L 200 85 L 233 60 L 266 70 L 300 75 L 333 80 L 366 85 L 400 90"
              fill="none"
              stroke="#00344f"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
            {/* Large claimant marker */}
            <circle cx="233" cy="60" fill="#fe7b15" r="8" />
          </svg>
          {/* Labels */}
          <div className="-bottom-6 absolute right-0 left-0 flex justify-between text-neutral-muted text-xs">
            <span>Jan</span>
            <span>Mar</span>
            <span>May</span>
            <span>Jul</span>
            <span>Sep</span>
            <span>Nov</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-white p-3 text-center">
          <p className="font-semibold font-serif text-blue-dark text-xl">
            $112K
          </p>
          <p className="text-neutral-muted text-xs">Avg Monthly Claims</p>
        </div>
        <div className="rounded-lg bg-orange-lightest/20 p-3 text-center">
          <p className="font-semibold font-serif text-orange-dark text-xl">
            $312K
          </p>
          <p className="text-neutral-muted text-xs">
            Peak (Sep - Large Claimant)
          </p>
        </div>
        <div className="rounded-lg bg-white p-3 text-center">
          <p className="font-semibold font-serif text-blue-dark text-xl">
            +12%
          </p>
          <p className="text-neutral-muted text-xs">YoY Trend</p>
        </div>
      </div>
    </div>
  );
}

function BenchmarkSlide() {
  return (
    <div className="flex h-full flex-col bg-neutral-off-white p-8">
      <h2 className="mb-2 font-semibold font-serif text-2xl text-blue-dark">
        Market Benchmarking
      </h2>
      <p className="mb-6 text-neutral-muted text-sm">
        Comparison against technology sector peers (200-500 employees)
      </p>

      <div className="flex-1 space-y-4">
        {/* Benchmark bars */}
        {[
          {
            label: "Employee Contribution",
            yours: 22,
            market: 28,
            better: true,
          },
          {
            label: "Deductible (Single)",
            yours: 1500,
            market: 2000,
            better: true,
            isDollar: true,
          },
          {
            label: "Total Cost per Employee",
            yours: 14_200,
            market: 13_800,
            better: false,
            isDollar: true,
          },
          {
            label: "Rx Generic Fill Rate",
            yours: 89,
            market: 82,
            better: true,
            isPercent: true,
          },
        ].map((item) => (
          <div className="rounded-lg bg-white p-4" key={item.label}>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-medium text-sm">{item.label}</p>
              <Badge variant={item.better ? "green" : "orange"}>
                {item.better ? "Better than market" : "Above market"}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-neutral-muted">Your Plan</span>
                  <span className="font-semibold text-blue-dark">
                    {item.isDollar && "$"}
                    {item.yours.toLocaleString()}
                    {item.isPercent && "%"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-warm-white">
                  <div
                    className="h-full rounded-full bg-blue-dark"
                    style={{
                      width: `${Math.min(100, (item.yours / Math.max(item.yours, item.market)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-neutral-muted">Market Avg</span>
                  <span className="font-semibold text-neutral-muted">
                    {item.isDollar && "$"}
                    {item.market.toLocaleString()}
                    {item.isPercent && "%"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-warm-white">
                  <div
                    className="h-full rounded-full bg-neutral-muted"
                    style={{
                      width: `${Math.min(100, (item.market / Math.max(item.yours, item.market)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationsSlide() {
  return (
    <div className="flex h-full flex-col bg-blue-dark p-8 text-neutral-off-white">
      <h2 className="mb-2 font-semibold font-serif text-2xl">
        Recommendations
      </h2>
      <p className="mb-6 text-neutral-warm-white/70 text-sm">
        Priority actions for the 2025 renewal
      </p>

      <div className="flex-1 space-y-4">
        {[
          {
            priority: 1,
            title: "Accept negotiated medical renewal at +6.6%",
            impact: "Saves $50K vs initial rate",
            deadline: "Dec 15",
          },
          {
            priority: 2,
            title: "Implement pharmacy carve-out with Express Scripts",
            impact: "Projected $35K annual savings",
            deadline: "Jan 1",
          },
          {
            priority: 3,
            title: "Add virtual primary care benefit",
            impact: "Reduce ER visits, improve access",
            deadline: "Q1 2025",
          },
        ].map((rec) => (
          <div
            className="flex gap-4 rounded-lg bg-neutral-off-white/10 p-4"
            key={rec.priority}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-lightest font-semibold text-blue-dark">
              {rec.priority}
            </div>
            <div className="flex-1">
              <p className="mb-1 font-medium">{rec.title}</p>
              <p className="text-neutral-warm-white/70 text-sm">{rec.impact}</p>
            </div>
            <div className="text-right">
              <p className="text-neutral-warm-white/50 text-xs">Deadline</p>
              <p className="font-medium text-blue-lightest">{rec.deadline}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg bg-green-dark/30 p-4">
        <div className="flex items-center gap-3">
          <TrendingDown className="size-5 text-green-lightest" />
          <div>
            <p className="font-semibold text-green-lightest">
              Total Projected Impact
            </p>
            <p className="text-neutral-warm-white/80 text-sm">
              $85,000+ in annual savings while enhancing employee benefits
              experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
