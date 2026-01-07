"use client";

import { ArrowLeft, ChevronDown, FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  CANVAS_TYPE_OPTIONS,
  type CanvasType,
  MOCK_CANVASES,
  MOCK_CLIENT,
} from "./mock-data";

interface DashboardProps {
  onStartWizard: (canvasType: CanvasType) => void;
}

export function Dashboard({ onStartWizard }: DashboardProps) {
  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="border-border border-b bg-card px-6 py-4">
        <button
          className="mb-4 flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
          type="button"
        >
          <ArrowLeft className="size-4" />
          Back to Client
        </button>
        <h1 className="font-semibold font-serif text-2xl">
          {MOCK_CLIENT.name}
        </h1>
        <p className="text-muted-foreground text-sm">
          {MOCK_CLIENT.industry} - {MOCK_CLIENT.location} -{" "}
          {MOCK_CLIENT.employeeCount} employees
        </p>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Title + Actions */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold font-serif text-xl">Canvases</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                New Canvas
                <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {CANVAS_TYPE_OPTIONS.map((option) => (
                <DropdownMenuItem
                  className="flex flex-col items-start py-2"
                  key={option.value}
                  onClick={() => onStartWizard(option.value)}
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="text-muted-foreground text-xs">
                    {option.description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input className="max-w-sm" placeholder="Search canvases..." />
        </div>

        {/* Canvas List */}
        <div className="flex flex-col gap-4">
          {MOCK_CANVASES.map((canvas) => (
            <Card key={canvas.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-3">
                      <h3 className="font-medium">{canvas.title}</h3>
                      <StatusBadge status={canvas.status} />
                    </div>
                    <p className="mb-2 text-muted-foreground text-sm">
                      {canvas.type}
                    </p>
                    <div className="flex items-center gap-4 text-muted-foreground text-xs">
                      <span>{canvas.effectiveDate}</span>
                      <span className="flex items-center gap-1">
                        <FileText className="size-3" />
                        {canvas.docCount} docs
                      </span>
                      <span>{canvas.lastUpdated}</span>
                    </div>
                  </div>
                </div>

                {/* Processing progress */}
                {canvas.status === "processing" &&
                  canvas.progress !== undefined && (
                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Building presentation...
                        </span>
                        <span className="font-medium">{canvas.progress}%</span>
                      </div>
                      <Progress className="h-2" value={canvas.progress} />
                    </div>
                  )}

                {/* Actions */}
                {canvas.status !== "processing" && (
                  <div className="mt-4 flex items-center gap-2">
                    {canvas.status === "draft" ? (
                      <>
                        <Button size="sm" variant="outline">
                          Resume
                        </Button>
                        <Button size="sm" variant="ghost">
                          Delete
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        <Button size="sm" variant="ghost">
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost">
                          Export
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "published":
      return (
        <Badge className="bg-green-100 text-green-800" variant="secondary">
          Published
        </Badge>
      );
    case "draft":
      return (
        <Badge className="bg-gray-100 text-gray-800" variant="secondary">
          Draft
        </Badge>
      );
    case "processing":
      return (
        <Badge className="bg-blue-100 text-blue-800" variant="secondary">
          Processing
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-800" variant="secondary">
          Failed
        </Badge>
      );
    default:
      return null;
  }
}
