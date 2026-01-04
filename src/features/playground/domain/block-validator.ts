import { BlockRegistry } from "./block-registry";
import { StrategyBlock } from "./playground.types";
import { ZodError } from "zod";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validator for activity blocks using registered block definitions
 */
export class BlockValidator {
  constructor(private registry: BlockRegistry) {}

  /**
   * Validate a single activity block
   * @param block The block to validate
   * @returns Validation result with errors if any
   */
  validateBlock(block: StrategyBlock): ValidationResult {
    const errors: string[] = [];

    // Check if block type is registered
    const blockDefinition = this.registry.getBlock(block.type);
    if (!blockDefinition) {
      errors.push(`Block type '${block.type}' is not registered`);
      return { isValid: false, errors };
    }

    // Validate block configuration using schema
    try {
      blockDefinition.configSchema.parse(block.config);
    } catch (error) {
      if (error instanceof ZodError) {
        errors.push(
          ...error.issues.map(
            (issue) => `${issue.path.join(".")}: ${issue.message}`
          )
        );
      } else {
        errors.push(`Configuration validation failed: ${error}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate multiple activity blocks
   * @param blocks Array of blocks to validate
   * @returns Array of validation results for each block
   */
  validateBlocks(blocks: StrategyBlock[]): ValidationResult[] {
    return blocks.map((block) => this.validateBlock(block));
  }
}
