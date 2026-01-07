/**
 * Canvas type definitions and utilities.
 */

export const CANVAS_TYPES = [
  { value: "general", label: "General" },
  { value: "pre_renewal", label: "Pre-Renewal Meeting" },
  { value: "renewal", label: "Renewal Meeting" },
  { value: "post_renewal", label: "Post-Renewal" },
  { value: "workforce_investment", label: "Workforce Investment" },
  { value: "benchmarking", label: "Benchmarking" },
  { value: "strategic_roadmap", label: "Strategic Roadmap" },
] as const;

export type CanvasType = (typeof CANVAS_TYPES)[number]["value"];

/**
 * Get the label for a canvas type value.
 */
export function getCanvasTypeLabel(type: CanvasType): string {
  const found = CANVAS_TYPES.find((t) => t.value === type);
  return found?.label ?? type;
}

/**
 * Check if a value is a valid canvas type.
 */
export function isValidCanvasType(value: string): value is CanvasType {
  return CANVAS_TYPES.some((t) => t.value === value);
}
