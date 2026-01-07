import { createAzure } from "@ai-sdk/azure";
import { RAG } from "@convex-dev/rag";
import { components } from "./_generated/api";

/**
 * Azure OpenAI provider for GPT models (vision/chat).
 * Uses deployment-based URLs for Azure OpenAI compatibility.
 * Note: API version 2024-08-01-preview or later required for structured outputs (json_schema)
 */
export const azureGpt = createAzure({
  resourceName: process.env.AZURE_GPT_RESOURCE_NAME,
  apiKey: process.env.AZURE_GPT_API_KEY,
  apiVersion: process.env.AZURE_GPT_API_VERSION ?? "2024-08-01-preview",
  useDeploymentBasedUrls: true,
});

/**
 * Azure OpenAI provider for embeddings.
 * Uses deployment-based URLs for Azure OpenAI compatibility.
 */
export const azureEmbedding = createAzure({
  resourceName: process.env.AZURE_EMBEDDING_RESOURCE_NAME,
  apiKey: process.env.AZURE_EMBEDDING_API_KEY,
  apiVersion: process.env.AZURE_EMBEDDING_API_VERSION ?? "2024-10-21",
  useDeploymentBasedUrls: true,
});

/**
 * GPT-5.1 Mini model for vision and chat.
 * Deployment: gpt-5-mini-is
 * API Version: 2024-12-01-preview
 */
export const gpt51Mini = azureGpt(
  process.env.AZURE_GPT_DEPLOYMENT ?? "gpt-5-mini-is"
);

/**
 * Text embedding model for RAG.
 * Deployment: text-embedding-3-large
 * API Version: 2024-04-01-preview
 * Dimensions: 3072
 */
export const embeddingModel = azureEmbedding.embedding(
  process.env.AZURE_EMBEDDING_DEPLOYMENT ?? "text-embedding-3-large"
);

/**
 * RAG component instance configured with Azure embeddings.
 * Uses text-embedding-3-large with 3072 dimensions for high-quality retrieval.
 */
export const rag = new RAG(components.rag, {
  textEmbeddingModel: embeddingModel,
  embeddingDimension: 3072,
});
