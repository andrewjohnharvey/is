import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type {
  AudienceConfig,
  AudienceFrontMatter,
  PriorityConfig,
  PriorityFrontMatter,
  PromptConfigurations,
  PromptTemplateVariables,
} from "./prompt-config-types";

const CONTENT_DIR = path.join(process.cwd(), "content", "canvas-flow");

/**
 * Load and parse all audience markdown files
 */
export function loadAudienceConfigs(): AudienceConfig[] {
  const audiencesDir = path.join(CONTENT_DIR, "audiences");

  if (!fs.existsSync(audiencesDir)) {
    console.warn(`Audiences directory not found: ${audiencesDir}`);
    return [];
  }

  const files = fs.readdirSync(audiencesDir).filter((f) => f.endsWith(".md"));

  return files.map((filename) => {
    const filePath = path.join(audiencesDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const frontMatter = data as AudienceFrontMatter;

    return {
      id: filename.replace(".md", ""),
      audience: frontMatter.audience,
      description: frontMatter.description,
      promptTemplate: content.trim(),
    };
  });
}

/**
 * Load and parse all priority markdown files
 */
export function loadPriorityConfigs(): PriorityConfig[] {
  const prioritiesDir = path.join(CONTENT_DIR, "priorities");

  if (!fs.existsSync(prioritiesDir)) {
    console.warn(`Priorities directory not found: ${prioritiesDir}`);
    return [];
  }

  const files = fs.readdirSync(prioritiesDir).filter((f) => f.endsWith(".md"));

  return files.map((filename) => {
    const filePath = path.join(prioritiesDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const frontMatter = data as PriorityFrontMatter;

    return {
      id: filename.replace(".md", ""),
      priority: frontMatter.priority,
      description: frontMatter.description,
      promptTemplate: content.trim(),
    };
  });
}

/**
 * Load all prompt configurations
 */
export function loadPromptConfigurations(): PromptConfigurations {
  return {
    audiences: loadAudienceConfigs(),
    priorities: loadPriorityConfigs(),
  };
}

/**
 * Replace template variables in a prompt string
 * Variables use format: {{variableName}}
 */
export function replaceTemplateVariables(
  template: string,
  variables: Partial<PromptTemplateVariables>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    if (value !== undefined && value !== null && value !== "") {
      const placeholder = `{{${key}}}`;
      result = result.replaceAll(placeholder, String(value));
    }
  }

  // Replace any remaining unreplaced placeholders with a fallback
  result = result.replace(/\{\{[^}]+\}\}/g, "[not provided]");

  return result;
}
