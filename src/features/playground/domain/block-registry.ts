// import { BlockDefinition, BlockType, BlockCategory } from "./playground.types";

// /**
//  * Registry for managing available block definitions
//  * Provides registration, lookup, and validation methods for activity blocks
//  */
// export class BlockRegistry {
//   private blocks = new Map<BlockType, BlockDefinition>();

//   /**
//    * Register a new block definition
//    * @param definition The block definition to register
//    * @throws Error if block type is already registered
//    */
//   register(definition: BlockDefinition): void {
//     if (this.blocks.has(definition.type)) {
//       throw new Error(`Block type '${definition.type}' is already registered`);
//     }
//     this.blocks.set(definition.type, definition);
//   }

//   /**
//    * Get a block definition by type
//    * @param type The block type to retrieve
//    * @returns The block definition or undefined if not found
//    */
//   getBlock(type: BlockType): BlockDefinition | undefined {
//     return this.blocks.get(type);
//   }

//   /**
//    * Get all registered block definitions
//    * @returns Array of all registered block definitions
//    */
//   getAllBlocks(): BlockDefinition[] {
//     return Array.from(this.blocks.values());
//   }

//   /**
//    * Get blocks filtered by category
//    * @param category The category to filter by
//    * @returns Array of block definitions in the specified category
//    */
//   getBlocksByCategory(category: BlockCategory): BlockDefinition[] {
//     return this.getAllBlocks().filter((block) => block.category === category);
//   }

//   /**
//    * Validate block configuration using the block's schema
//    * @param type The block type
//    * @param config The configuration to validate
//    * @throws Error if block type is not registered or validation fails
//    */
//   validateBlockConfig(type: BlockType, config: unknown): void {
//     const blockDefinition = this.getBlock(type);
//     if (!blockDefinition) {
//       throw new Error(`Block type '${type}' is not registered`);
//     }

//     blockDefinition.configSchema.parse(config);
//   }
// }
