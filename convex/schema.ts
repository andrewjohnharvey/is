import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const canvasStatusValidator = v.union(
  v.literal("draft"),
  v.literal("in_review"),
  v.literal("published")
);

export const canvasTypeValidator = v.union(
  v.literal("general"),
  v.literal("pre_renewal"),
  v.literal("renewal"),
  v.literal("post_renewal"),
  v.literal("workforce_investment"),
  v.literal("benchmarking"),
  v.literal("strategic_roadmap")
);

// Generation phase for canvas creation workflow
export const generationPhaseValidator = v.union(
  v.literal("idle"),
  v.literal("analyzing"),
  v.literal("planning"),
  v.literal("generating"),
  v.literal("completed"),
  v.literal("failed")
);

// Plan section status
export const planSectionStatusValidator = v.union(
  v.literal("pending"),
  v.literal("generating"),
  v.literal("generated"),
  v.literal("failed")
);

// Canvas plan status
export const canvasPlanStatusValidator = v.union(
  v.literal("draft"),
  v.literal("approved"),
  v.literal("generating"),
  v.literal("completed")
);

// Content block types for generated sections
export const contentBlockTypeValidator = v.union(
  v.literal("narrative"),
  v.literal("key_metric"),
  v.literal("comparison"),
  v.literal("timeline"),
  v.literal("recommendation"),
  v.literal("risk"),
  v.literal("callout"),
  v.literal("visualization")
);

// Callout style types
export const calloutStyleValidator = v.union(
  v.literal("info"),
  v.literal("warning"),
  v.literal("success"),
  v.literal("question")
);

// Data point types for document analysis
export const dataPointTypeValidator = v.union(
  v.literal("currency"),
  v.literal("percentage"),
  v.literal("count"),
  v.literal("date"),
  v.literal("text"),
  v.literal("comparison")
);

export default defineSchema({
  clients: defineTable({
    name: v.string(),
    address: v.string(),
    sicCode: v.string(),
    sicDescription: v.string(),
    employeeCount: v.number(),
  })
    .index("by_name", ["name"])
    .searchIndex("search_name", {
      searchField: "name",
    }),

  canvases: defineTable({
    clientId: v.id("clients"),
    name: v.string(),
    canvasType: v.optional(canvasTypeValidator),
    status: canvasStatusValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_client_and_status", ["clientId", "status"]),

  documents: defineTable({
    clientId: v.id("clients"),
    canvasId: v.id("canvases"),
    filename: v.string(),
    fileType: v.string(),
    size: v.number(),
    storageId: v.id("_storage"),
    uploadedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_canvas", ["canvasId"]),

  // Document chunks for tracking processed content
  documentChunks: defineTable({
    documentId: v.id("documents"),
    canvasId: v.id("canvases"),
    clientId: v.id("clients"),
    chunkIndex: v.number(),
    contentType: v.union(v.literal("text"), v.literal("image")),
    content: v.string(),
    slideNumber: v.optional(v.number()),
    pageNumber: v.optional(v.number()),
    imageStorageId: v.optional(v.id("_storage")),
    processedAt: v.number(),
  })
    .index("by_document", ["documentId"])
    .index("by_canvas", ["canvasId"]),

  // Processing status tracking for real-time UI updates
  documentProcessingStatus: defineTable({
    documentId: v.id("documents"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    chunksProcessed: v.number(),
    totalChunks: v.number(),
    error: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  }).index("by_document", ["documentId"]),

  // ============================================================================
  // GENERATIVE CANVAS TABLES
  // ============================================================================

  // Document analysis results - AI understanding of uploaded documents
  documentAnalysis: defineTable({
    canvasId: v.id("canvases"),
    // Per-document analysis
    documents: v.array(
      v.object({
        documentId: v.string(), // Store as string to handle both Id and external refs
        filename: v.string(),
        primaryDomain: v.string(), // e.g., "Health Benefits", "401(k) Retirement"
        topics: v.array(v.string()),
        dataPoints: v.array(
          v.object({
            name: v.string(),
            type: dataPointTypeValidator,
            value: v.any(),
            context: v.string(),
          })
        ),
        keyInsights: v.array(v.string()),
        relatedDocuments: v.array(v.string()),
      })
    ),
    // Cross-document themes
    overallThemes: v.array(
      v.object({
        theme: v.string(),
        relevance: v.number(), // 0-100
        supportingDocuments: v.array(v.string()),
      })
    ),
    suggestedCanvasFocus: v.string(),
    analyzedAt: v.number(),
  }).index("by_canvas", ["canvasId"]),

  // Canvas generation plan - AI-proposed structure, consultant-modifiable
  canvasPlans: defineTable({
    canvasId: v.id("canvases"),
    canvasTitle: v.string(),
    canvasPurpose: v.string(),
    // Planned sections
    sections: v.array(
      v.object({
        id: v.string(), // UUID for client-side tracking
        title: v.string(),
        purpose: v.string(),
        keyQuestions: v.array(v.string()),
        dataSourceIds: v.array(v.string()), // Document IDs
        suggestedContent: v.object({
          narrativePoints: v.array(v.string()),
          visualizations: v.array(
            v.object({
              type: v.string(), // bar, line, pie, table, etc.
              title: v.string(),
              dataDescription: v.string(),
              rationale: v.string(),
            })
          ),
          callouts: v.array(
            v.object({
              type: v.string(), // insight, warning, recommendation, question
              content: v.string(),
            })
          ),
        }),
        confidence: v.number(), // 0-100
        generationPriority: v.number(), // 1 = generate first
        status: planSectionStatusValidator,
      })
    ),
    // Additional section ideas AI couldn't fully generate
    additionalSectionIdeas: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        wouldRequire: v.string(), // What data/docs would enable this
      })
    ),
    status: canvasPlanStatusValidator,
    consultantGuidance: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_canvas", ["canvasId"]),

  // Generated section content - actual rendered content
  canvasSections: defineTable({
    canvasId: v.id("canvases"),
    planSectionId: v.string(), // Links to canvasPlans.sections[].id
    title: v.string(),
    purpose: v.string(),
    // Content blocks - flexible structure for different block types
    content: v.array(
      v.object({
        type: contentBlockTypeValidator,
        data: v.any(), // Type-specific content based on type field
      })
    ),
    // Source attribution for citations
    sources: v.array(
      v.object({
        documentId: v.string(),
        documentName: v.string(),
        excerpt: v.optional(v.string()),
        pageOrLocation: v.optional(v.string()),
      })
    ),
    confidence: v.number(), // 0-100
    generatedAt: v.number(),
    lastModified: v.optional(v.number()),
    order: v.number(), // Display order in canvas
  })
    .index("by_canvas", ["canvasId"])
    .index("by_canvas_order", ["canvasId", "order"]),

  // Real-time generation status - for live UI updates via Convex subscriptions
  canvasGenerationStatus: defineTable({
    canvasId: v.id("canvases"),
    phase: generationPhaseValidator,
    progress: v.optional(v.number()), // 0-100
    currentStep: v.optional(v.string()), // Human-readable status message
    sectionsTotal: v.optional(v.number()),
    sectionsCompleted: v.optional(v.number()),
    currentSectionTitle: v.optional(v.string()),
    error: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  }).index("by_canvas", ["canvasId"]),

  // Plan chat messages - for AI-assisted plan refinement
  planChatMessages: defineTable({
    canvasId: v.id("canvases"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    // Tool calls executed during this message (for assistant messages)
    toolCalls: v.optional(
      v.array(
        v.object({
          toolName: v.string(),
          args: v.any(),
          result: v.optional(v.any()),
        })
      )
    ),
    createdAt: v.number(),
  }).index("by_canvas", ["canvasId"]),
});
