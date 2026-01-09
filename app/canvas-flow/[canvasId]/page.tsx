"use client";

import { useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { api } from "../../../convex/_generated/api";
import { useCanvasFlow } from "./_context/canvas-flow-context";

/**
 * Auto-redirect page for /canvas-flow/[canvasId]
 * Determines the correct step based on canvas status and redirects accordingly.
 */
export default function CanvasRedirectPage() {
  const { canvas, canvasId } = useCanvasFlow();

  // Query documents to determine wizard progress
  const documents = useQuery(api.documents.listByCanvas, { canvasId });

  useEffect(() => {
    // Wait for documents query to load
    if (documents === undefined) return;

    // Determine redirect based on canvas status
    if (canvas.status === "published" || canvas.status === "in_review") {
      redirect(`/canvas-flow/${canvasId}/editor`);
    }

    // Draft canvas - determine wizard step based on progress
    if (canvas.status === "draft") {
      // Check if documents have been uploaded
      const hasDocuments = documents && documents.length > 0;

      if (!hasDocuments) {
        // No documents yet - start at document upload
        redirect(`/canvas-flow/${canvasId}/document-upload`);
      }

      // Has documents - could be at set-context or review-plan
      // For now, default to document-upload for simplicity
      // In a full implementation, you'd check context/plan status in Convex
      redirect(`/canvas-flow/${canvasId}/document-upload`);
    }

    // Fallback to document upload
    redirect(`/canvas-flow/${canvasId}/document-upload`);
  }, [canvas.status, canvasId, documents]);

  // Show loading while determining redirect
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
}
