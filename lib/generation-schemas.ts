import { z } from "zod";

// ============================================================================
// DOCUMENT ANALYSIS SCHEMAS
// ============================================================================

/**
 * Data point types discovered in documents
 */
export const DataPointTypeSchema = z.enum([
  "currency",
  "percentage",
  "count",
  "date",
  "text",
  "comparison",
]);

/**
 * Individual data point extracted from a document
 */
export const DataPointSchema = z.object({
  name: z.string().describe("Name of the data point"),
  type: DataPointTypeSchema,
  value: z.any().describe("The actual value (string, number, or object)"),
  context: z
    .string()
    .describe("Context explaining where/how this data appears"),
});

/**
 * Per-document analysis result
 */
export const DocumentAnalysisItemSchema = z.object({
  documentId: z.string().describe("ID of the analyzed document"),
  filename: z.string().describe("Original filename"),
  primaryDomain: z
    .string()
    .describe(
      'Primary domain/category, e.g., "Health Benefits", "401(k) Retirement", "Executive Compensation"'
    ),
  topics: z.array(z.string()).describe("Specific topics found in the document"),
  dataPoints: z
    .array(DataPointSchema)
    .describe("Quantitative and qualitative data points extracted"),
  keyInsights: z
    .array(z.string())
    .describe("Key insights or findings from the document"),
  relatedDocuments: z
    .array(z.string())
    .describe("IDs of documents that relate to this one"),
});

/**
 * Cross-document theme
 */
export const ThemeSchema = z.object({
  theme: z.string().describe("Theme name"),
  relevance: z.number().min(0).max(100).describe("Relevance score from 0-100"),
  supportingDocuments: z
    .array(z.string())
    .describe("Document IDs that support this theme"),
});

/**
 * Complete document understanding result
 */
export const DocumentUnderstandingSchema = z.object({
  documents: z
    .array(DocumentAnalysisItemSchema)
    .describe("Per-document analysis"),
  overallThemes: z
    .array(ThemeSchema)
    .describe("Cross-document themes identified"),
  suggestedCanvasFocus: z
    .string()
    .describe("What the canvas should primarily address"),
});

// ============================================================================
// CANVAS PLANNING SCHEMAS
// ============================================================================

/**
 * Suggested visualization in a section plan
 */
export const VisualizationSuggestionSchema = z.object({
  type: z
    .string()
    .describe('Chart type: "bar", "line", "pie", "table", or "none"'),
  title: z.string().describe("Chart title"),
  dataDescription: z.string().describe("What data should be visualized"),
  rationale: z.string().describe("Why this visualization helps"),
});

/**
 * Suggested callout in a section plan
 */
export const CalloutSuggestionSchema = z.object({
  type: z
    .enum(["insight", "warning", "recommendation", "question"])
    .describe("Type of callout"),
  content: z.string().describe("Callout content"),
});

/**
 * Suggested content for a section
 */
export const SuggestedContentSchema = z.object({
  narrativePoints: z
    .array(z.string())
    .describe("Key narrative points to cover"),
  visualizations: z
    .array(VisualizationSuggestionSchema)
    .describe("Suggested visualizations"),
  callouts: z.array(CalloutSuggestionSchema).describe("Suggested callouts"),
});

/**
 * Individual section in the canvas plan
 */
export const PlannedSectionSchema = z.object({
  id: z.string().describe("Unique identifier for the section"),
  title: z.string().describe("AI-generated section title"),
  purpose: z.string().describe("What this section accomplishes"),
  keyQuestions: z.array(z.string()).describe("Questions this section answers"),
  dataSourceIds: z
    .array(z.string())
    .describe("Document IDs used for this section"),
  suggestedContent: SuggestedContentSchema,
  confidence: z.number().min(0).max(100).describe("Confidence score 0-100"),
  generationPriority: z
    .number()
    .describe("Priority order for generation (1 = first)"),
});

/**
 * Additional section idea that couldn't be fully generated
 */
export const AdditionalSectionIdeaSchema = z.object({
  title: z.string().describe("Suggested section title"),
  description: z.string().describe("What this section would cover"),
  wouldRequire: z
    .string()
    .describe("What additional data/documents would enable this"),
});

/**
 * Complete canvas plan
 */
export const GenerativeCanvasPlanSchema = z.object({
  canvasTitle: z.string().describe("AI-generated canvas title"),
  canvasPurpose: z
    .string()
    .describe("What this canvas helps the client understand"),
  sections: z
    .array(PlannedSectionSchema)
    .describe("Planned sections for the canvas"),
  additionalSectionIdeas: z
    .array(AdditionalSectionIdeaSchema)
    .describe("Additional ideas that couldn't be fully generated"),
});

// ============================================================================
// SECTION GENERATION SCHEMAS
// ============================================================================

/**
 * Narrative content block
 */
export const NarrativeBlockSchema = z.object({
  type: z.literal("narrative"),
  text: z.string().describe("Narrative text content (can include HTML)"),
  tone: z
    .enum(["informative", "persuasive", "cautionary", "celebratory"])
    .describe("Tone of the narrative"),
});

/**
 * Key metric content block
 */
export const KeyMetricBlockSchema = z.object({
  type: z.literal("key_metric"),
  label: z.string().describe("Metric label"),
  value: z.string().describe("Metric value (formatted)"),
  change: z
    .object({
      direction: z.enum(["up", "down", "flat"]),
      amount: z.string().describe("Change amount (formatted)"),
      context: z.string().describe("Context for the change"),
    })
    .optional()
    .describe("Optional change indicator"),
});

/**
 * Comparison content block
 */
export const ComparisonBlockSchema = z.object({
  type: z.literal("comparison"),
  items: z
    .array(
      z.object({
        label: z.string().describe("Item label"),
        values: z
          .record(z.string(), z.any())
          .describe("Key-value pairs for comparison"),
      })
    )
    .describe("Items to compare"),
  highlightBest: z
    .boolean()
    .optional()
    .describe("Whether to highlight the best option"),
});

/**
 * Timeline content block
 */
export const TimelineBlockSchema = z.object({
  type: z.literal("timeline"),
  events: z
    .array(
      z.object({
        date: z.string().describe("Date or time marker"),
        title: z.string().describe("Event title"),
        description: z.string().describe("Event description"),
      })
    )
    .describe("Timeline events"),
});

/**
 * Recommendation content block
 */
export const RecommendationBlockSchema = z.object({
  type: z.literal("recommendation"),
  title: z.string().describe("Recommendation title"),
  description: z.string().describe("Detailed recommendation"),
  impact: z.enum(["high", "medium", "low"]).describe("Expected impact"),
  effort: z.enum(["high", "medium", "low"]).describe("Required effort"),
});

/**
 * Risk content block
 */
export const RiskBlockSchema = z.object({
  type: z.literal("risk"),
  title: z.string().describe("Risk title"),
  description: z.string().describe("Risk description"),
  severity: z
    .enum(["critical", "high", "medium", "low"])
    .describe("Risk severity"),
  mitigation: z.string().optional().describe("Suggested mitigation"),
});

/**
 * Callout content block
 */
export const CalloutBlockSchema = z.object({
  type: z.literal("callout"),
  style: z
    .enum(["info", "warning", "success", "question"])
    .describe("Callout style"),
  content: z.string().describe("Callout content"),
});

/**
 * Visualization content block
 */
export const VisualizationBlockSchema = z.object({
  type: z.literal("visualization"),
  chartType: z
    .string()
    .describe("Chart type: bar, line, pie, table, metric, etc."),
  title: z.string().describe("Chart title"),
  data: z.any().describe("Chart data (format depends on chartType)"),
  insight: z.string().optional().describe("Optional insight about the data"),
});

/**
 * Union of all content block types
 */
export const ContentBlockSchema = z.discriminatedUnion("type", [
  NarrativeBlockSchema,
  KeyMetricBlockSchema,
  ComparisonBlockSchema,
  TimelineBlockSchema,
  RecommendationBlockSchema,
  RiskBlockSchema,
  CalloutBlockSchema,
  VisualizationBlockSchema,
]);

/**
 * Source citation for a section
 */
export const SourceCitationSchema = z.object({
  documentId: z.string().describe("Document ID"),
  documentName: z.string().describe("Document filename"),
  excerpt: z.string().optional().describe("Relevant excerpt"),
  pageOrLocation: z.string().optional().describe("Page number or location"),
});

/**
 * Complete generated section
 */
export const GeneratedSectionSchema = z.object({
  title: z.string().describe("Section title"),
  purpose: z.string().describe("Section purpose"),
  content: z.array(ContentBlockSchema).describe("Content blocks"),
  sources: z.array(SourceCitationSchema).describe("Source citations"),
  confidence: z.number().min(0).max(100).describe("Confidence score 0-100"),
});

/**
 * On-demand section generation feasibility check
 */
export const SectionFeasibilitySchema = z.object({
  canGenerate: z.boolean().describe("Whether the section can be generated"),
  reason: z.string().describe("Explanation for the decision"),
  suggestedTitle: z
    .string()
    .optional()
    .describe("Suggested title if generation is possible"),
  missingDocuments: z
    .array(z.string())
    .optional()
    .describe("Types of documents that would help"),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type DataPointType = z.infer<typeof DataPointTypeSchema>;
export type DataPoint = z.infer<typeof DataPointSchema>;
export type DocumentAnalysisItem = z.infer<typeof DocumentAnalysisItemSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type DocumentUnderstanding = z.infer<typeof DocumentUnderstandingSchema>;

export type VisualizationSuggestion = z.infer<
  typeof VisualizationSuggestionSchema
>;
export type CalloutSuggestion = z.infer<typeof CalloutSuggestionSchema>;
export type SuggestedContent = z.infer<typeof SuggestedContentSchema>;
export type PlannedSection = z.infer<typeof PlannedSectionSchema>;
export type AdditionalSectionIdea = z.infer<typeof AdditionalSectionIdeaSchema>;
export type GenerativeCanvasPlan = z.infer<typeof GenerativeCanvasPlanSchema>;

export type NarrativeBlock = z.infer<typeof NarrativeBlockSchema>;
export type KeyMetricBlock = z.infer<typeof KeyMetricBlockSchema>;
export type ComparisonBlock = z.infer<typeof ComparisonBlockSchema>;
export type TimelineBlock = z.infer<typeof TimelineBlockSchema>;
export type RecommendationBlock = z.infer<typeof RecommendationBlockSchema>;
export type RiskBlock = z.infer<typeof RiskBlockSchema>;
export type CalloutBlock = z.infer<typeof CalloutBlockSchema>;
export type VisualizationBlock = z.infer<typeof VisualizationBlockSchema>;
export type ContentBlock = z.infer<typeof ContentBlockSchema>;
export type SourceCitation = z.infer<typeof SourceCitationSchema>;
export type GeneratedSection = z.infer<typeof GeneratedSectionSchema>;
export type SectionFeasibility = z.infer<typeof SectionFeasibilitySchema>;
