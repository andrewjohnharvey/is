# Pre-Renewal Benefits Module - Implementation Plan

**Document Version**: 1.4 **Last Updated**: 2025-12-04 **Status**: Draft **Related PRD**:
[Pre-Renewal Benefits Consultant Module PRD](./2025-12-03-pre-renewal-benefits-module.md)

---

## Executive Summary

This implementation plan breaks the Pre-Renewal Benefits Module into **7 incremental chunks**, each delivering testable
user value. The goal is to get working software into consultants' hands as quickly as possible to gather feedback and
iterate.

**Key Principles:**

- Each chunk is independently deployable and testable
- Users get value at every checkpoint (no "infrastructure-only" releases)
- Feedback loops are built into each chunk
- Later chunks can be re-prioritized based on early feedback

---

## Implementation Overview

```
Chunk 1: Document Upload & Preview (2 weeks)
    ↓ [Feedback Checkpoint 1]
Chunk 2: Basic AI Extraction (2 weeks)
    ↓ [Feedback Checkpoint 2]
Chunk 3: Single-Section Canvas Generation (2 weeks)
    ↓ [Feedback Checkpoint 3]
Chunk 4: Full Canvas Generation (2 weeks)
    ↓ [Feedback Checkpoint 4 - MVP Pilot]
Chunk 5: Chat-Based Refinement (2 weeks)
    ↓ [Feedback Checkpoint 5]
Chunk 6: Export & Presentation (2 weeks)
    ↓ [Feedback Checkpoint 6]
Chunk 7: Client Management & Polish (2 weeks)
    ↓ [GA Release]
```

**Total Timeline**: 14 weeks (3.5 months) **First User Value**: Week 2 (Chunk 1) **MVP for Pilot**: Week 8 (after
Chunk 4)

---

## RAG Architecture Overview

This implementation leverages the existing RAG (Retrieval-Augmented Generation) infrastructure in `@repo/ai/rag` to
power document processing and canvas generation.

### Document Processing Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Upload Files   │ ──▶ │  Extract Text   │ ──▶ │  Redact PHI     │
│  (Chunk 1)      │     │  (pdf-parse,    │     │  (ai-onedigital)│
│                 │     │   xlsx, mammoth)│     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Query via RAG  │ ◀── │  Store in       │ ◀── │  Chunk Text     │
│  (Chunk 3+)     │     │  Upstash Vector │     │  (generateChunks│
│                 │     │  (Chunk 2)      │     │   from @repo/ai)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│  Generate       │ ──▶ │  Canvas Section │
│  with Context   │     │  Output         │
│  (generateObject│     │                 │
└─────────────────┘     └─────────────────┘
```

### Key RAG Components Used

| Component                          | Package        | Purpose                                 |
| ---------------------------------- | -------------- | --------------------------------------- |
| `generateChunks()`                 | `@repo/ai/rag` | Split documents into semantic chunks    |
| `RAGDatabaseBridge`                | `@repo/ai/rag` | Store/query document embeddings         |
| `HybridSearchEngine`               | `@repo/ai/rag` | Combined vector + keyword search        |
| `createRAGDatabaseBridgeFromEnv()` | `@repo/ai/rag` | Quick setup with env vars               |
| Upstash Vector                     | External       | Vector storage with namespace isolation |

### Namespace Strategy

Each client's documents are stored in an isolated namespace:

- Format: `benefits-{clientId}`
- Enables per-client document search
- Prevents data leakage between clients
- Supports efficient deletion when client is removed

---

## AI SDK Patterns from `@repo/ai`

Beyond RAG, the `@repo/ai` package provides many patterns we'll leverage throughout the implementation.

### Generation Patterns

| Pattern                    | Import                | Use Case                                          |
| -------------------------- | --------------------- | ------------------------------------------------- |
| `generateObject`           | `@repo/ai/generation` | Extract structured benefits data with Zod schemas |
| `generateArray`            | `@repo/ai/generation` | Batch extract multiple plan designs               |
| `streamObjectWithPartials` | `@repo/ai/generation` | Real-time canvas section generation with progress |
| `Chat.multiStep`           | `@repo/ai/generation` | Complex multi-step benefits analysis              |

### Provider & Model Selection

```typescript
import { models, getDefaultModel } from "@repo/ai/providers";

// Semantic model selection based on task
const extractionModel = models.language("powerful"); // Accuracy for extraction
const chatModel = models.language("fast"); // Speed for chat refinement
const analysisModel = models.language("balanced"); // Cost/quality for sections
```

### Pre-built Tools

| Tool                  | Use Case                         |
| --------------------- | -------------------------------- |
| `webSearchTool`       | Fetch current benchmark data     |
| `trackEventTool`      | Analytics for canvas generation  |
| `executeToolSafely`   | Resilient external API calls     |
| `executeWithFallback` | Fallback for benchmark providers |

### Resilience Patterns

```typescript
import { executeWithCircuitBreaker, withRetry } from "@repo/ai/server/rag";
import { errorConfigFragments } from "@repo/ai";

// Circuit breaker for external benchmark APIs
const benchmarkData = await executeWithCircuitBreaker(
  () => fetchMercerBenchmarks(),
  "mercer-api",
  {
    failureThreshold: 5,
    recoveryTimeout: 60000,
  }
);

// Retry configuration
const robustConfig = errorConfigFragments.robust; // Retry + fallback
```

### Streaming with Progress

```typescript
import { streamTextWithProgress, processFullStream } from "@repo/ai/generation";

// Track generation progress for UI
const result = await streamTextWithProgress(
  prompt,
  (progress) => updateProgressBar(progress.tokens),
  options
);

// Process stream with handlers
await processFullStream(fullStream, {
  onTextDelta: (text) => appendToCanvas(text),
  onToolCall: (tool) => logToolUsage(tool),
  onFinish: () => markSectionComplete(),
});
```

### Cost Tracking & Telemetry

```typescript
import { RAGTelemetry, trackRAGOperation } from "@repo/ai/server/rag";

// Track operations for cost analysis
await trackRAGOperation("canvas_generation", async (tracker) => {
  tracker.setQuery(sectionPrompt, "generation");
  const result = await generateSection();
  tracker.setSearchResults(result);
  return result;
});

// Get usage metrics
const telemetry = new RAGTelemetry();
const metrics = telemetry.getMetrics(3600000); // Last hour
console.log(`Success rate: ${metrics.successRate}%`);
```

---

## Platform Packages Overview

Beyond `@repo/ai`, the monorepo provides many packages we'll leverage:

### Analytics (`@repo/analytics`)

Track AI usage, canvas events, and user interactions with 90+ pre-built event types:

```typescript
import { aiSdk } from "@repo/analytics/shared/emitters";

// Track canvas generation
aiSdk.artifactCreated({
  artifact_id: canvasId,
  artifact_type: "document",
  model_id: "claude-3-sonnet",
  user_id: userId,
});

// Track AI cost
aiSdk.completionGenerated({
  model_id: "claude-3-sonnet",
  input_tokens: 150,
  output_tokens: 500,
  cost: 0.002,
});
```

### Auth (`@repo/auth`)

RBAC permissions with organization-scoped access control:

```typescript
import { requireAuth, checkPermission } from '@repo/auth/server/next';
import { ProtectedRoute } from '@repo/auth/client/next';

// Server-side
const { user, session } = await requireAuth();
const canEdit = await checkPermission(user.role, 'write', { organizationId });

// Client-side
<ProtectedRoute requiredRole="member" requiredPermissions={['read', 'write']}>
  <BenefitsCanvas />
</ProtectedRoute>
```

### Storage (`@repo/storage`)

Document upload with progress tracking:

```typescript
import { uploadMediaAction } from "@repo/storage/server/next";
import { upload } from "@repo/storage/client/next";

// Client-side with progress
const blob = await upload(file.name, file, {
  handleUploadUrl: "/api/benefits/upload",
  onUploadProgress: ({ percentage }) => setProgress(percentage),
});
```

### PPTX Editor (`@repo/pptx-editor`)

Export canvas to PowerPoint:

```typescript
import { PptxWriter } from "@repo/pptx-editor/writer";
import { usePptxExport } from "@repo/pptx-editor";

const pptx = new PptxWriter();
pptx.setMetadata({ title: `Benefits Review - ${clientName}` });
pptx.addSlide([{ x: 914400, y: 914400, width: 7315200, text: summary }]);
const blob = await pptx.generate();
```

### Editor-doc (`@repo/editor-doc`)

Rich text editing for canvas sections:

```typescript
import { EditorDocAdvanced, useDocumentPersistence } from '@repo/editor-doc/client';

<EditorDocAdvanced
  content={sectionContent}
  onUpdate={(editor) => handleContentChange(editor.getHTML())}
  placeholder="Enter section content..."
  showToolbar
/>
```

### Observability (`@repo/observability`)

Error tracking and logging:

```typescript
import { observability } from "@repo/observability/server/next";

observability.logInfo("Canvas generated", { canvasId, userId, sectionCount });
observability.captureException(error, {
  extra: { canvasId },
  tags: { feature: "benefits-module" },
});
```

### Feature Flags (`@repo/feature-flags`)

Gradual feature rollout:

```typescript
import { flag } from "@repo/feature-flags";

export const benefitsAIEnabled = flag<boolean>({
  key: "benefits-ai-generation",
  defaultValue: false,
});

const aiEnabled = await benefitsAIEnabled();
```

### Security (`@repo/security`)

Rate limiting for AI operations:

```typescript
import { secure, applyRateLimit } from "@repo/security/server/next";

await secure([], request); // Bot protection
const result = await applyRateLimit(ip, "api");
if (!result.success) return new Response("Too many requests", { status: 429 });
```

### Package Summary Table

| Package               | Use in Benefits Module                  |
| --------------------- | --------------------------------------- |
| `@repo/analytics`     | Track AI usage, canvas events           |
| `@repo/auth`          | Permission control, organization access |
| `@repo/storage`       | Upload documents, export files          |
| `@repo/uni-ui`        | UI components, charts, AI elements      |
| `@repo/pptx-editor`   | Export canvas to PowerPoint             |
| `@repo/editor-doc`    | Rich text editing for sections          |
| `@repo/observability` | Error tracking, performance monitoring  |
| `@repo/feature-flags` | Feature rollout, A/B testing            |
| `@repo/security`      | Rate limiting AI calls, bot protection  |

---

## Chunk 1: Document Upload & Preview

**Duration**: 2 weeks **User Value**: Consultants can upload and organize client documents in one place

### Scope

| User Story | Description                                          | Priority |
| ---------- | ---------------------------------------------------- | -------- |
| US-4.1.1   | Multi-format document upload (PPTX, DOCX, XLSX, PDF) | P0       |
| US-4.1.2   | Document organization by category                    | P1       |

### Deliverables

1. **Document Upload UI** (using `@repo/storage` + `@repo/uni-ui`)
   - Drag-and-drop upload zone with progress tracking
   - File type validation (PPTX, DOCX, XLSX, PDF only - defer EML/MSG)
   - Progress indicators per file via `onUploadProgress`
   - File size validation (50MB per file, 500MB total)

2. **Document List & Preview**
   - List uploaded documents with metadata using `@repo/uni-ui` Table
   - Category assignment (manual only - defer auto-suggest)
   - Basic document preview (PDF inline, others as download)
   - Remove individual files

3. **Storage Integration** (using `@repo/storage`)
   - Vercel Blob integration via `uploadMediaAction`
   - Database models: `ClientDocument` (simplified)
   - 30-day retention policy

4. **Auth & Analytics**
   - Protect routes with `@repo/auth`
   - Track uploads with `@repo/analytics`

### Upload Implementation Pattern

```typescript
// Client-side upload with progress
import { upload } from "@repo/storage/client/next";
import { aiSdk } from "@repo/analytics/shared/emitters";

const handleUpload = async (files: File[]) => {
  for (const file of files) {
    const blob = await upload(file.name, file, {
      access: "private",
      handleUploadUrl: "/api/benefits/upload",
      onUploadProgress: ({ percentage }) => {
        setProgress((prev) => ({ ...prev, [file.name]: percentage }));
      },
    });

    // Track upload event
    aiSdk.documentCreated({
      document_id: blob.pathname,
      document_type: file.type,
      user_id: userId,
    });
  }
};

// Server-side validation
import { uploadMediaAction } from "@repo/storage/server/next";
import { requireAuth } from "@repo/auth/server/next";

export async function POST(request: Request) {
  const { user } = await requireAuth();
  const formData = await request.formData();
  const file = formData.get("file") as File;

  const result = await uploadMediaAction(
    `benefits/${user.organizationId}/${Date.now()}-${file.name}`,
    file,
    {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      allowedMimeTypes: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ],
    }
  );

  return Response.json(result);
}
```

### Technical Tasks

```
□ Create benefits route group in oneapp-onstage
□ Implement document upload API endpoint using @repo/storage
□ Add auth protection using @repo/auth
□ Create Dropzone component with validation using @repo/uni-ui
□ Add ClientDocument Prisma model
□ Integrate Vercel Blob storage via uploadMediaAction
□ Build document list UI with category selector
□ Add basic PDF preview component
□ Add analytics tracking via @repo/analytics
□ Write unit tests for upload validation
□ Write integration tests for upload flow
```

### Acceptance Criteria

- [ ] User can drag-and-drop up to 20 files simultaneously
- [ ] System rejects files > 50MB with clear error message
- [ ] System rejects unsupported file types with clear error message
- [ ] User can assign categories to uploaded documents
- [ ] User can preview PDF documents inline
- [ ] User can remove documents before proceeding
- [ ] Documents persist across browser sessions

### Feedback Checkpoint 1

**Target Users**: 3-5 internal consultants **Duration**: 3-5 days **Questions to Answer**:

- Is the upload experience intuitive?
- Are the file size limits appropriate?
- Are the categories correct/complete?
- What document types are we missing?
- How many documents do they typically upload per client?

**Feedback Mechanism**: 15-minute video call + survey

---

## Chunk 2: Basic AI Extraction

**Duration**: 2 weeks **User Value**: AI extracts key benefits data from documents, saving hours of manual review

### Scope

| User Story | Description                         | Priority |
| ---------- | ----------------------------------- | -------- |
| US-4.2.1   | Automated data extraction (partial) | P0       |

### Deliverables

1. **Document Processing Pipeline**
   - PDF text extraction using `pdf-parse`
   - Excel data extraction using `xlsx`
   - Word document extraction using `mammoth`
   - PHI/PII redaction before AI processing (using `@oneapp-onstage/lib/ai-onedigital`)

2. **RAG-Based Document Indexing** (leveraging `@repo/ai/rag`)
   - Chunk documents using existing `generateChunks()` with sentence/paragraph strategy
   - Store document embeddings in Upstash Vector via `RAGDatabaseBridge`
   - Enable semantic search across all client documents
   - Namespace isolation per client for data separation

3. **AI Extraction (Core Fields)**
   - Plan design details (deductibles, copays, OOP max)
   - Premium/rate information by tier
   - Enrollment counts
   - Confidence scoring for each field

4. **Extraction Review UI**
   - Display extracted data in structured format
   - Show confidence scores with visual indicators
   - Flag low-confidence fields for review
   - Allow manual corrections

### Existing Infrastructure to Leverage

| Component             | Package                             | Usage                                              |
| --------------------- | ----------------------------------- | -------------------------------------------------- |
| Document chunking     | `@repo/ai/rag`                      | `generateChunks()`, `chunkDocuments()`             |
| Embeddings            | `@repo/ai/rag`                      | `embed()`, `embedMany()` from AI SDK               |
| Vector storage        | `@repo/ai/rag`                      | `RAGDatabaseBridge`, Upstash Vector                |
| Hybrid search         | `@repo/ai/rag`                      | `HybridSearchEngine` for combined vector + keyword |
| PHI detection         | `@oneapp-onstage/lib/ai-onedigital` | HIPAA Safe Harbor redaction                        |
| Structured extraction | `@repo/ai/generation`               | `generateObject()` with Zod schemas                |

### Technical Tasks

```
□ Install document parsing dependencies (pdf-parse, xlsx, mammoth)
□ Create document text extraction service (PDF, XLSX, DOCX)
□ Implement PHI detection and redaction using ai-onedigital
□ Integrate RAG chunking pipeline:
  □ Use generateChunks() with paragraph strategy for benefits docs
  □ Configure chunk size (1000 chars) and overlap (200 chars)
□ Set up Upstash Vector namespace for benefits documents
□ Create RAGDatabaseBridge instance for document storage
□ Build document indexing API endpoint
□ Build AI extraction prompts for plan design data
□ Create Zod schemas for extraction output (BenefitsExtractionSchema)
□ Implement confidence scoring logic
□ Build extraction results UI with confidence indicators
□ Add manual correction capability
□ Write tests for extraction accuracy
□ Create extraction benchmark test suite
```

### Acceptance Criteria

- [ ] System extracts text from PDF, XLSX, DOCX files
- [ ] PHI/PII is redacted before AI processing
- [ ] Documents are chunked and indexed in Upstash Vector
- [ ] RAG search returns relevant document sections for queries
- [ ] AI extracts plan design details with >80% accuracy
- [ ] AI extracts premium information with >80% accuracy
- [ ] Confidence scores displayed for each extracted field
- [ ] Low-confidence fields (<70%) are visually flagged
- [ ] User can manually correct extracted values
- [ ] Processing completes in <5 minutes for 20 documents

### Feedback Checkpoint 2

**Target Users**: 5-8 consultants (expand from Chunk 1) **Duration**: 1 week **Questions to Answer**:

- How accurate is the extraction for their documents?
- What data fields are missing?
- Is the confidence scoring helpful?
- How long does processing take for real document sets?
- What document formats are causing issues?

**Feedback Mechanism**: Document submission + accuracy review session

---

## Chunk 3: Fully Generative Canvas System

**Duration**: 2 weeks **User Value**: AI analyzes ANY uploaded documents and generates a completely custom canvas - no
predefined templates, handles any content type

### Design Philosophy: Fully Generative, Zero Templates

**Traditional approach (rejected):**

> "Generate these 6 fixed sections for every client"

**Dynamic approach (previous iteration - still too rigid):**

> "Pick from 12 predefined section types based on data"

**Fully generative approach (adopted):**

> "Analyze whatever documents the consultant uploads - whether it's health benefits, 401(k) retirement plans, HR
> consulting proposals, executive compensation, or anything else - and generate a completely custom canvas that presents
> the most valuable insights from that specific data"

### Why Fully Generative?

Consultants work with diverse client needs:

- **Health & Welfare Benefits** - Medical, dental, vision, life, disability
- **Retirement Plans** - 401(k), pension, deferred compensation
- **HR Consulting** - Compensation studies, org design, compliance audits
- **Executive Benefits** - SERP, split-dollar, golden parachutes
- **Voluntary Benefits** - Pet insurance, legal plans, identity theft
- **Compliance** - ACA reporting, ERISA audits, 5500 filings
- **M&A Due Diligence** - Benefits integration, liability assessment
- **Anything else** - We can't predict every use case

The system must handle ALL of these without requiring code changes.

### Scope

| User Story | Description             | Priority |
| ---------- | ----------------------- | -------- |
| US-4.3.1   | Fully generative canvas | P0       |
| US-4.3.4   | Dynamic visualizations  | P1       |

### Deliverables

1. **Universal Document Understanding**
   - AI analyzes ANY document type without predefined categories
   - Discovers topics, themes, and data points organically
   - Identifies relationships between documents
   - No hardcoded assumptions about content type

2. **Generative Canvas Planning**
   - AI proposes section structure based purely on discovered content
   - Section titles, descriptions, and purposes are generated (not selected from a list)
   - Consultant can modify, add, remove, or regenerate sections
   - Supports any domain: benefits, retirement, HR, compliance, etc.

3. **On-Demand Section Generation**
   - Generate new sections at any time from chat or UI
   - Consultant describes what they want, AI creates it
   - No limits on section types or count

4. **Intelligent Visualizations**
   - AI determines if/what visualizations make sense
   - Generates chart configurations from data
   - Falls back gracefully when data doesn't support visuals

### Universal Document Analysis

```typescript
import { generateObject, generateArray } from "@repo/ai/generation";
import { createRAGDatabaseBridge } from "@repo/ai/rag";
import { z } from "zod";

// Schema for document understanding - NO predefined categories
const DocumentUnderstandingSchema = z.object({
  documents: z.array(
    z.object({
      documentId: z.string(),
      filename: z.string(),
      // AI-discovered properties (not predefined)
      primaryDomain: z
        .string()
        .describe(
          'e.g., "Health Benefits", "401(k) Retirement", "Executive Compensation"'
        ),
      topics: z.array(z.string()).describe("Specific topics found in document"),
      dataPoints: z.array(
        z.object({
          name: z.string(),
          type: z.enum([
            "currency",
            "percentage",
            "count",
            "date",
            "text",
            "comparison",
          ]),
          value: z.any(),
          context: z.string(),
        })
      ),
      keyInsights: z.array(z.string()),
      relatedDocuments: z
        .array(z.string())
        .describe("IDs of documents that relate to this one"),
    })
  ),
  overallThemes: z.array(
    z.object({
      theme: z.string(),
      relevance: z.number().min(0).max(100),
      supportingDocuments: z.array(z.string()),
    })
  ),
  suggestedCanvasFocus: z
    .string()
    .describe("What should this canvas primarily address?"),
});

// Step 1: Understand documents without assumptions
const analyzeDocuments = async (clientId: string) => {
  const bridge = createRAGDatabaseBridge({ namespace: `benefits-${clientId}` });

  // Get all document content
  const allContent = await bridge.queryDocuments("", { topK: 100 }); // Get everything

  const understanding = await generateObject({
    model: models.language("powerful"),
    schema: DocumentUnderstandingSchema,
    prompt: `You are an expert consultant. Analyze these documents and understand what they contain.

## Documents
${allContent
  .map(
    (d) => `
### ${d.metadata.filename}
${d.content}
`
  )
  .join("\n")}

## Your Task
1. Identify what domain each document belongs to (health benefits, retirement, HR consulting, compliance, etc.)
2. Extract specific topics and data points from each document
3. Find relationships between documents
4. Identify overarching themes across all documents
5. Suggest what the consultant's canvas should focus on

DO NOT assume this is about health benefits. It could be about ANYTHING:
- 401(k) retirement plan renewals
- Executive compensation analysis
- HR consulting proposals
- Compliance audits
- M&A due diligence
- Voluntary benefits review
- Or something entirely different

Analyze what's actually in the documents.`,
  });

  return understanding;
};
```

### Generative Canvas Planning (No Templates)

```typescript
// Schema for generative canvas plan - sections are CREATED, not selected
const GenerativeCanvasPlanSchema = z.object({
  canvasTitle: z.string().describe("AI-generated title based on content"),
  canvasPurpose: z
    .string()
    .describe("What this canvas helps the client understand"),
  sections: z.array(
    z.object({
      // Everything is generated, nothing is from a predefined list
      id: z.string(),
      title: z.string().describe("AI-generated section title"),
      purpose: z.string().describe("What this section accomplishes"),
      keyQuestions: z
        .array(z.string())
        .describe("Questions this section answers"),
      dataSourceIds: z.array(z.string()),
      suggestedContent: z.object({
        narrativePoints: z.array(z.string()),
        visualizations: z.array(
          z.object({
            type: z.string().describe('Chart type or "none" if not applicable'),
            title: z.string(),
            dataDescription: z.string(),
            rationale: z.string().describe("Why this visualization helps"),
          })
        ),
        callouts: z.array(
          z.object({
            type: z.enum(["insight", "warning", "recommendation", "question"]),
            content: z.string(),
          })
        ),
      }),
      confidence: z.number().min(0).max(100),
      generationPriority: z.number().describe("1 = generate first"),
    })
  ),
  additionalSectionIdeas: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      wouldRequire: z
        .string()
        .describe("What additional data/documents would enable this"),
    })
  ),
});

// Step 2: Generate canvas plan based on document understanding
const planGenerativeCanvas = async (
  clientId: string,
  documentUnderstanding: DocumentUnderstanding,
  consultantGuidance?: string
) => {
  const plan = await generateObject({
    model: models.language("powerful"),
    schema: GenerativeCanvasPlanSchema,
    prompt: `You are creating a presentation canvas for a consultant meeting with their client.

## Document Analysis
${JSON.stringify(documentUnderstanding, null, 2)}

## Consultant Guidance
${consultantGuidance || "No specific guidance provided - create the most valuable canvas possible"}

## Your Task
Create a canvas structure that:
1. Addresses the most important topics found in the documents
2. Presents data in a compelling, actionable way
3. Tells a coherent story across sections
4. Includes visualizations WHERE THEY ADD VALUE (not everywhere)
5. Prioritizes insights that help the client make decisions

## Guidelines
- Generate 3-10 sections based on content richness
- Section titles should be specific and descriptive (not generic like "Overview")
- Each section should have a clear purpose
- Don't force visualizations - only suggest them when data supports it
- Include an executive summary if there's enough content
- Be creative - if the data supports a unique insight, create a section for it

## Remember
This could be about ANY topic: health benefits, 401(k), executive comp, HR consulting, compliance, etc.
Create sections that make sense for THIS specific content.`,
  });

  return plan;
};
```

### On-Demand Section Generation

```typescript
// Generate ANY section on demand - from chat, button click, or consultant request
const generateSectionOnDemand = async (
  clientId: string,
  request: {
    description: string; // Natural language: "Add a section about 401k match comparisons"
    context?: string; // Optional additional context
  }
) => {
  const bridge = createRAGDatabaseBridge({ namespace: `benefits-${clientId}` });

  // Search for relevant content based on the request
  const relevantDocs = await bridge.queryDocuments(request.description, {
    topK: 20,
  });

  // Generate the section structure
  const sectionPlan = await generateObject({
    model: models.language("balanced"),
    schema: z.object({
      title: z.string(),
      canGenerate: z.boolean(),
      reason: z.string().describe("Why we can or cannot generate this"),
      content: z
        .object({
          narrativePoints: z.array(z.string()),
          visualizations: z.array(
            z.object({
              type: z.string(),
              title: z.string(),
              data: z.any(),
            })
          ),
          callouts: z.array(
            z.object({
              type: z.enum([
                "insight",
                "warning",
                "recommendation",
                "question",
              ]),
              content: z.string(),
            })
          ),
        })
        .optional(),
      suggestedDocuments: z
        .array(z.string())
        .optional()
        .describe("If we cannot generate, what documents would help"),
    }),
    prompt: `A consultant wants to add this section to their canvas:
"${request.description}"

## Available Content
${relevantDocs.map((d) => `[${d.metadata.filename}]: ${d.content}`).join("\n\n")}

## Context
${request.context || "No additional context"}

## Your Task
1. Determine if we have enough data to generate this section
2. If yes, create the section content with appropriate visualizations
3. If no, explain why and suggest what documents would help

Be creative - if the data can support the request in any way, try to generate something useful.`,
  });

  if (!sectionPlan.canGenerate) {
    return {
      success: false,
      reason: sectionPlan.reason,
      suggestedDocuments: sectionPlan.suggestedDocuments,
    };
  }

  // Generate full section content
  const section = await generateFullSection(sectionPlan, relevantDocs);

  return { success: true, section };
};

// Examples of on-demand requests the system should handle:
// - "Add a section comparing our 401(k) match to industry benchmarks"
// - "Create an executive compensation summary"
// - "I need a compliance risk assessment section"
// - "Add something about the pharmacy carve-out proposal"
// - "Generate a section on the M&A benefits integration timeline"
// - "What can you tell me about the dental plan options?"
```

### Consultant Interaction Flow

```typescript
// The consultant can interact with canvas planning in multiple ways:

interface ConsultantCanvasInteraction {
  // 1. Accept AI-generated plan as-is
  acceptPlan: () => Promise<void>;

  // 2. Modify sections
  modifySection: (sectionId: string, changes: Partial<SectionPlan>) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (sectionIds: string[]) => void;

  // 3. Add sections via natural language
  addSection: (description: string) => Promise<GeneratedSection>;

  // 4. Regenerate with different focus
  regeneratePlan: (newGuidance: string) => Promise<CanvasPlan>;

  // 5. Ask questions about the data
  askAboutData: (question: string) => Promise<string>;

  // 6. Upload more documents mid-flow
  addDocuments: (files: File[]) => Promise<UpdatedPlan>;
}

// Example interactions:
// Consultant: "This looks good but add a section on the 401(k) true-up"
// System: Generates new section, adds to plan

// Consultant: "Actually, skip the benchmarking - we covered that last month"
// System: Removes section, adjusts executive summary

// Consultant: "What else could you generate from this data?"
// System: Shows additional section ideas with confidence levels

// Consultant: "Here's the retirement plan document I forgot"
// System: Re-analyzes, suggests new sections, updates existing ones
```

### Technical Tasks

```
□ Create flexible Canvas Prisma model (no hardcoded section types)
□ Build universal document analysis endpoint
□ Implement DocumentUnderstandingSchema for any content type
□ Build generative canvas planning (no templates)
□ Create on-demand section generation API
□ Build canvas plan review UI with:
  □ AI-generated section suggestions
  □ Natural language "add section" input
  □ Confidence indicators
  □ Document source links
□ Implement mid-flow document upload with re-analysis
□ Build canvas editor UI shell with dynamic sections
□ Implement inline text editing using @repo/editor-doc
□ Add basic visualization components (bar, table)
□ Create source citation display
□ Write tests with diverse document types (health, 401k, HR, etc.)
```

### Acceptance Criteria

- [ ] AI analyzes ANY document type without predefined categories
- [ ] System handles health benefits, 401(k), HR consulting, compliance, etc.
- [ ] Canvas structure is fully generated (no template selection)
- [ ] Section titles and purposes are AI-generated based on content
- [ ] Consultant can add sections via natural language at any time
- [ ] Uploading new documents mid-flow triggers re-analysis
- [ ] Each insight includes source document citations
- [ ] User can edit section text inline
- [ ] Canvas auto-saves every 30 seconds
- [ ] Document analysis completes in <30 seconds
- [ ] Initial section generation completes in <60 seconds

### Feedback Checkpoint 3

**Target Users**: 8-10 consultants **Duration**: 1 week **Questions to Answer**:

- Does the AI correctly understand different document types?
- Can consultants add sections via natural language easily?
- Does the system handle non-health-benefits content well?
- Is the generative approach better than predefined templates?
- What content types did we miss or handle poorly?

**Feedback Mechanism**: Live demo with diverse document sets + survey

---

## Chunk 4: Full Generative Canvas with Live Section Creation

**Duration**: 2 weeks **User Value**: Complete canvas generated from any content, with ability to create new sections
on-the-fly via chat or UI

### Design Philosophy: Truly Generative

The canvas is not "filled in from a template" - it's generated from scratch based on what the AI discovers in the
documents. This means:

- A 401(k) renewal produces a completely different canvas than a health benefits renewal
- Consultants can request ANY section and the AI will attempt to create it
- The system adapts to content we've never seen before
- No code changes needed to support new use cases

### Scope

| User Story | Description                           | Priority |
| ---------- | ------------------------------------- | -------- |
| US-4.3.1   | Generate full canvas from any content | P0       |
| US-4.3.2   | Live section creation on demand       | P0       |
| US-4.3.4   | Intelligent visualizations            | P1       |

### Deliverables

1. **Parallel Section Generation**
   - Generate all planned sections concurrently
   - Real-time progress tracking per section
   - Streaming partial results to UI
   - Handle partial failures gracefully

2. **Live Section Creation**
   - "Add section" button triggers natural language input
   - Chat can create sections: "Add a section about the pharmacy carve-out"
   - AI determines if data supports the request
   - Helpful feedback when data is insufficient

3. **Intelligent Visualizations**
   - AI decides if visualization adds value (not required)
   - Chart type and data automatically configured
   - Graceful fallback to text/tables
   - Custom visualization requests: "Show this as a pie chart"

4. **Enhanced Canvas Editor**
   - Section navigation sidebar
   - Section reordering (drag-and-drop)
   - Section regeneration with different focus
   - Remove/hide sections
   - Version history

### Fully Generative Section Schema

```typescript
import { z } from "zod";

// Section schema with NO predefined types - everything is generated
const GenerativeSectionSchema = z.object({
  id: z.string(),
  title: z.string().describe("AI-generated title specific to content"),
  purpose: z.string().describe("What this section accomplishes"),

  // Content blocks - AI decides what mix to use
  content: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("narrative"),
        text: z.string(),
        tone: z.enum([
          "informative",
          "persuasive",
          "cautionary",
          "celebratory",
        ]),
      }),
      z.object({
        type: z.literal("key_metric"),
        label: z.string(),
        value: z.string(),
        change: z
          .object({
            direction: z.enum(["up", "down", "flat"]),
            amount: z.string(),
            context: z.string(),
          })
          .optional(),
      }),
      z.object({
        type: z.literal("comparison"),
        items: z.array(
          z.object({
            label: z.string(),
            values: z.record(z.string(), z.any()),
          })
        ),
        highlightBest: z.boolean().optional(),
      }),
      z.object({
        type: z.literal("timeline"),
        events: z.array(
          z.object({
            date: z.string(),
            title: z.string(),
            description: z.string(),
          })
        ),
      }),
      z.object({
        type: z.literal("recommendation"),
        title: z.string(),
        description: z.string(),
        impact: z.enum(["high", "medium", "low"]),
        effort: z.enum(["high", "medium", "low"]),
      }),
      z.object({
        type: z.literal("risk"),
        title: z.string(),
        description: z.string(),
        severity: z.enum(["critical", "high", "medium", "low"]),
        mitigation: z.string().optional(),
      }),
      z.object({
        type: z.literal("callout"),
        style: z.enum(["info", "warning", "success", "question"]),
        content: z.string(),
      }),
      z.object({
        type: z.literal("visualization"),
        chartType: z
          .string()
          .describe("AI-determined: bar, line, pie, scatter, etc."),
        title: z.string(),
        data: z.any(),
        insight: z.string().optional(),
      }),
    ])
  ),

  // Source attribution
  sources: z.array(
    z.object({
      documentId: z.string(),
      documentName: z.string(),
      excerpt: z.string().optional(),
      pageOrLocation: z.string().optional(),
    })
  ),

  // Metadata
  confidence: z.number().min(0).max(100),
  generatedAt: z.string(),
  lastModified: z.string().optional(),
});
```

### Live Section Creation via Chat

```typescript
// Integrated with Chunk 5's chat system, but available from Chunk 4
const createSectionFromChat = async (
  canvasId: string,
  userMessage: string,
  chatContext: ChatContext
) => {
  const canvas = await getCanvas(canvasId);
  const bridge = createRAGDatabaseBridge({
    namespace: `benefits-${canvas.clientId}`,
  });

  // Determine intent
  const intent = await classifyIntent(userMessage);

  if (intent.type === "create_section") {
    // Search for relevant content
    const relevantDocs = await bridge.queryDocuments(intent.searchQuery, {
      topK: 20,
    });

    // Check if we can generate this section
    const feasibility = await assessFeasibility(
      intent.description,
      relevantDocs
    );

    if (!feasibility.canGenerate) {
      return {
        type: "clarification_needed",
        message: feasibility.reason,
        suggestions: feasibility.alternatives,
        documentsNeeded: feasibility.missingDocuments,
      };
    }

    // Generate the section
    const section = await generateObject({
      model: models.language("balanced"),
      schema: GenerativeSectionSchema,
      prompt: `Create a canvas section based on this request:
"${userMessage}"

## Available Data
${relevantDocs.map((d) => `[${d.metadata.filename}]: ${d.content}`).join("\n\n")}

## Existing Canvas Context
Title: ${canvas.title}
Current sections: ${canvas.sections.map((s) => s.title).join(", ")}

## Guidelines
- Create a section that fits naturally with the existing canvas
- Use the most appropriate content blocks for the data
- Include visualizations only if they add value
- Cite all sources
- Be specific and actionable`,
    });

    // Add to canvas
    await addSectionToCanvas(canvasId, section);

    return {
      type: "section_created",
      section,
      message: `Created "${section.title}" section with ${section.content.length} content blocks.`,
    };
  }

  // Handle other intents (modify section, ask question, etc.)
  return handleOtherIntent(intent, canvas, chatContext);
};

// Example user requests and system responses:

// User: "Add a section about the 401(k) match comparison"
// System: Creates section with comparison table, key metrics, recommendations

// User: "Can you add something about the COBRA administration issues from the audit?"
// System: Creates risk-focused section with findings, severity ratings, mitigations

// User: "I need a timeline of the M&A benefits integration"
// System: Creates timeline section with key dates, milestones, dependencies

// User: "Add a section on pharmacy costs"
// System: "I found pharmacy data in 3 documents. Should I focus on:
//          1. Cost trends over time
//          2. Comparison to benchmarks
//          3. Specialty drug analysis
//          Or all of the above?"

// User: "What about dental?"
// System: "I don't see dental-specific documents. I found mentions of dental in:
//          - Benefits Summary (page 12) - plan design only
//          - Renewal Letter - rates mentioned but no detail
//          Upload a dental experience report to enable detailed analysis."
```

### Visualization Intelligence

```typescript
// AI decides if/how to visualize - no forced charts
const determineVisualization = async (
  dataPoints: DataPoint[],
  sectionContext: string
) => {
  const decision = await generateObject({
    model: models.language("fast"),
    schema: z.object({
      shouldVisualize: z.boolean(),
      reason: z.string(),
      visualizations: z
        .array(
          z.object({
            type: z.string(),
            title: z.string(),
            dataMapping: z.any(),
            insight: z.string(),
          })
        )
        .optional(),
      alternativePresentation: z.string().optional(),
    }),
    prompt: `Given this data and context, should we create a visualization?

## Data Points
${JSON.stringify(dataPoints, null, 2)}

## Section Context
${sectionContext}

## Guidelines
- Only visualize if it genuinely helps understanding
- A table might be better than a chart
- Key metrics might be better as callout cards
- Sometimes narrative text is clearest
- Don't force a chart just to have one`,
  });

  return decision;
};
```

### Technical Tasks

```
□ Implement GenerativeSectionSchema with discriminated union content blocks
□ Build parallel section generation with streaming progress
□ Create live section creation API (from chat or button)
□ Implement intent classification for section requests
□ Build feasibility assessment for section requests
□ Create intelligent visualization decision system
□ Implement "what else can you generate?" feature
□ Add section regeneration with different focus
□ Build section navigation sidebar
□ Implement section reordering (drag-and-drop)
□ Add visualization components:
  □ Dynamic chart renderer (type determined by AI)
  □ Key metric cards
  □ Comparison tables
  □ Timeline component
  □ Risk/recommendation cards
□ Implement version history
□ Handle generation failures gracefully
□ Add telemetry for section generation patterns
□ Write tests with diverse section creation requests
```

### Acceptance Criteria

- [ ] Canvas generates sections with AI-determined content blocks (not fixed structure)
- [ ] Consultant can create new sections via natural language at any time
- [ ] System provides helpful feedback when data is insufficient for a request
- [ ] "What else can you generate?" shows additional possibilities
- [ ] Visualizations are only added when AI determines they add value
- [ ] Section regeneration with different focus works correctly
- [ ] Parallel generation with streaming progress shows real-time updates
- [ ] Partial failures don't block entire canvas (graceful degradation)
- [ ] All content blocks render correctly (metrics, timelines, risks, etc.)
- [ ] Full canvas generates in <3 minutes
- [ ] On-demand section creation completes in <30 seconds
- [ ] Version history tracks changes

### Feedback Checkpoint 4 (MVP Pilot)

**Target Users**: 15-20 consultants (formal pilot) **Duration**: 2 weeks **Questions to Answer**:

- Does the fully generative approach work for their diverse needs?
- Can they successfully create sections on-demand via natural language?
- How does a 401(k) canvas compare to a health benefits canvas?
- Are the AI-selected visualizations appropriate?
- What requests did the system fail to handle?
- Time savings vs. current process?
- Would they recommend to colleagues?

**Feedback Mechanism**:

- Structured pilot program with diverse use cases
- Weekly check-in calls
- Capture all section creation requests and outcomes
- NPS survey
- Time tracking comparison

**Success Criteria for Continuing**:

- NPS > 30
- > 50% time reduction reported
- 80% of pilot users complete at least 2 canvases
- > 80% success rate on on-demand section creation requests
- Successfully handles at least 3 different content domains (health, retirement, etc.) ${focusAreas.length > 0 ?
  focusAreas.join(', ') : 'No specific focus areas specified'}

## Guidelines

1. Only include insights supported by the available data
2. Choose visualization types that best represent the data shape
3. If data is limited, acknowledge it and provide what insight you can
4. Include specific numbers and cite sources
5. Make it actionable - what should the client do with this information?
6. Confidence should reflect data quality (100 = complete data, 60 = partial)

Generate a compelling, data-driven section.`; };

````

### Add Section Post-Generation

```typescript
// Consultant can add sections after initial generation
const addCustomSection = async (
  canvasId: string,
  request: {
    title: string;
    description: string;
    focusQuery: string; // What to search for in documents
  }
) => {
  const canvas = await getCanvas(canvasId);
  const bridge = createRAGDatabaseBridge({ namespace: `benefits-${canvas.clientId}` });

  // Search for relevant content
  const relevantDocs = await bridge.queryDocuments(request.focusQuery, { topK: 15 });

  if (relevantDocs.length === 0 || relevantDocs[0].score < 0.5) {
    return {
      success: false,
      message: 'Insufficient data found for this topic. Try uploading relevant documents.',
      suggestedDocuments: suggestDocumentsFor(request.focusQuery),
    };
  }

  // Generate the new section
  const section = await generateObject({
    model: models.language('balanced'),
    schema: DynamicSectionSchema,
    prompt: buildCustomSectionPrompt(request, relevantDocs, canvas.extractedData),
  });

  // Add to canvas
  await addSectionToCanvas(canvasId, section);

  return { success: true, section };
};
````

### Technical Tasks

```
□ Implement adaptive section generation with DynamicSectionSchema
□ Build parallel generation orchestrator with partial failure handling
□ Create buildAdaptivePrompt for context-aware generation
□ Implement executive summary generator (synthesizes all sections)
□ Add WebSocket/SSE for real-time progress updates
□ Add telemetry tracking via trackRAGOperation
□ Build section navigation sidebar
□ Implement section reordering (drag-and-drop)
□ Add "Add Section" functionality post-generation
□ Build visualization selector (auto-pick chart type based on data)
□ Implement visualization components:
  □ Bar chart (comparisons)
  □ Line chart (trends over time)
  □ Pie chart (distributions)
  □ Metric card (key numbers)
  □ Trend indicator (YoY changes)
  □ Comparison table (side-by-side)
□ Implement hide/show section toggle
□ Add basic version history (last 5 versions)
□ Handle generation failures gracefully (show partial canvas)
□ Write tests for adaptive generation
```

### Acceptance Criteria

- [ ] Canvas generates sections dynamically based on approved plan
- [ ] Different document sets produce different canvas structures
- [ ] Each section has auto-selected visualizations based on data shape
- [ ] Executive summary synthesizes insights from all sections
- [ ] User can navigate between sections
- [ ] User can reorder sections via drag-and-drop
- [ ] User can add new sections post-generation
- [ ] User can hide/show sections
- [ ] Partial failures don't block entire canvas (graceful degradation)
- [ ] Full canvas generates in <3 minutes
- [ ] Version history tracks last 5 versions

### Feedback Checkpoint 4 (MVP Pilot)

**Target Users**: 15-20 consultants (formal pilot) **Duration**: 2 weeks **Questions to Answer**:

- Does the dynamic canvas structure meet their needs?
- Are the auto-selected visualizations appropriate?
- Can they complete a real pre-renewal using this tool?
- Do different clients produce meaningfully different canvases?
- Is the "add section" feature useful?
- Time savings vs. current process?
- Would they recommend to colleagues?

**Feedback Mechanism**:

- Structured pilot program
- Weekly check-in calls
- NPS survey
- Time tracking comparison
- Compare canvases across different clients

**Success Criteria for Continuing**:

- NPS > 30
- > 50% time reduction reported
- 80% of pilot users complete at least 2 canvases
- Consultants report canvas adapts well to different client situations

---

## Chunk 5: Chat-Based Refinement

**Duration**: 2 weeks **User Value**: Consultants can refine canvas content using natural language commands

### Scope

| User Story | Description           | Priority |
| ---------- | --------------------- | -------- |
| US-4.3.3   | Chat-based refinement | P0       |

### Deliverables

1. **Chat Interface** (using `@repo/ai/ui/react`)
   - Chat panel alongside canvas using `ChatContainer`
   - Message history within session via `MessageList`
   - Typing indicators via `StatusIndicator`
   - Context awareness (current section)

2. **RAG-Enhanced Chat**
   - Query original documents when user asks for more detail
   - Conversation memory to maintain context across messages
   - Source citations when adding new information

3. **AI Refinement Capabilities**
   - Content adjustments ("make more concise")
   - Data updates ("change trend to 8%")
   - Section additions ("add pharmacy analysis") - uses RAG to pull relevant data
   - Tone adjustments ("make more client-friendly")

4. **Change Tracking**
   - Show AI reasoning for changes
   - Before/after diff view
   - Undo/redo for chat-driven changes

### RAG-Enhanced Chat Example

```typescript
import { ChatContainer, useChat } from "@repo/ai/ui/react";
import { createRAGDatabaseBridge } from "@repo/ai/rag";
import { streamText } from "@repo/ai/generation";

// Chat with RAG context for document lookups
const handleChatMessage = async (
  message: string,
  canvasContext: CanvasContext
) => {
  const bridge = createRAGDatabaseBridge({
    namespace: `benefits-${canvasContext.clientId}`,
  });

  // Determine if user is asking for new information from documents
  const needsDocumentLookup = detectDocumentQuery(message);

  let ragContext = "";
  if (needsDocumentLookup) {
    const results = await bridge.queryDocuments(message, { topK: 5 });
    ragContext = `\n\nRelevant document excerpts:\n${results
      .map((r) => `[${r.metadata.documentId}]: ${r.content}`)
      .join("\n\n")}`;
  }

  // Stream response with canvas + document context
  const { textStream } = await streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `You are helping refine a pre-renewal benefits canvas.
Current section: ${canvasContext.currentSection}
${ragContext}`,
    messages: canvasContext.chatHistory,
  });

  return textStream;
};
```

### Technical Tasks

```
□ Add chat panel to canvas editor layout using ChatContainer
□ Integrate useChat hook for state management
□ Create chat API endpoint with streaming support
□ Implement RAG query for document lookups in chat
□ Add conversation memory using @repo/ai/rag/conversation-memory
□ Implement context-aware prompting (current section, extracted data)
□ Build refinement command parser
□ Add content modification logic with diff generation
□ Implement change diff view
□ Add undo/redo for chat changes
□ Create chat session persistence (link to canvas)
□ Write tests for refinement commands
□ Test edge cases and error handling
```

### Acceptance Criteria

- [ ] Chat panel displays alongside canvas
- [ ] AI responds to refinement requests in <3 seconds
- [ ] AI can modify section content based on instructions
- [ ] AI can update numerical assumptions
- [ ] Changes show before/after comparison
- [ ] User can undo chat-driven changes
- [ ] Chat history persists within session

### Feedback Checkpoint 5

**Target Users**: Pilot users from Chunk 4 **Duration**: 1 week **Questions to Answer**:

- What refinement commands are most useful?
- Is the AI understanding their requests?
- Is the response time acceptable?
- Do they trust the AI-driven changes?
- What commands are they trying that don't work?

**Feedback Mechanism**: Usage analytics + interviews

---

## Chunk 6: Export & Presentation

**Duration**: 2 weeks **User Value**: Export canvas to PowerPoint/PDF for client delivery

### Scope

| User Story | Description              | Priority |
| ---------- | ------------------------ | -------- |
| US-4.4.1   | Client presentation mode | P2       |
| US-4.4.2   | Export to PowerPoint     | P1       |
| US-4.4.3   | PDF export               | P2       |

### Deliverables

1. **PowerPoint Export** (using `@repo/pptx-editor`)
   - Full canvas to PPTX file via `PptxWriter`
   - Preserve formatting and charts
   - OneDigital branding template
   - Editable output
   - Progress tracking via `usePptxExport`

2. **PDF Export**
   - Full canvas to PDF file
   - High-quality chart rendering
   - Table of contents
   - Print-optimized layout

3. **Presentation Mode**
   - Full-screen view
   - Section-by-section navigation
   - Hidden editing controls
   - Presenter notes

### PPTX Export Implementation

```typescript
import { PptxWriter } from "@repo/pptx-editor/writer";
import { usePptxExport } from "@repo/pptx-editor";
import { aiSdk } from "@repo/analytics/shared/emitters";

// Generate PPTX from canvas data
export async function exportCanvasToPptx(
  canvas: PreRenewalCanvas
): Promise<Blob> {
  const pptx = new PptxWriter();

  // Set metadata
  pptx.setMetadata({
    title: `Benefits Review - ${canvas.clientName}`,
    creator: "OneDigital",
    company: "OneDigital",
    description: `Pre-Renewal Analysis generated on ${new Date().toLocaleDateString()}`,
  });

  // Title slide
  pptx.addSlide([
    {
      x: 914400, // 1 inch in EMUs
      y: 2743200, // 3 inches
      width: 7315200, // 8 inches
      height: 914400,
      text: canvas.title,
      fontSize: 4400,
      bold: true,
      align: "center",
    },
    {
      x: 914400,
      y: 3657600,
      width: 7315200,
      height: 457200,
      text: canvas.clientName,
      fontSize: 2400,
      align: "center",
    },
  ]);

  // Section slides
  for (const section of canvas.sections) {
    pptx.addSlide([
      {
        x: 914400,
        y: 457200,
        width: 7315200,
        height: 914400,
        text: section.name,
        fontSize: 3200,
        bold: true,
      },
    ]);

    pptx.addSlide([
      {
        x: 914400,
        y: 914400,
        width: 7315200,
        height: 5486400,
        text: section.content,
        fontSize: 1800,
      },
    ]);
  }

  // Track export event
  aiSdk.artifactPublished({
    artifact_id: canvas.id,
    artifact_type: "document",
    publish_format: "pptx",
    user_id: canvas.userId,
  });

  return await pptx.generate();
}
```

### Technical Tasks

```
□ Integrate @repo/pptx-editor PptxWriter for PPTX generation
□ Create PPTX template with OneDigital branding and styling
□ Implement chart-to-PPTX conversion (render charts as images)
□ Add usePptxExport hook for progress tracking
□ Add @react-pdf/renderer for PDF generation
□ Create PDF template with styling
□ Build presentation mode UI using @repo/uni-ui
□ Add presenter notes functionality
□ Track export events via @repo/analytics
□ Implement export progress indicators
□ Write tests for export accuracy
```

### Acceptance Criteria

- [ ] PPTX export completes in <30 seconds
- [ ] PPTX preserves all charts and formatting
- [ ] PPTX is editable in Microsoft PowerPoint
- [ ] PDF export completes in <15 seconds
- [ ] PDF has table of contents with links
- [ ] Presentation mode hides all editing controls
- [ ] Presentation mode supports keyboard navigation

### Feedback Checkpoint 6

**Target Users**: Pilot users **Duration**: 1 week **Questions to Answer**:

- Is PPTX export quality acceptable for clients?
- Do they need to make edits after export?
- Is PDF useful or redundant with PPTX?
- Is presentation mode useful for screen sharing?
- Any branding/formatting issues?

**Feedback Mechanism**: Export quality review + survey

---

## Chunk 7: Client Management & Polish

**Duration**: 2 weeks **User Value**: Manage client portfolios and track renewal history

### Scope

| User Story | Description                      | Priority |
| ---------- | -------------------------------- | -------- |
| US-4.5.1   | Client profile management        | P2       |
| US-4.1.2   | Auto-suggest document categories | P1       |
| US-4.1.3   | Email thread processing          | P2       |
| US-4.2.2   | Enhanced benchmarking            | P1       |

### Deliverables

1. **Client Profiles**
   - Create/edit client profiles
   - Associate canvases with clients
   - View historical canvases
   - Year-over-year comparison

2. **Enhanced Document Processing**
   - Auto-categorization using AI classification
   - Email (.eml, .msg) processing
   - Improved extraction accuracy

3. **Enhanced Benchmarking with Resilience**
   - Industry-specific benchmarks from multiple providers
   - Geographic adjustments
   - Circuit breaker for external benchmark APIs
   - Graceful degradation to cached data

4. **Polish & Performance**
   - Loading state improvements
   - Error handling refinement
   - Performance optimization
   - Accessibility audit fixes

### Auto-Categorization Pattern

```typescript
import { generateEnum, aiSchemas } from "@repo/ai/generation";

// Use AI to classify document type
const categorizeDocument = async (filename: string, contentPreview: string) => {
  const category = await generateEnum(
    `Classify this benefits document based on filename and content preview:
    Filename: ${filename}
    Preview: ${contentPreview.slice(0, 500)}`,
    [
      "CARRIER_RENEWAL",
      "CLAIMS_DATA",
      "CENSUS_ENROLLMENT",
      "PRIOR_PRESENTATION",
      "CORRESPONDENCE",
      "BENCHMARKING",
      "OTHER",
    ]
  );
  return category;
};
```

### Resilient Benchmark Service

```typescript
import {
  executeWithCircuitBreaker,
  executeWithFallback,
} from "@repo/ai/server/rag";
import { errorConfigFragments } from "@repo/ai";

// Fetch benchmarks with circuit breaker and fallback
const fetchBenchmarks = async (
  industry: string,
  size: number,
  region: string
) => {
  // Try primary provider with circuit breaker
  const mercerData = await executeWithCircuitBreaker(
    () => fetchMercerBenchmarks(industry, size, region),
    "mercer-api",
    { failureThreshold: 3, recoveryTimeout: 60000 }
  );

  if (mercerData) return mercerData;

  // Fallback chain: Kaiser -> SHRM -> cached data
  return executeWithFallback(
    () => fetchKaiserBenchmarks(industry, region),
    () => fetchSHRMBenchmarks(industry),
    () => getCachedBenchmarks(industry, size) // Last resort
  );
};
```

### Technical Tasks

```
□ Create BenefitsClient Prisma model
□ Build client management UI
□ Implement client-canvas association
□ Add year-over-year comparison view
□ Build document auto-categorization using generateEnum
□ Add email parsing (mailparser)
□ Implement benchmark service with circuit breaker
□ Add fallback chain for benchmark providers
□ Set up benchmark data caching layer
□ Performance profiling and fixes
□ Accessibility audit and fixes
□ Error handling improvements using errorConfigFragments
□ Write comprehensive E2E tests
```

### Acceptance Criteria

- [ ] User can create and manage client profiles
- [ ] Canvases are linked to client profiles
- [ ] User can view historical canvases for a client
- [ ] Documents auto-categorize with >80% accuracy
- [ ] Email attachments are extracted and processed
- [ ] Benchmarks adjust for industry and geography
- [ ] WCAG 2.1 AA compliance verified
- [ ] All P0 bugs from pilot are resolved

### Feedback Checkpoint 7 (Pre-GA)

**Target Users**: All pilot users + stakeholders **Duration**: 1 week **Questions to Answer**:

- Is the product ready for general availability?
- What are the remaining blockers?
- What should be prioritized post-GA?
- Final NPS and satisfaction scores
- Training and documentation needs

**Feedback Mechanism**: Final pilot review + go/no-go decision

---

## Dependency Map

```
Chunk 1 (Upload) ─────────────────────────────────────┐
       │                                               │
       ▼                                               │
Chunk 2 (Extraction) ─────────────────────────────────┤
       │                                               │
       ▼                                               │
Chunk 3 (Single Section) ─────────────────────────────┤
       │                                               │
       ▼                                               │
Chunk 4 (Full Canvas) ────────┬───────────────────────┤
       │                      │                        │
       ▼                      ▼                        │
Chunk 5 (Chat)          Chunk 6 (Export)              │
       │                      │                        │
       └──────────┬───────────┘                        │
                  │                                    │
                  ▼                                    │
            Chunk 7 (Polish) ◄─────────────────────────┘
                  │
                  ▼
              [GA Release]
```

**Parallel Work Opportunities:**

- Chunks 5 and 6 can run in parallel after Chunk 4
- Design work for later chunks can happen during earlier implementation
- Benchmark data sourcing can happen throughout

---

## Team Allocation

| Role         | Chunk 1-2           | Chunk 3-4          | Chunk 5-6         | Chunk 7             |
| ------------ | ------------------- | ------------------ | ----------------- | ------------------- |
| **Frontend** | Upload UI, Preview  | Canvas Editor      | Chat UI, Export   | Client Mgmt, Polish |
| **Backend**  | Storage, Parsing    | Canvas API         | Chat API, Export  | Benchmark Service   |
| **AI/ML**    | Extraction Pipeline | Section Generation | Refinement        | Auto-categorization |
| **Design**   | Upload Flow         | Canvas Editor      | Export Templates  | Client Dashboard    |
| **QA**       | Upload Tests        | Canvas Tests       | Integration Tests | E2E + A11y          |

---

## Risk Mitigation by Chunk

| Chunk | Key Risk                     | Mitigation                                  |
| ----- | ---------------------------- | ------------------------------------------- |
| 1     | File parsing failures        | Multi-parser fallback, clear error messages |
| 2     | Low extraction accuracy      | Human review UI, accuracy benchmarks        |
| 3     | Poor section quality         | Multiple prompt iterations, user feedback   |
| 4     | Slow generation time         | Parallel section generation, caching        |
| 5     | AI misunderstanding commands | Intent classification, confirmation prompts |
| 6     | Export formatting issues     | Template testing, multiple output checks    |
| 7     | Performance at scale         | Load testing, optimization sprint           |

---

## Success Metrics by Chunk

| Chunk | Key Metric                  | Target  |
| ----- | --------------------------- | ------- |
| 1     | Upload success rate         | >99%    |
| 2     | Extraction accuracy         | >80%    |
| 3     | Section usefulness rating   | 4.0/5.0 |
| 4     | Full canvas completion rate | >90%    |
| 5     | Chat command success rate   | >85%    |
| 6     | Export quality rating       | 4.0/5.0 |
| 7     | Overall NPS                 | >50     |

---

## Go/No-Go Criteria

### After Chunk 4 (MVP Pilot Decision)

- [ ] > 50% time reduction vs. manual process
- [ ] NPS > 30
- [ ] No critical security issues
- [ ] > 80% pilot users complete 2+ canvases

### Before GA (After Chunk 7)

- [ ] NPS > 50
- [ ] All P0 bugs resolved
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Support team trained
- [ ] Stakeholder sign-off

---

## Appendix: User Story to Chunk Mapping

| User Story | Chunk   | Notes                                                   |
| ---------- | ------- | ------------------------------------------------------- |
| US-4.1.1   | 1       | Core upload functionality                               |
| US-4.1.2   | 1, 7    | Basic in 1, auto-suggest in 7                           |
| US-4.1.3   | 7       | Deferred - email processing                             |
| US-4.2.1   | 2       | Core extraction                                         |
| US-4.2.2   | 3, 7    | Basic in 3, enhanced in 7                               |
| US-4.2.3   | 4       | Part of Strategic Vision section                        |
| US-4.2.4   | 4       | Part of Risk Analysis section                           |
| US-4.3.1   | 3, 4    | Planning in 3, full generation in 4 (dynamic structure) |
| US-4.3.2   | 4       | Section customization, add/remove sections              |
| US-4.3.3   | 5       | Chat refinement                                         |
| US-4.3.4   | 3, 4    | Basic in 3, full dynamic visualizations in 4            |
| US-4.4.1   | 6       | Presentation mode                                       |
| US-4.4.2   | 6       | PPTX export                                             |
| US-4.4.3   | 6       | PDF export                                              |
| US-4.5.1   | 7       | Client profiles                                         |
| US-4.5.2   | Post-GA | Renewal calendar (Phase 4)                              |

---

## Revision History

| Version | Date       | Author      | Changes                                                                                                                                                                                                                                                                                                                                                             |
| ------- | ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2025-12-04 | Engineering | Initial implementation plan                                                                                                                                                                                                                                                                                                                                         |
| 1.1     | 2025-12-04 | Engineering | Added RAG architecture overview; Updated Chunks 2, 3, 5 to leverage existing `@repo/ai/rag` infrastructure                                                                                                                                                                                                                                                          |
| 1.2     | 2025-12-04 | Engineering | Added comprehensive `@repo/ai` patterns section                                                                                                                                                                                                                                                                                                                     |
| 1.3     | 2025-12-04 | Engineering | Added Platform Packages Overview section                                                                                                                                                                                                                                                                                                                            |
| 1.4     | 2025-12-04 | Engineering | Removed Collaboration & Sharing chunk (was Chunk 7); Renumbered chunks; Updated timeline to 14 weeks                                                                                                                                                                                                                                                                |
| 1.5     | 2025-12-04 | Engineering | **Major redesign of Chunks 3 & 4 for dynamic canvas generation**: Canvas structure now adapts to uploaded documents rather than fixed 6-section template; Added AI-powered canvas planning with consultant approval flow; Sections only generate where sufficient data exists; Added confidence scoring, data gap identification, and "add section" post-generation |
