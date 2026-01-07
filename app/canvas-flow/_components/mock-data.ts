// Mock client (pre-selected context)
export const MOCK_CLIENT = {
  id: "acme-corp",
  name: "Acme Corporation",
  industry: "Technology",
  location: "San Francisco, CA",
  employeeCount: 250,
  renewalDate: new Date("2025-01-01"),
};

// Mock document type
export interface MockDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  isAutoDetected: boolean;
  detectedType?: string;
}

// Mock documents for "auto-upload" simulation
export const MOCK_DOCUMENTS: Record<string, MockDocument[]> = {
  currentPlans: [
    {
      id: "doc-1",
      name: "SPD_Medical_2024.pdf",
      type: "application/pdf",
      size: 1_250_000,
      isAutoDetected: true,
      detectedType: "SPD",
    },
    {
      id: "doc-2",
      name: "Benefit_Grid.xlsx",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: 85_000,
      isAutoDetected: true,
      detectedType: "Benefit Summary",
    },
  ],
  financial: [
    {
      id: "doc-3",
      name: "Claims_Experience_2024.pdf",
      type: "application/pdf",
      size: 2_100_000,
      isAutoDetected: true,
      detectedType: "Claims Report",
    },
    {
      id: "doc-4",
      name: "Premium_Rates.xlsx",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: 120_000,
      isAutoDetected: true,
      detectedType: "Premium Rates",
    },
  ],
  renewal: [
    {
      id: "doc-5",
      name: "Carrier_Renewal_2025.pdf",
      type: "application/pdf",
      size: 980_000,
      isAutoDetected: true,
      detectedType: "Renewal Proposal",
    },
  ],
  census: [
    {
      id: "doc-6",
      name: "Employee_Census_Q4.xlsx",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: 450_000,
      isAutoDetected: true,
      detectedType: "Census Data",
    },
  ],
};

// Canvas types
export type CanvasType =
  | "renewal"
  | "pre-renewal"
  | "benchmarking"
  | "cost-analysis";

export const CANVAS_TYPE_OPTIONS: {
  value: CanvasType;
  label: string;
  description: string;
}[] = [
  {
    value: "renewal",
    label: "Renewal",
    description: "Full renewal analysis with cost comparison",
  },
  {
    value: "pre-renewal",
    label: "Pre-Renewal",
    description: "Early-stage assessment before proposals",
  },
  {
    value: "benchmarking",
    label: "Benchmarking",
    description: "Compare against industry and market data",
  },
  {
    value: "cost-analysis",
    label: "Cost Analysis",
    description: "Deep dive into claims trends and cost drivers",
  },
];

// Canvas status type
export type CanvasStatus = "published" | "draft" | "processing" | "failed";

// Mock existing canvases for dashboard
export interface MockCanvas {
  id: string;
  title: string;
  type: string;
  effectiveDate: string;
  docCount: number;
  lastUpdated: string;
  status: CanvasStatus;
  progress?: number;
}

export const MOCK_CANVASES: MockCanvas[] = [
  {
    id: "canvas-1",
    title: "2025 Benefits Renewal",
    type: "Renewal Presentation",
    effectiveDate: "Jan 1, 2025",
    docCount: 4,
    lastUpdated: "Updated 2 hours ago",
    status: "published",
  },
  {
    id: "canvas-2",
    title: "Q1 2025 Analysis",
    type: "Pre-Renewal Analysis",
    effectiveDate: "Mar 1, 2025",
    docCount: 2,
    lastUpdated: "Updated yesterday",
    status: "draft",
  },
  {
    id: "canvas-3",
    title: "Annual Benefits Review",
    type: "Benchmarking Report",
    effectiveDate: "Feb 15, 2025",
    docCount: 6,
    lastUpdated: "Started 5 min ago",
    status: "processing",
    progress: 60,
  },
];

// Processing phases
export const PROCESSING_PHASES = [
  {
    id: "reading",
    label: "Reading your documents",
    tip: "Extracting text and data from uploads",
  },
  {
    id: "understanding",
    label: "Understanding plan designs",
    tip: "Identifying coverage details and structures",
  },
  {
    id: "analyzing",
    label: "Analyzing claims trends",
    tip: "Finding patterns and cost drivers",
  },
  {
    id: "calculating",
    label: "Calculating cost impacts",
    tip: "Projecting costs and savings",
  },
  {
    id: "building",
    label: "Building presentation",
    tip: "Creating slides and visualizations",
  },
  {
    id: "compliance",
    label: "Running compliance checks",
    tip: "Checking for ACA and regulatory issues",
  },
];

// Mock slides for canvas editor
export interface MockSlide {
  id: string;
  title: string;
  type: string;
}

export const MOCK_SLIDES: MockSlide[] = [
  { id: "slide-1", title: "Cover", type: "cover" },
  { id: "slide-2", title: "Executive Summary", type: "summary" },
  { id: "slide-3", title: "Cost Overview", type: "cost" },
  { id: "slide-4", title: "Medical Analysis", type: "analysis" },
  { id: "slide-5", title: "Dental & Vision", type: "analysis" },
  { id: "slide-6", title: "Claims Trends", type: "trends" },
  { id: "slide-7", title: "Benchmarking", type: "benchmark" },
  { id: "slide-8", title: "Recommendations", type: "recommendations" },
];

// Mock insights/alerts for canvas editor
export const MOCK_ALERTS = [
  {
    id: "alert-1",
    type: "warning",
    title: "ACA Affordability",
    description: "Threshold at 9.8% (limit: 9.12%)",
  },
  {
    id: "alert-2",
    type: "info",
    title: "Large Claimant Impact",
    description: "Q3 large claimant skewed medical costs by 12%",
  },
];

// Mock source documents for canvas editor
export const MOCK_SOURCES = [
  "Claims_Experience_2024.pdf",
  "Employee_Census_Q4.xlsx",
  "Carrier_Renewal_2025.pdf",
  "SPD_Medical_2024.pdf",
];

// Wizard steps configuration
export type WizardStepId =
  | "welcome"
  | "current-plans"
  | "financial"
  | "renewal"
  | "census"
  | "review";

export interface WizardStepConfig {
  id: WizardStepId;
  label: string;
  stepNumber: number;
  isOptional?: boolean;
}

export const WIZARD_STEPS: WizardStepConfig[] = [
  { id: "welcome", label: "Get Started", stepNumber: 1 },
  { id: "current-plans", label: "Current Plans", stepNumber: 2 },
  { id: "financial", label: "Financial Data", stepNumber: 3 },
  { id: "renewal", label: "Renewal Package", stepNumber: 4, isOptional: true },
  { id: "census", label: "Census Data", stepNumber: 5 },
  { id: "review", label: "Review", stepNumber: 6 },
];

// Step content configuration
export const STEP_CONTENT: Record<
  WizardStepId,
  {
    title: string;
    description: string;
    hint?: { title: string; items: string[] };
    recommendation?: { type: string; description: string };
  }
> = {
  welcome: {
    title: "Let's Create Your Canvas",
    description:
      "We'll guide you through a few simple steps to build a professional benefits presentation.",
  },
  "current-plans": {
    title: "Current Plan Documents",
    description:
      "Upload SPDs, benefit summaries, or comparison grids for current coverage",
    hint: {
      title: "TIP: Include all plan types",
      items: ["Medical", "Dental", "Vision", "Life", "Disability"],
    },
  },
  financial: {
    title: "Financial Data",
    description:
      "Upload claims experience, premium rates, and stop-loss information",
    hint: {
      title: "TIP",
      items: ["12-24 months of data provides the most accurate trend analysis"],
    },
    recommendation: {
      type: "Large Claimant Report",
      description: "Upload for more accurate trend analysis",
    },
  },
  renewal: {
    title: "Renewal Package",
    description:
      "Upload the carrier's renewal proposal, rate justification, or plan options",
    hint: {
      title: "TIP",
      items: [
        "Don't have the renewal yet? Skip this step and we'll create a pre-renewal analysis instead.",
      ],
    },
  },
  census: {
    title: "Census Data",
    description:
      "Upload employee census with enrollment information and demographics",
    hint: {
      title: "TIP: Best census files include",
      items: ["Age", "Gender", "Coverage tier", "Salary", "Plan elections"],
    },
  },
  review: {
    title: "Review Your Canvas",
    description:
      "Confirm everything looks correct before we generate your presentation",
  },
};
