"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Dashboard } from "./_components/dashboard";
import type { CanvasType } from "./_components/mock-data";

// Map UI canvas types to Convex canvas types
function mapCanvasType(
  uiType: CanvasType
): "pre_renewal" | "renewal" | "benchmarking" | "general" {
  switch (uiType) {
    case "pre-renewal":
      return "pre_renewal";
    case "renewal":
      return "renewal";
    case "benchmarking":
      return "benchmarking";
    case "cost-analysis":
      return "general";
    default:
      return "general";
  }
}

export default function CanvasFlowPage() {
  const router = useRouter();
  const [isCreatingCanvas, setIsCreatingCanvas] = useState(false);

  // Convex hooks for canvas creation
  const createDraft = useMutation(api.canvases.createDraft);

  // Get first available client for prototype (in production, this would come from context/URL)
  const clientsResult = useQuery(api.clients.list, {
    paginationOpts: { numItems: 1, cursor: null },
  });
  const clientId = clientsResult?.page[0]?._id;

  // Handler for creating a new canvas and navigating to the wizard
  const handleStartWizard = useCallback(
    async (canvasType: CanvasType) => {
      if (!clientId) {
        console.error("No client available");
        return;
      }

      setIsCreatingCanvas(true);
      try {
        const canvasId = await createDraft({
          clientId,
          name: `${canvasType === "pre-renewal" ? "Pre-Renewal" : canvasType === "renewal" ? "Renewal" : canvasType === "benchmarking" ? "Benchmarking" : "Analysis"} ${new Date().toLocaleDateString()}`,
          canvasType: mapCanvasType(canvasType),
        });

        // Navigate to the first wizard step with the new canvas ID
        router.push(`/canvas-flow/${canvasId}/document-upload`);
      } catch (error) {
        console.error("Failed to create canvas:", error);
      } finally {
        setIsCreatingCanvas(false);
      }
    },
    [clientId, createDraft, router]
  );

  return (
    <Dashboard
      clientId={clientId}
      isCreatingCanvas={isCreatingCanvas}
      onStartWizard={handleStartWizard}
    />
  );
}
