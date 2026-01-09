"use client";

import { useEffect, useState } from "react";
import { PROCESSING_PHASES } from "../../_components/mock-data";
import { ProcessingScreen } from "../../_components/processing-screen";
import { useCanvasFlowNavigation } from "../../_hooks/use-canvas-flow-navigation";

export default function ProcessingPage() {
  const { showEditor } = useCanvasFlowNavigation();
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);

  // Processing animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2;

        // Update phase index
        const newPhaseIndex = Math.min(
          Math.floor(newProgress / (100 / PROCESSING_PHASES.length)),
          PROCESSING_PHASES.length - 1
        );
        setPhaseIndex(newPhaseIndex);

        if (newProgress >= 100) {
          clearInterval(interval);
          // Brief delay before showing editor
          setTimeout(() => {
            showEditor();
          }, 500);
          return 100;
        }

        return newProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [showEditor]);

  return (
    <ProcessingScreen
      phaseIndex={phaseIndex}
      phases={PROCESSING_PHASES}
      progress={progress}
    />
  );
}
