/* eslint-disable @typescript-eslint/no-explicit-any */
import { StrategySlide } from "./playground.types";
import {
  SlideTemplate,
  SlideTemplateCategory,
  validateSlideTemplate,
} from "./slide-templates";

// Interface for creating custom templates
export interface CustomTemplateData {
  name: string;
  description: string;
  category: SlideTemplateCategory;
  tags?: string[];
}

// Storage key for custom templates
const STORAGE_KEY = "custom-slide-templates";

// Create a template from an existing slide
export function createTemplateFromSlide(
  slide: StrategySlide,
  templateData: CustomTemplateData
): SlideTemplate {
  // Convert slide blocks to template blocks (remove IDs and order)
  const templateBlocks = slide.blocks.map((block) => ({
    type: block.type,
    config: { ...block.config },
  }));

  return {
    id: `custom-template-${Date.now()}`,
    name: templateData.name,
    description: templateData.description,
    category: templateData.category,
    preview: "", // Could be generated from slide thumbnail
    slideType: slide.type,
    blocks: templateBlocks,
    metadata: {
      estimatedDuration: slide.timing.estimatedDuration,
      tags: templateData.tags || [],
      author: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

// Validate custom template (extends base validation)
export function validateCustomTemplate(
  template: any
): template is SlideTemplate {
  return (
    validateSlideTemplate(template) &&
    template.category === "custom" &&
    template.metadata.author === "user"
  );
}

// Save custom template to localStorage
export async function saveCustomTemplate(
  template: SlideTemplate
): Promise<void> {
  if (!validateCustomTemplate(template)) {
    throw new Error("Invalid custom template");
  }

  try {
    const existingTemplates = await getCustomTemplates();

    // Update existing template or add new one
    const templateIndex = existingTemplates.findIndex(
      (t) => t.id === template.id
    );
    if (templateIndex >= 0) {
      existingTemplates[templateIndex] = {
        ...template,
        metadata: {
          ...template.metadata,
          updatedAt: new Date(),
        },
      };
    } else {
      existingTemplates.push(template);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingTemplates));
  } catch (error) {
    throw new Error(`Failed to save custom template: ${error}`);
  }
}

// Delete custom template from localStorage
export async function deleteCustomTemplate(templateId: string): Promise<void> {
  try {
    const existingTemplates = await getCustomTemplates();
    const filteredTemplates = existingTemplates.filter(
      (t) => t.id !== templateId
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTemplates));
  } catch (error) {
    throw new Error(`Failed to delete custom template: ${error}`);
  }
}

// Get all custom templates from localStorage
export async function getCustomTemplates(): Promise<SlideTemplate[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const templates = JSON.parse(stored);

    // Validate and filter templates
    return templates.filter((template: any) => {
      try {
        // Convert date strings back to Date objects
        if (template.metadata) {
          template.metadata.createdAt = new Date(template.metadata.createdAt);
          template.metadata.updatedAt = new Date(template.metadata.updatedAt);
        }
        return validateCustomTemplate(template);
      } catch {
        return false;
      }
    });
  } catch (error) {
    console.error("Failed to load custom templates:", error);
    return [];
  }
}

// Template Manager class for organized template operations
export class TemplateManager {
  // Create template from slide
  async createFromSlide(
    slide: StrategySlide,
    templateData: CustomTemplateData
  ): Promise<SlideTemplate> {
    const template = createTemplateFromSlide(slide, templateData);
    await this.save(template);
    return template;
  }

  // Save template
  async save(template: SlideTemplate): Promise<void> {
    return saveCustomTemplate(template);
  }

  // Delete template
  async delete(templateId: string): Promise<void> {
    return deleteCustomTemplate(templateId);
  }

  // Get all custom templates
  async getAll(): Promise<SlideTemplate[]> {
    return getCustomTemplates();
  }

  // Update template
  async update(
    templateId: string,
    updates: Partial<SlideTemplate>
  ): Promise<SlideTemplate> {
    const templates = await this.getAll();
    const template = templates.find((t) => t.id === templateId);

    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      metadata: {
        ...template.metadata,
        ...updates.metadata,
        updatedAt: new Date(),
      },
    };

    await this.save(updatedTemplate);
    return updatedTemplate;
  }

  // Check if template exists
  async exists(templateId: string): Promise<boolean> {
    const templates = await this.getAll();
    return templates.some((t) => t.id === templateId);
  }
}
