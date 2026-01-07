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

// Wizard steps - just 2 interactive steps
export type WizardStepId = "upload-documents" | "set-context";

// Audience options (single select)
export type AudienceType =
  | "c-suite"
  | "hr-leadership"
  | "finance-team"
  | "benefits-committee";

export const AUDIENCE_OPTIONS: {
  id: AudienceType;
  label: string;
  description: string;
}[] = [
  { id: "c-suite", label: "C-Suite Executives", description: "CEO, CFO, COO" },
  {
    id: "hr-leadership",
    label: "HR Leadership",
    description: "CHRO, Benefits Manager",
  },
  {
    id: "finance-team",
    label: "Finance Team",
    description: "Financial analysis focus",
  },
  {
    id: "benefits-committee",
    label: "Benefits Committee",
    description: "Cross-functional group",
  },
];

// Priority options (multi-select, max 3)
export type PriorityType =
  | "cost-management"
  | "coverage-quality"
  | "employee-experience"
  | "talent-competitiveness"
  | "cost-predictability"
  | "data-transparency";

export const PRIORITY_OPTIONS: {
  id: PriorityType;
  label: string;
  description: string;
}[] = [
  {
    id: "cost-management",
    label: "Cost Management",
    description: "Minimize premium increases",
  },
  {
    id: "coverage-quality",
    label: "Coverage Quality",
    description: "Maintain rich benefits",
  },
  {
    id: "employee-experience",
    label: "Employee Experience",
    description: "Member satisfaction",
  },
  {
    id: "talent-competitiveness",
    label: "Talent Competitiveness",
    description: "Market positioning",
  },
  {
    id: "cost-predictability",
    label: "Cost Predictability",
    description: "Stable multi-year costs",
  },
  {
    id: "data-transparency",
    label: "Data Transparency",
    description: "Better insights and control",
  },
];

// Relevance sections for document tags
export const RELEVANCE_SECTIONS = [
  { id: "claims-analysis", label: "Claims Analysis Full" },
  { id: "plan-design", label: "Plan Design Full" },
  { id: "market-context", label: "Market Context Full" },
];

// Uploaded document type for new flow
export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  detectedType: string;
  relevantSections: string[];
}

// Context state for Set Context step
export interface ContextState {
  clientName: string;
  renewalPeriod: string;
  audience: AudienceType | null;
  priorities: PriorityType[];
  presentationDepth: number;
}

// Mock uploaded documents for simulation
export const MOCK_UPLOADED_DOCUMENTS: UploadedDocument[] = [
  {
    id: "doc-1",
    name: "Final Premio Salaried Guide.pdf",
    type: "application/pdf",
    size: 1_250_000,
    detectedType: "Unknown Document",
    relevantSections: [
      "Claims Analysis Full",
      "Plan Design Full",
      "Market Context Full",
    ],
  },
  {
    id: "doc-2",
    name: "Final Premio Hourly Guide.pdf",
    type: "application/pdf",
    size: 980_000,
    detectedType: "Unknown Document",
    relevantSections: [
      "Claims Analysis Full",
      "Plan Design Full",
      "Market Context Full",
    ],
  },
  {
    id: "doc-3",
    name: "Stop Loss and Leveraged Trend 1.pdf",
    type: "application/pdf",
    size: 2_100_000,
    detectedType: "Renewal Proposal",
    relevantSections: [
      "Plan Design Summary",
      "Plan Design Full",
      "Market Context Summary",
    ],
  },
];
