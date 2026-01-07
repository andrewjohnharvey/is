"use client";

import { useEffect } from "react";
import { CanvasEditor } from "./_components/canvas-editor";
import { Dashboard } from "./_components/dashboard";
import { PROCESSING_PHASES } from "./_components/mock-data";
import { ProcessingScreen } from "./_components/processing-screen";
import { usePrototypeState } from "./_components/prototype-state";
import { PrototypeWizard } from "./_components/prototype-wizard";

export default function CanvasFlowPage() {
  const prototype = usePrototypeState();
  const { state } = prototype;

  // Processing animation effect
  useEffect(() => {
    if (state.screen !== "processing") return;

    const interval = setInterval(() => {
      const newProgress = state.processingProgress + 2;
      const newPhaseIndex = Math.min(
        Math.floor(newProgress / (100 / PROCESSING_PHASES.length)),
        PROCESSING_PHASES.length - 1
      );

      if (newProgress >= 100) {
        clearInterval(interval);
        // Brief delay before showing editor
        setTimeout(() => {
          prototype.showEditor();
        }, 500);
        return;
      }

      prototype.updateProcessingProgress(newProgress, newPhaseIndex);
    }, 150);

    return () => clearInterval(interval);
  }, [state.screen, state.processingProgress, prototype]);

  // Render appropriate screen
  switch (state.screen) {
    case "dashboard":
      return <Dashboard onStartWizard={prototype.startWizard} />;

    case "wizard":
      return <PrototypeWizard prototype={prototype} />;

    case "processing":
      return (
        <ProcessingScreen
          phaseIndex={state.processingPhaseIndex}
          phases={PROCESSING_PHASES}
          progress={state.processingProgress}
        />
      );

    case "editor":
      return <CanvasEditor onExit={prototype.goToDashboard} />;

    default:
      return <Dashboard onStartWizard={prototype.startWizard} />;
  }
}
