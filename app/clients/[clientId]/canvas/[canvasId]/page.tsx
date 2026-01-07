"use client";

import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  Download,
  Edit,
  FileText,
  LogOut,
  MessageSquare,
  Plus,
  Table,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Mock slide data matching the design
const slides = [
  { id: 1, title: "Cover" },
  { id: 2, title: "Exec Summary" },
  { id: 3, title: "Cost Overview" },
  { id: 4, title: "Medical" },
  { id: 5, title: "Dental/Vision" },
  { id: 6, title: "Claims Trend" },
  { id: 7, title: "Benchmarking" },
  { id: 8, title: "Options" },
  { id: 9, title: "Recommend." },
  { id: 10, title: "Next Steps" },
];

// Mock canvas data
const canvasData = {
  name: "Acme Corporation - 2025 Renewal",
  status: "draft" as const,
};

// Mock alerts
const alerts = [
  {
    id: 1,
    title: "ACA Affordability threshold near limit",
    type: "warning" as const,
  },
  {
    id: 2,
    title: "Large claimant data incomplete",
    type: "info" as const,
  },
];

// Mock sources
const sources = [
  { id: 1, name: "Claims_2024.pdf" },
  { id: 2, name: "Renewal_2025.pdf" },
  { id: 3, name: "Census_Q4.xlsx" },
];

// Mock slide content
const slideContent = {
  1: {
    title: "Cover",
    content: (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <h2 className="font-serif text-4xl">Acme Corporation</h2>
        <p className="text-muted-foreground text-xl">
          2025 Benefits Renewal Presentation
        </p>
        <p className="text-muted-foreground">Prepared January 2025</p>
      </div>
    ),
  },
  2: {
    title: "Executive Summary",
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">Total Annual Cost</p>
              <p className="font-semibold text-2xl">$2.4M</p>
              <p className="text-green-500 text-sm">↑ 5.2% vs prior</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">Renewal Increase</p>
              <p className="font-semibold text-2xl">8.5%</p>
              <p className="text-sm text-yellow-500">Above benchmark</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">Employees Covered</p>
              <p className="font-semibold text-2xl">250</p>
              <p className="text-muted-foreground text-sm">+12 from prior</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Key Findings</h3>
          <ul className="list-inside list-disc space-y-1 text-muted-foreground">
            <li>Claims experience trending 7% above expected</li>
            <li>Large claimant activity impacting medical trend</li>
            <li>Prescription drug costs driving 40% of increase</li>
            <li>Opportunity to reduce costs through plan design changes</li>
          </ul>
        </div>
      </div>
    ),
  },
  3: {
    title: "Cost Overview",
    content: (
      <div className="space-y-6">
        <div className="h-64 rounded-lg border bg-muted/30 p-4">
          <p className="mb-4 text-muted-foreground text-sm">
            Annual Cost Trend (2020-2025)
          </p>
          <div className="flex h-48 items-end justify-around gap-4">
            {[
              { year: 2020, value: 1.8 },
              { year: 2021, value: 1.95 },
              { year: 2022, value: 2.1 },
              { year: 2023, value: 2.15 },
              { year: 2024, value: 2.28 },
              { year: 2025, value: 2.4 },
            ].map((item) => (
              <div className="flex flex-col items-center gap-2" key={item.year}>
                <div
                  className="w-12 rounded-t bg-primary"
                  style={{ height: `${(item.value / 2.5) * 100}%` }}
                />
                <span className="text-muted-foreground text-xs">
                  {item.year}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="font-medium">Cost per Employee</p>
              <p className="font-semibold text-xl">$9,600/year</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="font-medium">Employer Contribution</p>
              <p className="font-semibold text-xl">75%</p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
};

export default function CanvasEditorPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const _canvasId = params.canvasId as string; // Reserved for future backend integration

  const [selectedSlideId, setSelectedSlideId] = useState(1);

  const currentSlide = slideContent[
    selectedSlideId as keyof typeof slideContent
  ] || {
    title: slides.find((s) => s.id === selectedSlideId)?.title || "Slide",
    content: (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-muted-foreground">
        <FileText className="size-12" />
        <p>Slide content preview</p>
      </div>
    ),
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild size="sm" variant="ghost">
            <Link href={`/clients/${clientId}/canvas`}>
              <LogOut className="size-4" />
              Exit
            </Link>
          </Button>
          <div>
            <h1 className="font-semibold text-lg">{canvasData.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Download className="size-4" />
                Export
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export as PowerPoint</DropdownMenuItem>
              <DropdownMenuItem>Export as Word</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm">Publish</Button>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="flex gap-4">
        {/* Left Column: Slides */}
        <div className="w-48 shrink-0">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="font-medium text-sm">Slides</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="flex flex-col gap-1">
                {slides.map((slide) => (
                  <button
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                      selectedSlideId === slide.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                    key={slide.id}
                    onClick={() => setSelectedSlideId(slide.id)}
                    type="button"
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded font-medium text-xs",
                        selectedSlideId === slide.id
                          ? "bg-primary-foreground/20"
                          : "bg-muted-foreground/20"
                      )}
                    >
                      {slide.id}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {slide.title}
                    </span>
                  </button>
                ))}
              </nav>
              <Button className="mt-3 w-full" size="sm" variant="ghost">
                <Plus className="size-4" />
                Add Slide
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Center Column: Canvas Editor */}
        <div className="min-w-0 flex-1">
          <Card>
            <CardHeader>
              <CardTitle>{currentSlide.title}</CardTitle>
              <CardDescription>
                Slide {selectedSlideId} of {slides.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Slide Content */}
              <div className="min-h-[400px] rounded-lg border bg-background p-6">
                {currentSlide.content}
              </div>

              {/* Toolbar */}
              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Edit className="size-4" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <BarChart3 className="size-4" />
                  Chart
                </Button>
                <Button size="sm" variant="outline">
                  <Table className="size-4" />
                  Table
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="size-4" />
                  Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Insights */}
        <div className="w-56 shrink-0">
          {/* Alerts */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-medium text-sm">
                <AlertTriangle className="size-4 text-yellow-500" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    className="rounded-md border border-yellow-500/20 bg-yellow-500/5 p-2 text-xs"
                    key={alert.id}
                  >
                    {alert.title}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sources */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-medium text-sm">
                <FileText className="size-4 text-muted-foreground" />
                Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sources.map((source) => (
                  <div
                    className="flex items-center gap-2 text-muted-foreground text-sm"
                    key={source.id}
                  >
                    <FileText className="size-3.5 shrink-0" />
                    <span className="truncate">{source.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
