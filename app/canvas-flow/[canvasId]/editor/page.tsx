"use client";

import { CanvasEditor } from "../../_components/canvas-editor";
import { useCanvasFlowNavigation } from "../../_hooks/use-canvas-flow-navigation";

export default function EditorPage() {
  const { goToDashboard } = useCanvasFlowNavigation();

  return <CanvasEditor onExit={goToDashboard} />;
}
