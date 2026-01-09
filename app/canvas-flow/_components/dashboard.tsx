"use client";

import { useQuery } from "convex/react";
import { ArrowLeft, ChevronDown, FileText, Loader2, Plus } from "lucide-react";
import Link from "next/link";
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
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { CANVAS_TYPE_OPTIONS, type CanvasType, MOCK_CLIENT } from "./mock-data";

interface DashboardProps {
  onStartWizard: (canvasType: CanvasType) => void;
  isCreatingCanvas?: boolean;
  clientId?: Id<"clients">;
}

export function Dashboard({
  onStartWizard,
  isCreatingCanvas = false,
  clientId,
}: DashboardProps) {
  // Query real canvases from Convex if we have a clientId
  const canvases = useQuery(
    api.canvases.listByClient,
    clientId ? { clientId } : "skip"
  );

  // Format date for display
  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // Map canvas type to display label
  const getCanvasTypeLabel = (
    canvasType?:
      | "general"
      | "pre_renewal"
      | "renewal"
      | "post_renewal"
      | "workforce_investment"
      | "benchmarking"
      | "strategic_roadmap"
  ) => {
    switch (canvasType) {
      case "pre_renewal":
        return "Pre-Renewal Analysis";
      case "renewal":
        return "Renewal Analysis";
      case "post_renewal":
        return "Post-Renewal Analysis";
      case "benchmarking":
        return "Benchmarking Report";
      case "workforce_investment":
        return "Workforce Investment";
      case "strategic_roadmap":
        return "Strategic Roadmap";
      case "general":
        return "General Analysis";
      default:
        return "Canvas";
    }
  };

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
              <Button disabled={isCreatingCanvas}>
                {isCreatingCanvas ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 size-4" />
                    New Canvas
                    <ChevronDown className="ml-2 size-4" />
                  </>
                )}
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

        {/* Canvas List - Real canvases from Convex */}
        <div className="flex flex-col gap-4">
          {canvases === undefined ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading canvases...
            </div>
          ) : canvases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto mb-4 size-12 text-muted-foreground" />
                <h3 className="mb-2 font-medium">No canvases yet</h3>
                <p className="mb-4 text-muted-foreground text-sm">
                  Create your first canvas to get started with your analysis.
                </p>
              </CardContent>
            </Card>
          ) : (
            canvases.map((canvas) => (
              <Card key={canvas._id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-3">
                        <h3 className="font-medium">{canvas.name}</h3>
                        <StatusBadge status={canvas.status} />
                      </div>
                      <p className="mb-2 text-muted-foreground text-sm">
                        {getCanvasTypeLabel(canvas.canvasType)}
                      </p>
                      <div className="flex items-center gap-4 text-muted-foreground text-xs">
                        <span>Created {formatDate(canvas.createdAt)}</span>
                        <span>Updated {formatDate(canvas.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2">
                    {canvas.status === "draft" ? (
                      <>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/canvas-flow/${canvas._id}`}>
                            Resume
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost">
                          Delete
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/canvas-flow/${canvas._id}/editor`}>
                            View
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/canvas-flow/${canvas._id}/editor`}>
                            Edit
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost">
                          Export
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
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
