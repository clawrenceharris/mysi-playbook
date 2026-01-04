/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlideType, StrategySlide, StrategyBlock } from "./playground.types";
import { BlockType } from "./playground.types";

// Extended slide template category type
export type SlideTemplateCategory =
  | "content"
  | "interaction"
  | "assessment"
  | "engagement"
  | "custom";

// Template metadata interface
export interface SlideTemplateMetadata {
  estimatedDuration: number; // in seconds
  tags: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

// Template block definition (partial strategy block)
export interface TemplateBlock {
  type: BlockType;
  config: Record<string, any>;
}

// Complete slide template interface
export interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  slideType: SlideType;
  blocks: TemplateBlock[];
  metadata: SlideTemplateMetadata;
}

// Create a slide from template with placeholder replacement
export function createSlideFromTemplate(
  template: SlideTemplate,
  placeholders: Record<string, string> = {}
): StrategySlide {
  // Replace placeholders in block configs
  const processedBlocks: StrategyBlock[] = template.blocks.map(
    (block, index) => ({
      id: `block-${Date.now()}-${index}`,
      type: block.type,
      order: index,
      config: replacePlaceholders(block.config, placeholders),
    })
  );

  return {
    id: `slide-${Date.now()}`,
    title: template.name,
    type: template.slideType,
    blocks: processedBlocks,
    order: 0, // Will be set by the calling code
    transitions: {
      type: "manual",
    },
    timing: {
      estimatedDuration: template.metadata.estimatedDuration,
      showTimer: false,
    },
  };
}

// Validate slide template structure
export function validateSlideTemplate(
  template: any
): template is SlideTemplate {
  return (
    typeof template === "object" &&
    template !== null &&
    typeof template.id === "string" &&
    template.id.length > 0 &&
    typeof template.name === "string" &&
    template.name.length > 0 &&
    typeof template.description === "string" &&
    typeof template.category === "string" &&
    ["content", "interaction", "assessment", "engagement", "custom"].includes(
      template.category
    ) &&
    typeof template.preview === "string" &&
    typeof template.slideType === "string" &&
    Array.isArray(template.blocks) &&
    typeof template.metadata === "object" &&
    template.metadata !== null &&
    typeof template.metadata.estimatedDuration === "number" &&
    Array.isArray(template.metadata.tags) &&
    typeof template.metadata.author === "string" &&
    template.metadata.createdAt instanceof Date &&
    template.metadata.updatedAt instanceof Date
  );
}

// Helper function to replace placeholders in config objects
function replacePlaceholders(
  config: Record<string, any>,
  placeholders: Record<string, string>
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(config)) {
    if (typeof value === "string") {
      // Replace {{placeholder}} patterns
      result[key] = value.replace(/\{\{(\w+)\}\}/g, (match, placeholder) => {
        return placeholders[placeholder] || match;
      });
    } else {
      result[key] = value;
    }
  }

  return result;
}
