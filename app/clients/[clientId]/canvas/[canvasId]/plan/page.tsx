"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  FileSearch,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { GenerationStatus } from "@/components/canvas/generation-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function CanvasPlanPage() {
  const params = useParams();
  const router = useRouter();

  const clientId = params.clientId as Id<"clients">;
  const canvasId = params.canvasId as Id<"canvases">;

  const [newSectionDescription, setNewSectionDescription] = useState("");
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Real-time subscriptions
  const status = useQuery(api.canvasGenerationStatus.get, { canvasId });
  const analysis = useQuery(api.documentAnalysisHelpers.get, { canvasId });
  const plan = useQuery(api.canvasPlanHelpers.get, { canvasId });
  const canvas = useQuery(api.canvases.get, { id: canvasId });

  // Actions and mutations
  const planCanvas = useAction(api.canvasPlanning.planCanvas);
  const regeneratePlan = useAction(api.canvasPlanning.regeneratePlan);
  const planSectionOnDemand = useAction(api.canvasPlanning.planSectionOnDemand);
  const removeSection = useMutation(api.canvasPlanHelpers.removeSection);
  const approvePlan = useMutation(api.canvasPlanHelpers.approve);

  // Auto-trigger planning when analysis completes
  useEffect(() => {
    if (
      status?.phase === "analyzing" &&
      status.progress === 100 &&
      !plan &&
      analysis
    ) {
      planCanvas({ canvasId });
    }
  }, [status, plan, analysis, canvasId, planCanvas]);

  const handleAddSection = useCallback(async () => {
    if (!newSectionDescription.trim()) return;

    setIsAddingSection(true);
    try {
      await planSectionOnDemand({
        canvasId,
        description: newSectionDescription,
      });
      setNewSectionDescription("");
    } catch (error) {
      console.error("Failed to add section:", error);
    } finally {
      setIsAddingSection(false);
    }
  }, [canvasId, newSectionDescription, planSectionOnDemand]);

  const handleRemoveSection = useCallback(
    async (sectionId: string) => {
      await removeSection({ canvasId, sectionId });
    },
    [canvasId, removeSection]
  );

  const handleRegenerate = useCallback(async () => {
    await regeneratePlan({
      canvasId,
      consultantGuidance: "Regenerate the plan with fresh analysis",
    });
  }, [canvasId, regeneratePlan]);

  const handleApproveAndGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      await approvePlan({ canvasId });
      // Navigate to the canvas editor
      router.push(`/clients/${clientId}/canvas/${canvasId}`);
    } catch (error) {
      console.error("Failed to approve plan:", error);
      setIsGenerating(false);
    }
  }, [canvasId, clientId, router, approvePlan]);

  // Show analysis/planning progress
  if (
    status?.phase === "analyzing" ||
    (status?.phase === "planning" && status.progress !== 100)
  ) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button asChild size="sm" variant="ghost">
            <Link href={`/clients/${clientId}/canvas/new`}>
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="heading-lg">Preparing Your Canvas</h1>
          <p className="mt-1 text-muted-foreground">
            Analyzing documents and creating your canvas plan...
          </p>
        </div>

        <GenerationStatus canvasId={canvasId} />

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              {status.phase === "analyzing" ? (
                <FileSearch className="size-12 animate-pulse text-blue-500" />
              ) : (
                <Brain className="size-12 animate-pulse text-purple-500" />
              )}
              <p className="text-center text-muted-foreground">
                {status.currentStep || "Processing..."}
              </p>
              {status.progress !== undefined && (
                <Progress className="w-64" value={status.progress} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (status?.phase === "failed") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button asChild size="sm" variant="ghost">
            <Link href={`/clients/${clientId}/canvas/new`}>
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        </div>

        <div>
          <h1 className="heading-lg">Something Went Wrong</h1>
          <p className="mt-1 text-destructive">{status.error}</p>
        </div>

        <Button onClick={handleRegenerate} variant="secondary">
          <RefreshCw className="size-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // Show plan review
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild size="sm" variant="ghost">
          <Link href={`/clients/${clientId}/canvas/new`}>
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="heading-lg">{plan?.canvasTitle || canvas?.name}</h1>
        <p className="mt-1 text-muted-foreground">
          {plan?.canvasPurpose || "Review and customize your canvas plan"}
        </p>
      </div>

      {/* Document Analysis Summary */}
      {analysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSearch className="size-4" />
              Document Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.overallThemes.slice(0, 5).map((theme) => (
                <Badge key={theme.theme} variant="secondary">
                  {theme.theme}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-muted-foreground text-sm">
              {analysis.suggestedCanvasFocus}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Planned Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4" />
            Proposed Sections ({plan?.sections.length || 0})
          </CardTitle>
          <CardDescription>
            Review and modify the AI-generated sections for your canvas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan?.sections.map((section, index) => (
            <div
              className="flex items-start gap-3 rounded-lg border p-4"
              key={section.id}
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-sm">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{section.title}</h4>
                  <Badge
                    className="text-xs"
                    variant={
                      section.confidence >= 80
                        ? "default"
                        : section.confidence >= 60
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {section.confidence}%
                  </Badge>
                </div>
                <p className="mt-1 text-muted-foreground text-sm">
                  {section.purpose}
                </p>
                {section.suggestedContent.visualizations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {section.suggestedContent.visualizations.map((viz, i) => (
                      <Badge className="text-xs" key={i} variant="outline">
                        {viz.type} chart
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <Button
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveSection(section.id)}
                size="icon"
                variant="ghost"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}

          {/* Add Section Input */}
          <div className="flex gap-2 pt-2">
            <Input
              disabled={isAddingSection}
              onChange={(e) => setNewSectionDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddSection();
                }
              }}
              placeholder="Add a section about..."
              value={newSectionDescription}
            />
            <Button
              disabled={!newSectionDescription.trim() || isAddingSection}
              onClick={handleAddSection}
            >
              {isAddingSection ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Ideas */}
      {plan?.additionalSectionIdeas &&
        plan.additionalSectionIdeas.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Additional Ideas</CardTitle>
              <CardDescription>
                Sections that could be added with more data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {plan.additionalSectionIdeas.map((idea, index) => (
                  <div
                    className="flex items-start gap-2 text-muted-foreground text-sm"
                    key={index}
                  >
                    <span className="text-primary">+</span>
                    <div>
                      <span className="font-medium text-foreground">
                        {idea.title}
                      </span>
                      <span> - {idea.description}</span>
                      <span className="mt-0.5 block text-xs">
                        Requires: {idea.wouldRequire}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button onClick={handleRegenerate} variant="outline">
          <RefreshCw className="size-4" />
          Regenerate Plan
        </Button>
        <Button
          disabled={!plan || plan.sections.length === 0 || isGenerating}
          onClick={handleApproveAndGenerate}
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              Generate Canvas
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
