import type { ContextState } from "@/app/canvas-flow/_components/mock-data";

/**
 * Stored plan section structure from Convex
 */
interface StoredPlanSection {
  id: string;
  title: string;
  purpose: string;
  keyQuestions: string[];
  dataSourceIds: string[];
  suggestedContent: {
    narrativePoints: string[];
    visualizations: Array<{
      type: string;
      title: string;
      dataDescription: string;
      rationale: string;
    }>;
    callouts: Array<{
      type: string;
      content: string;
    }>;
  };
  confidence: number;
  generationPriority: number;
  status: string;
}

/**
 * Stored plan structure from Convex
 */
interface StoredPlan {
  canvasTitle: string;
  canvasPurpose: string;
  sections: StoredPlanSection[];
  additionalSectionIdeas: Array<{
    title: string;
    description: string;
    wouldRequire: string;
  }>;
}

/**
 * Document analysis structure from Convex
 */
interface DocumentAnalysis {
  documents: Array<{
    documentId: string;
    filename: string;
    primaryDomain: string;
    topics: string[];
    dataPoints: Array<{
      name: string;
      type: string;
      value: unknown;
      context: string;
    }>;
    keyInsights: string[];
  }>;
  overallThemes: Array<{
    theme: string;
    relevance: number;
    supportingDocuments: string[];
  }>;
  suggestedCanvasFocus: string;
}

/**
 * Build the prompt for generating the final canvas content
 * This is used after the plan has been approved and the user clicks "Generate Canvas"
 */
export function buildCanvasGenerationPrompt(
  plan: StoredPlan,
  documentAnalysis: DocumentAnalysis,
  context: ContextState
): string {
  // Format sections with full details
  const sectionsPrompt = plan.sections
    .sort((a, b) => a.generationPriority - b.generationPriority)
    .map(
      (section, index) => `
### Section ${index + 1}: ${section.title}
**ID:** ${section.id}
**Purpose:** ${section.purpose}
**Key Questions to Answer:**
${section.keyQuestions.length > 0 ? section.keyQuestions.map((q) => `- ${q}`).join("\n") : "- [Derive from purpose and document analysis]"}

**Planned Narrative Points:**
${section.suggestedContent.narrativePoints.map((p) => `- ${p}`).join("\n")}

**Suggested Visualizations:**
${
  section.suggestedContent.visualizations.length > 0
    ? section.suggestedContent.visualizations
        .map((v) => `- ${v.title} (${v.type}): ${v.dataDescription}`)
        .join("\n")
    : "- [Determine from available data]"
}

**Callouts to Include:**
${section.suggestedContent.callouts.map((c) => `- [${c.type.toUpperCase()}] ${c.content}`).join("\n")}

**Confidence Level:** ${section.confidence}%
**Data Sources:** ${section.dataSourceIds.length > 0 ? section.dataSourceIds.join(", ") : "All available documents"}
`
    )
    .join("\n");

  // Format document analysis summary
  const documentsContext = documentAnalysis.documents
    .map(
      (doc) => `
**${doc.filename}** (${doc.primaryDomain})
- Topics: ${doc.topics.join(", ")}
- Key Insights: ${doc.keyInsights.slice(0, 3).join("; ")}
- Data Points: ${doc.dataPoints
        .slice(0, 5)
        .map((dp) => `${dp.name}: ${dp.value}`)
        .join(", ")}
`
    )
    .join("\n");

  // Format themes
  const themesContext = documentAnalysis.overallThemes
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5)
    .map((theme) => `- ${theme.theme} (${theme.relevance}% relevance)`)
    .join("\n");

  // Format context settings
  const contextSettings = `
- **Client:** ${context.clientName || "Not specified"}
- **Renewal Period:** ${context.renewalPeriod || "Not specified"}
- **Expected Increase:** ${context.expectedIncreasePercent !== null ? `${context.expectedIncreasePercent}%` : "Not specified"}
- **Budget Comparison:** ${context.budgetComparison || "Not specified"}
- **Presentation Depth:** ${context.presentationDepth}/100 (${context.presentationDepth < 33 ? "comprehensive" : context.presentationDepth < 66 ? "balanced" : "focused"})
- **Strategy Ideas:** ${context.strategyIdeas || "None provided"}
- **Additional Context:** ${context.additionalContext || "None provided"}
`;

  return `# Canvas Content Generation

You are generating the complete content for a benefits consulting presentation canvas.

## Canvas Overview
**Title:** ${plan.canvasTitle}
**Purpose:** ${plan.canvasPurpose}

## Client Context
${contextSettings}

## Document Analysis

### Available Documents
${documentsContext}

### Cross-Document Themes
${themesContext}

### Suggested Focus
${documentAnalysis.suggestedCanvasFocus}

## Approved Plan Sections
Generate content for each of these sections in order:
${sectionsPrompt}

## Generation Instructions

For EACH section, generate:

1. **Title & Purpose** (use the planned title and purpose)

2. **Narrative Content** (2-4 paragraphs)
   - Open with a compelling hook or key finding
   - Include specific data from documents
   - Connect to the client's context and priorities
   - End with actionable insights or implications

3. **Key Metrics** (2-4 metrics per section)
   - Extract real numbers from document analysis
   - Include context (vs. benchmark, vs. last year, etc.)
   - Format appropriately (currency, percentage, count)

4. **Visualizations** (where data supports)
   - Only include if data is available
   - Provide actual data arrays for charts
   - Use appropriate chart types for the data

5. **Callouts** (1-3 per section)
   - Insights: Key findings worth highlighting
   - Warnings: Risks or concerns to address
   - Recommendations: Suggested actions

6. **Sources** (cite document references)
   - Reference specific documents
   - Include page numbers or locations when available

## Quality Guidelines

- **Be specific**: Use actual numbers and data from documents
- **Be relevant**: Connect everything back to the client's situation
- **Be actionable**: Every insight should lead to potential action
- **Be honest**: Note limitations or gaps in available data
- **Be concise**: Respect the presentation depth setting
- **Be professional**: Maintain a consultant's advisory tone

## Output Format

Return a JSON object with the following structure for each section:
\`\`\`json
{
  "sections": [
    {
      "sectionId": "section-id",
      "title": "Section Title",
      "purpose": "Brief purpose statement",
      "content": [
        { "type": "narrative", "text": "...", "tone": "informative" },
        { "type": "key_metric", "label": "...", "value": "...", "change": {...} },
        { "type": "visualization", "chartType": "...", "title": "...", "data": [...] },
        { "type": "callout", "style": "insight|warning|success", "content": "..." }
      ],
      "sources": [
        { "documentId": "...", "documentName": "...", "excerpt": "..." }
      ],
      "confidence": 85
    }
  ]
}
\`\`\`

Generate content for all ${plan.sections.length} sections now.`;
}

/**
 * Build prompt for generating a single section on-demand
 */
export function buildSingleSectionPrompt(
  section: StoredPlanSection,
  documentAnalysis: DocumentAnalysis,
  context: ContextState,
  existingSections: string[] // Titles of already generated sections
): string {
  return `# Generate Single Section Content

Generate content for the following section:

**Title:** ${section.title}
**Purpose:** ${section.purpose}
**Key Questions:** ${section.keyQuestions.join(", ") || "Derive from purpose"}

## Context
- Client: ${context.clientName}
- Already Generated Sections: ${existingSections.join(", ") || "None"}

## Available Data
${JSON.stringify(documentAnalysis, null, 2)}

## Instructions
Generate comprehensive content for this section following the standard format:
- Narrative content (2-3 paragraphs)
- Key metrics with real data
- Appropriate visualizations
- 1-3 callouts

Return the section content as a JSON object.`;
}
