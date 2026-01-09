/**
 * Front matter structure for audience markdown files
 */
export interface AudienceFrontMatter {
  audience: string;
  description: string;
}

/**
 * Parsed audience configuration
 */
export interface AudienceConfig extends AudienceFrontMatter {
  id: string;
  promptTemplate: string;
}

/**
 * Front matter structure for priority markdown files
 */
export interface PriorityFrontMatter {
  priority: string;
  description: string;
}

/**
 * Parsed priority configuration
 */
export interface PriorityConfig extends PriorityFrontMatter {
  id: string;
  promptTemplate: string;
}

/**
 * Template variables available for substitution in prompts
 */
export interface PromptTemplateVariables {
  clientName: string;
  renewalPeriod: string;
  expectedIncrease: string;
  budgetComparison: string;
  nationalAverage: string;
  regionalAverage: string;
  industryAverage: string;
}

/**
 * All loaded prompt configurations
 */
export interface PromptConfigurations {
  audiences: AudienceConfig[];
  priorities: PriorityConfig[];
}
