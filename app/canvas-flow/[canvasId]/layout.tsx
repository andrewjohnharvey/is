import type { ReactNode } from "react";
import { CanvasFlowProvider } from "./_context/canvas-flow-context";

interface CanvasLayoutProps {
  children: ReactNode;
  params: Promise<{ canvasId: string }>;
}

export default async function CanvasLayout({
  children,
  params,
}: CanvasLayoutProps) {
  const { canvasId } = await params;

  return (
    <CanvasFlowProvider canvasId={canvasId}>{children}</CanvasFlowProvider>
  );
}
