import { z } from "zod";
import { BlockType } from "./playground.types";

// Base schemas
export const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const connectionSchema = z.object({
  id: z.string(),
  sourceBlockId: z.string(),
  sourcePort: z.string(),
  targetBlockId: z.string(),
  targetPort: z.string(),
});

// Block configuration schemas
export const displayPromptConfigSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  mediaUrl: z.string().url().optional(),
  displayDuration: z.number().positive().optional(),
  requireAcknowledgment: z.boolean().default(false),
});

export const collectInputConfigSchema = z
  .object({
    question: z.string().min(1, "Question is required"),
    inputType: z.enum(["text", "multipleChoice", "rating", "file"]),
    options: z.array(z.string()).optional(),
    required: z.boolean().default(true),
    maxLength: z.number().positive().optional(),
    timeout: z.number().positive().optional(),
  })
  .refine(
    (data) => {
      if (
        data.inputType === "multipleChoice" &&
        (!data.options || data.options.length < 2)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Multiple choice questions must have at least 2 options",
      path: ["options"],
    }
  );

export const timerConfigSchema = z.object({
  duration: z.number().positive("Duration must be positive"),
  displayStyle: z
    .enum(["countdown", "progress", "hidden"])
    .default("countdown"),
  autoAdvance: z.boolean().default(true),
  title: z.string().optional(),
});

export const pollVoteConfigSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string().min(1)).min(2, "At least 2 options required"),
  allowMultiple: z.boolean().default(false),
  showResults: z
    .enum(["immediate", "afterVoting", "manual"])
    .default("afterVoting"),
  anonymous: z.boolean().default(true),
});

export const logicConfigSchema = z.object({
  conditions: z.array(
    z.object({
      field: z.string(),
      operator: z.enum(["equals", "contains", "greaterThan", "lessThan"]),
      value: z.unknown(),
      targetBlockId: z.string(),
    })
  ),
  defaultTargetBlockId: z.string().optional(),
});

export const assignmentDisplayConfigSchema = z.object({
  dataSource: z.string().min(1, "Data source is required"),
  distributionMode: z
    .enum(["one-per-participant", "round-robin", "random", "exclude-own"])
    .default("one-per-participant"),
  mismatchHandling: z.enum(["auto", "manual", "strict"]).default("auto"),
  showAuthor: z.boolean().default(false),
  displayMode: z.enum(["list", "cards", "grid"]).default("list"),
  allowParticipantResponse: z.boolean().default(false),
  responsePrompt: z.string().optional(),
  responseInputType: z
    .enum(["text", "multipleChoice", "rating", "file"])
    .optional(),
  allowReassignment: z.boolean().default(false),
  showDistributionPreview: z.boolean().default(true),
});

// Block configuration union schema
export const blockConfigSchema = z.union([
  displayPromptConfigSchema,
  collectInputConfigSchema,
  timerConfigSchema,
  pollVoteConfigSchema,
  logicConfigSchema,
  assignmentDisplayConfigSchema,
]);

// Activity block schema
export const activityBlockSchema = z.object({
  id: z.string(),
  type: z.enum([
    "display-prompt",
    "collect-input",
    "timer",
    "poll-vote",
    "handout",
  ]),
  position: positionSchema,
  config: z.record(z.string(), z.unknown()), // Generic config object
  connections: z.object({
    inputs: z.array(z.string()),
    outputs: z.array(z.string()),
  }),
});

// Participant state schema
export const participantStateSchema = z.object({
  userId: z.string(),
  currentBlockId: z.string().nullable(),
  responses: z.record(z.string(), z.unknown()),
  completedBlocks: z.array(z.string()),
  joinedAt: z.date(),
});

// Activity state schema
export const activityStateSchema = z.object({
  status: z.enum(["idle", "running", "paused", "completed", "error"]),
  currentBlockId: z.string().nullable(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  participants: z.array(participantStateSchema),
});

// Activity runtime schema
export const activityRuntimeSchema = z.object({
  activityId: z.string(),
  blocks: z.array(activityBlockSchema),
  connections: z.array(connectionSchema),
  currentBlock: z.string().nullable(),
  state: activityStateSchema,
});

// Custom activity metadata schema
export const activityMetadataSchema = z.object({
  estimatedDuration: z.number().positive(),
  participantCount: z.number().positive(),
});

// Custom activity schema
export const customActivitySchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, "Activity name is required")
    .max(255, "Name too long"),
  description: z.string().max(1000, "Description too long"),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  blocks: z.array(activityBlockSchema),
  connections: z.array(connectionSchema),
  metadata: activityMetadataSchema,
});

// Database entity schemas
export const customActivityEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  is_public: z.boolean(),
  tags: z.array(z.string()).nullable(),
  definition: z.unknown(), // JSONB
  metadata: z.unknown().nullable(), // JSONB
});

export const activityExecutionEntitySchema = z.object({
  id: z.string(),
  activity_id: z.string(),
  session_id: z.string(),
  started_at: z.string(),
  completed_at: z.string().nullable(),
  state: z.unknown(), // JSONB
  results: z.unknown().nullable(), // JSONB
});

export const activityResponseEntitySchema = z.object({
  id: z.string(),
  execution_id: z.string(),
  participant_id: z.string(),
  block_id: z.string(),
  response: z.unknown(), // JSONB
  submitted_at: z.string(),
});

// Validation functions
export const validateBlockConfig = (type: string, config: unknown) => {
  switch (type) {
    case BlockType.DISPLAY_PROMPT:
      return displayPromptConfigSchema.parse(config);
    case BlockType.COLLECT_INPUT:
      return collectInputConfigSchema.parse(config);
    case BlockType.TIMER:
      return timerConfigSchema.parse(config);
    case BlockType.POLL_VOTE:
      return pollVoteConfigSchema.parse(config);

    case BlockType.HANDOUT:
      return assignmentDisplayConfigSchema.parse(config);
    default:
      throw new Error(`Unknown block type: ${type}`);
  }
};

// Activity validation
export const validateActivity = (activity: unknown) => {
  const validated = customActivitySchema.parse(activity);

  // Additional validation: ensure all connections reference existing blocks
  const blockIds = new Set(validated.blocks.map((block) => block.id));

  for (const connection of validated.connections) {
    if (!blockIds.has(connection.sourceBlockId)) {
      throw new Error(
        `Connection references non-existent source block: ${connection.sourceBlockId}`
      );
    }
    if (!blockIds.has(connection.targetBlockId)) {
      throw new Error(
        `Connection references non-existent target block: ${connection.targetBlockId}`
      );
    }
  }

  return validated;
};

// Flow validation
export const validateActivityFlow = (
  blocks: { id: string }[],
  connections: { sourceBlockId: string; targetBlockId: string }[]
) => {
  const blockIds = new Set(blocks.map((block) => block.id));
  const errors: string[] = [];
  console.log(blockIds);
  // Check for orphaned blocks (no connections)
  const connectedBlocks = new Set();
  connections.forEach((conn) => {
    connectedBlocks.add(conn.sourceBlockId);
    connectedBlocks.add(conn.targetBlockId);
  });

  const orphanedBlocks = blocks.filter(
    (block) => !connectedBlocks.has(block.id)
  );
  if (orphanedBlocks.length > 1) {
    errors.push(
      "Multiple unconnected blocks found. Activities should have a single flow."
    );
  }

  // Check for circular dependencies (basic check)
  const visited = new Set();
  const recursionStack = new Set();

  const hasCycle = (blockId: string): boolean => {
    if (recursionStack.has(blockId)) return true;
    if (visited.has(blockId)) return false;

    visited.add(blockId);
    recursionStack.add(blockId);

    const outgoingConnections = connections.filter(
      (conn) => conn.sourceBlockId === blockId
    );
    for (const conn of outgoingConnections) {
      if (hasCycle(conn.targetBlockId)) return true;
    }

    recursionStack.delete(blockId);
    return false;
  };

  for (const block of blocks) {
    if (hasCycle(block.id)) {
      errors.push("Circular dependency detected in activity flow");
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
