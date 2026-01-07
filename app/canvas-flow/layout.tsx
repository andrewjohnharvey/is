import type { ReactNode } from "react";

export default function CanvasFlowLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Full-screen overlay that covers the TopNav from root layout
  return <div className="fixed inset-0 z-50 bg-background">{children}</div>;
}
