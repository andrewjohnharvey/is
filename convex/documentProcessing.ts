"use node";

import { defaultChunker } from "@convex-dev/rag";
import { generateText } from "ai";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalAction } from "./_generated/server";
import { gpt51Mini, rag } from "./rag";

// Note: Queries and mutations are defined in documentProcessingHelpers.ts
// (they run in V8 runtime, not Node.js runtime)
// Frontend should import from api.documentProcessingHelpers instead

/**
 * Extracted content from a document
 */
interface ExtractedContent {
  type: "text" | "image";
  text?: string;
  imageData?: string;
  mimeType?: string;
  slideNumber?: number;
  pageNumber?: number;
}

/**
 * Processed chunk ready for RAG
 */
interface ProcessedChunk {
  text: string;
  contentType: "text" | "image";
  slideNumber?: number;
  pageNumber?: number;
  imageStorageId?: Id<"_storage">;
}

/**
 * Result type for document processing
 */
interface ProcessingResult {
  success: boolean;
  chunksProcessed: number;
}

// ============================================================================
// Main Document Processing Action
// ============================================================================

/**
 * Process an uploaded document: extract text/images, generate embeddings, store in RAG.
 * This action is triggered immediately after document upload.
 */
export const processDocument = action({
  args: {
    documentId: v.id("documents"),
    canvasId: v.id("canvases"),
    clientId: v.id("clients"),
  },
  handler: async (ctx, args): Promise<ProcessingResult> => {
    // 1. Initialize processing status
    await ctx.runMutation(
      internal.documentProcessingHelpers.initProcessingStatus,
      {
        documentId: args.documentId,
      }
    );

    try {
      // 2. Get document metadata
      const document = await ctx.runQuery(
        internal.documentProcessingHelpers.getDocument,
        {
          documentId: args.documentId,
        }
      );

      if (!document) {
        throw new Error("Document not found");
      }

      // 3. Get file URL and download
      const fileUrl = await ctx.storage.getUrl(document.storageId);
      if (!fileUrl) {
        throw new Error("Could not retrieve file URL");
      }

      // Update status to processing
      await ctx.runMutation(
        internal.documentProcessingHelpers.updateProcessingStatus,
        {
          documentId: args.documentId,
          status: "processing",
          startedAt: Date.now(),
        }
      );

      // 4. Download file
      const response = await fetch(fileUrl);
      const fileBuffer = await response.arrayBuffer();

      // 5. Extract content based on file type
      const extractedContent = await extractDocumentContent(
        fileBuffer,
        document.fileType,
        document.filename
      );

      // 6. Process images with GPT-5.1 Mini Vision to get descriptions
      const processedChunks = await processContentWithVision(
        ctx,
        extractedContent
      );

      // Update progress
      await ctx.runMutation(
        internal.documentProcessingHelpers.updateProcessingStatus,
        {
          documentId: args.documentId,
          status: "processing",
          totalChunks: processedChunks.length,
        }
      );

      // 7. Add to RAG with canvas-scoped namespace
      // Chunk the text properly before adding to RAG
      if (processedChunks.length > 0) {
        const combinedText = processedChunks.map((c) => c.text).join("\n\n");
        console.log(
          `[RAG] Processing ${processedChunks.length} content pieces for document ${args.documentId}`
        );
        console.log(`[RAG] Combined text length: ${combinedText.length} chars`);

        // Use defaultChunker to split into appropriate sized chunks for embedding
        const ragChunks = defaultChunker(combinedText, {
          minLines: 1,
          minCharsSoftLimit: 100,
          maxCharsSoftLimit: 1000,
          maxCharsHardLimit: 8000, // Keep under token limits
          delimiter: "\n\n",
        });

        console.log(
          `[RAG] Split into ${ragChunks.length} chunks for embedding`
        );

        // Process chunks in batches to avoid rate limits
        const BATCH_SIZE = 25;
        const DELAY_BETWEEN_BATCHES_MS = 1000; // 1 second delay to avoid rate limits
        const totalBatches = Math.ceil(ragChunks.length / BATCH_SIZE);

        for (let i = 0; i < ragChunks.length; i += BATCH_SIZE) {
          const batchNum = Math.floor(i / BATCH_SIZE) + 1;
          const batch = ragChunks.slice(i, i + BATCH_SIZE);

          // Update progress before processing batch
          await ctx.runMutation(
            internal.documentProcessingHelpers.updateProcessingStatus,
            {
              documentId: args.documentId,
              status: "processing",
              chunksProcessed: i,
              totalChunks: ragChunks.length,
            }
          );

          console.log(
            `[RAG] Processing batch ${batchNum}/${totalBatches} (${batch.length} chunks, ${i}/${ragChunks.length} complete)`
          );

          try {
            // Use a unique key for each batch to avoid conflicts
            // First batch uses documentId as key, subsequent batches append batch number
            const batchKey =
              i === 0
                ? args.documentId
                : `${args.documentId}_batch_${batchNum}`;
            await rag.add(ctx, {
              namespace: args.canvasId,
              key: batchKey,
              chunks: batch,
            });
            console.log(`[RAG] Batch ${batchNum} completed`);
          } catch (ragError) {
            console.error(
              `[RAG] Error adding batch ${batchNum} to RAG:`,
              ragError
            );
            throw ragError;
          }

          // Add delay between batches to avoid rate limits (skip after last batch)
          if (i + BATCH_SIZE < ragChunks.length) {
            await new Promise((resolve) =>
              setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS)
            );
          }
        }

        console.log(
          `[RAG] Successfully added all ${ragChunks.length} chunks to RAG`
        );
      }

      // 8. Store chunk records for reference (in batches for speed)
      const CHUNK_STORE_BATCH_SIZE = 100;
      for (let i = 0; i < processedChunks.length; i += CHUNK_STORE_BATCH_SIZE) {
        const batch = processedChunks.slice(i, i + CHUNK_STORE_BATCH_SIZE);
        await ctx.runMutation(
          internal.documentProcessingHelpers.storeChunksBatch,
          {
            documentId: args.documentId,
            canvasId: args.canvasId,
            clientId: args.clientId,
            chunks: batch.map((chunk, idx) => ({
              chunkIndex: i + idx,
              contentType: chunk.contentType,
              content: chunk.text,
              slideNumber: chunk.slideNumber,
              pageNumber: chunk.pageNumber,
              imageStorageId: chunk.imageStorageId,
            })),
          }
        );
      }

      // 9. Mark processing as complete
      await ctx.runMutation(
        internal.documentProcessingHelpers.updateProcessingStatus,
        {
          documentId: args.documentId,
          status: "completed",
          chunksProcessed: processedChunks.length,
          totalChunks: processedChunks.length,
          completedAt: Date.now(),
        }
      );

      return { success: true, chunksProcessed: processedChunks.length };
    } catch (error) {
      // Handle failure
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await ctx.runMutation(
        internal.documentProcessingHelpers.updateProcessingStatus,
        {
          documentId: args.documentId,
          status: "failed",
          error: errorMessage,
          completedAt: Date.now(),
        }
      );
      throw error;
    }
  },
});

/**
 * Retry processing for a failed document.
 */
export const retryProcessing = action({
  args: {
    documentId: v.id("documents"),
    canvasId: v.id("canvases"),
    clientId: v.id("clients"),
  },
  handler: async (ctx, args): Promise<ProcessingResult> => {
    // Delete existing chunks for this document
    await ctx.runMutation(
      internal.documentProcessingHelpers.deleteChunksForDocument,
      {
        documentId: args.documentId,
      }
    );

    // Reset status
    await ctx.runMutation(
      internal.documentProcessingHelpers.resetProcessingStatus,
      {
        documentId: args.documentId,
      }
    );

    // Re-run processing by calling the action directly
    const result = await ctx.runAction(
      internal.documentProcessing.processDocumentInternal,
      args
    );
    return result as ProcessingResult;
  },
});

/**
 * Internal version of processDocument for retry calls.
 */
export const processDocumentInternal = internalAction({
  args: {
    documentId: v.id("documents"),
    canvasId: v.id("canvases"),
    clientId: v.id("clients"),
  },
  handler: async (ctx, args): Promise<ProcessingResult> => {
    // Same logic as processDocument
    await ctx.runMutation(
      internal.documentProcessingHelpers.initProcessingStatus,
      {
        documentId: args.documentId,
      }
    );

    try {
      const document = await ctx.runQuery(
        internal.documentProcessingHelpers.getDocument,
        { documentId: args.documentId }
      );

      if (!document) {
        throw new Error("Document not found");
      }

      const fileUrl = await ctx.storage.getUrl(document.storageId);
      if (!fileUrl) {
        throw new Error("Could not retrieve file URL");
      }

      await ctx.runMutation(
        internal.documentProcessingHelpers.updateProcessingStatus,
        {
          documentId: args.documentId,
          status: "processing",
          startedAt: Date.now(),
        }
      );

      const response = await fetch(fileUrl);
      const fileBuffer = await response.arrayBuffer();

      const extractedContent = await extractDocumentContent(
        fileBuffer,
        document.fileType,
        document.filename
      );

      const processedChunks = await processContentWithVision(
        ctx,
        extractedContent
      );

      await ctx.runMutation(
        internal.documentProcessingHelpers.updateProcessingStatus,
        {
          documentId: args.documentId,
          status: "processing",
          totalChunks: processedChunks.length,
        }
      );

      if (processedChunks.length > 0) {
        const combinedText = processedChunks.map((c) => c.text).join("\n\n");
        await rag.add(ctx, {
          namespace: args.canvasId,
          key: args.documentId,
          text: combinedText,
        });
      }

      for (const [index, chunk] of processedChunks.entries()) {
        await ctx.runMutation(internal.documentProcessingHelpers.storeChunk, {
          documentId: args.documentId,
          canvasId: args.canvasId,
          clientId: args.clientId,
          chunkIndex: index,
          contentType: chunk.contentType,
          content: chunk.text,
          slideNumber: chunk.slideNumber,
          pageNumber: chunk.pageNumber,
          imageStorageId: chunk.imageStorageId,
        });

        await ctx.runMutation(
          internal.documentProcessingHelpers.updateProcessingStatus,
          {
            documentId: args.documentId,
            status: "processing",
            chunksProcessed: index + 1,
          }
        );
      }

      await ctx.runMutation(
        internal.documentProcessingHelpers.updateProcessingStatus,
        {
          documentId: args.documentId,
          status: "completed",
          chunksProcessed: processedChunks.length,
          totalChunks: processedChunks.length,
          completedAt: Date.now(),
        }
      );

      return { success: true, chunksProcessed: processedChunks.length };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await ctx.runMutation(
        internal.documentProcessingHelpers.updateProcessingStatus,
        {
          documentId: args.documentId,
          status: "failed",
          error: errorMessage,
          completedAt: Date.now(),
        }
      );
      throw error;
    }
  },
});

// ============================================================================
// Content Extraction Functions
// ============================================================================

/**
 * Extract content from document based on file type.
 */
async function extractDocumentContent(
  buffer: ArrayBuffer,
  fileType: string,
  filename: string
): Promise<ExtractedContent[]> {
  const contents: ExtractedContent[] = [];

  // Determine file type
  const isPDF = fileType.includes("pdf");
  const isPPTX =
    fileType.includes("powerpoint") ||
    fileType.includes("presentation") ||
    filename.toLowerCase().endsWith(".pptx");
  const isImage = fileType.startsWith("image/");

  if (isPDF) {
    // PDF extraction using pdf-parse
    try {
      // pdf-parse uses CommonJS, so we need to handle the import carefully
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic import handling for CommonJS module
      const pdfParseModule = (await import("pdf-parse")) as any;
      const parse = pdfParseModule.default ?? pdfParseModule;
      const data = await parse(Buffer.from(buffer));

      // Split by form feed (page separator) or double newlines
      const pages = data.text.split(/\f/).filter((p: string) => p.trim());

      for (const [pageIndex, pageText] of pages.entries()) {
        if (pageText.trim()) {
          contents.push({
            type: "text",
            text: pageText.trim(),
            pageNumber: pageIndex + 1,
          });
        }
      }
    } catch (error) {
      console.error("PDF parsing error:", error);
      // Fallback: extract any readable text
      const textContent = new TextDecoder("utf-8", { fatal: false }).decode(
        buffer
      );
      if (textContent.trim()) {
        contents.push({
          type: "text",
          text: textContent.trim(),
        });
      }
    }
  } else if (isPPTX) {
    // PPTX extraction using pptx-parser
    try {
      // Dynamic import for pptx-parser
      const pptxParser = await import("pptx-parser");
      const parse = pptxParser.default || pptxParser;
      const pptx = await parse(Buffer.from(buffer));

      // pptx-parser returns slides with text and images
      if (pptx && pptx.slides) {
        for (const [slideIndex, slide] of pptx.slides.entries()) {
          // Extract text from slide
          if (slide.text) {
            contents.push({
              type: "text",
              text: slide.text,
              slideNumber: slideIndex + 1,
            });
          }

          // Extract images from slide
          if (slide.images && Array.isArray(slide.images)) {
            for (const image of slide.images) {
              if (image.data) {
                contents.push({
                  type: "image",
                  imageData:
                    typeof image.data === "string"
                      ? image.data
                      : Buffer.from(image.data).toString("base64"),
                  mimeType: image.mimeType || "image/png",
                  slideNumber: slideIndex + 1,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("PPTX parsing error:", error);
      // Fallback: try to extract any text
      const textContent = new TextDecoder("utf-8", { fatal: false }).decode(
        buffer
      );
      const cleanText = textContent.replace(/[^\x20-\x7E\n\r\t]/g, " ").trim();
      if (cleanText.length > 50) {
        contents.push({
          type: "text",
          text: cleanText,
        });
      }
    }
  } else if (isImage) {
    // Direct image - store as image type for vision processing
    const base64 = Buffer.from(buffer).toString("base64");
    contents.push({
      type: "image",
      imageData: base64,
      mimeType: fileType,
    });
  } else {
    // Generic text extraction attempt
    const textContent = new TextDecoder("utf-8", { fatal: false }).decode(
      buffer
    );
    if (textContent.trim()) {
      contents.push({
        type: "text",
        text: textContent.trim(),
      });
    }
  }

  return contents;
}

/**
 * Process extracted content, using GPT-5.1 Mini Vision for images.
 */
// biome-ignore lint/suspicious/noExplicitAny: ActionCtx type is complex
async function processContentWithVision(
  ctx: any,
  contents: ExtractedContent[]
): Promise<ProcessedChunk[]> {
  const processedChunks: ProcessedChunk[] = [];

  for (const content of contents) {
    if (content.type === "text" && content.text) {
      // Use defaultChunker for text content - returns array of strings
      const textChunks = defaultChunker(content.text, {
        minCharsSoftLimit: 200,
        maxCharsSoftLimit: 1000,
        maxCharsHardLimit: 2000,
        delimiter: "\n\n",
      });

      for (const chunkText of textChunks) {
        processedChunks.push({
          text: chunkText,
          contentType: "text",
          slideNumber: content.slideNumber,
          pageNumber: content.pageNumber,
        });
      }
    } else if (content.type === "image" && content.imageData) {
      // Use GPT-5.1 Mini Vision to describe the image
      try {
        const { text: description } = await generateText({
          model: gpt51Mini,
          maxOutputTokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Describe this image from a business document in detail. Include:
- Any visible text, labels, titles, or headings
- Charts, graphs, or diagrams and their data/meaning
- Key visual elements and their significance
- Any logos, branding, or organizational elements
- Numbers, percentages, or metrics shown
Focus on information that would be relevant for business analysis and retrieval.`,
                },
                {
                  type: "image",
                  image: `data:${content.mimeType};base64,${content.imageData}`,
                },
              ],
            },
          ],
        });

        // Store the image in Convex storage
        const imageBlob = new Blob([Buffer.from(content.imageData, "base64")], {
          type: content.mimeType,
        });
        const storageId = await ctx.storage.store(imageBlob);

        // Create chunk with image description
        processedChunks.push({
          text: `[IMAGE CONTENT - Slide ${content.slideNumber ?? "N/A"}]: ${description}`,
          contentType: "image",
          slideNumber: content.slideNumber,
          pageNumber: content.pageNumber,
          imageStorageId: storageId,
        });
      } catch (error) {
        console.error("Vision processing error:", error);
        // Fallback: create a placeholder chunk
        processedChunks.push({
          text: `[IMAGE - Slide ${content.slideNumber ?? "N/A"}]: Image content (description unavailable)`,
          contentType: "image",
          slideNumber: content.slideNumber,
          pageNumber: content.pageNumber,
        });
      }
    }
  }

  return processedChunks;
}
