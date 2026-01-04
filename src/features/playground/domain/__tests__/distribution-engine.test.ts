import { describe, it, expect } from "vitest";
import type {
  DistributionMode,
  MismatchHandling,
  DistributionConfig,
  AssignmentMap,
  Participant,
  AssignmentItem,
  DistributionResult,
  ValidationResult,
  DistributionEngine,
} from "../distribution-engine.types";

describe("DistributionEngine Types", () => {
  it("should define DistributionMode type with correct values", () => {
    const modes: DistributionMode[] = [
      "one-per-participant",
      "round-robin",
      "random",
      "exclude-own",
    ];

    expect(modes).toHaveLength(4);
    expect(modes).toContain("one-per-participant");
    expect(modes).toContain("round-robin");
    expect(modes).toContain("random");
    expect(modes).toContain("exclude-own");
  });

  it("should define MismatchHandling type with correct values", () => {
    const handlers: MismatchHandling[] = ["auto", "manual", "strict"];

    expect(handlers).toHaveLength(3);
    expect(handlers).toContain("auto");
    expect(handlers).toContain("manual");
    expect(handlers).toContain("strict");
  });

  it("should create valid DistributionConfig with all required fields", () => {
    const config: DistributionConfig = {
      mode: "one-per-participant",
      mismatchHandling: "auto",
      excludeOwnResponses: false,
      allowMultiplePerParticipant: false,
      allowEmptyAssignments: false,
    };

    expect(config.mode).toBe("one-per-participant");
    expect(config.mismatchHandling).toBe("auto");
    expect(config.excludeOwnResponses).toBe(false);
    expect(config.allowMultiplePerParticipant).toBe(false);
    expect(config.allowEmptyAssignments).toBe(false);
  });

  it("should create valid AssignmentMap with all required fields", () => {
    const assignmentMap: AssignmentMap = {
      itemAssignments: { item1: "user1" },
      participantAssignments: { user1: ["item1"] },
      createdAt: Date.now(),
      distributionMode: "one-per-participant",
      totalItems: 1,
      totalParticipants: 1,
    };

    expect(assignmentMap.itemAssignments).toHaveProperty("item1");
    expect(assignmentMap.participantAssignments).toHaveProperty("user1");
    expect(assignmentMap.totalItems).toBe(1);
    expect(assignmentMap.totalParticipants).toBe(1);
    expect(assignmentMap.distributionMode).toBe("one-per-participant");
  });

  it("should create valid Participant with all required fields", () => {
    const participant: Participant = {
      id: "user1",
      name: "Test User",
      isHost: false,
    };

    expect(participant.id).toBe("user1");
    expect(participant.name).toBe("Test User");
    expect(participant.isHost).toBe(false);
  });

  it("should create valid AssignmentItem with all required fields", () => {
    const item: AssignmentItem = {
      id: "item1",
      content: "Test content",
      authorId: "user1",
      createdAt: Date.now(),
    };

    expect(item.id).toBe("item1");
    expect(item.content).toBe("Test content");
    expect(item.authorId).toBe("user1");
    expect(typeof item.createdAt).toBe("number");
  });

  it("should create valid DistributionResult for success case", () => {
    const result: DistributionResult = {
      success: true,
      assignments: {
        itemAssignments: { item1: "user1" },
        participantAssignments: { user1: ["item1"] },
        createdAt: Date.now(),
        distributionMode: "one-per-participant",
        totalItems: 1,
        totalParticipants: 1,
      },
      warnings: ["Some warning"],
    };

    expect(result.success).toBe(true);
    expect(result.assignments).toBeDefined();
    expect(result.warnings).toHaveLength(1);
  });

  it("should create valid DistributionResult for failure case", () => {
    const result: DistributionResult = {
      success: false,
      errors: ["Distribution failed"],
    };

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.assignments).toBeUndefined();
  });

  it("should create valid ValidationResult", () => {
    const validation: ValidationResult = {
      valid: false,
      warnings: ["Warning message"],
      errors: ["Error message"],
      suggestions: ["Try this instead"],
    };

    expect(validation.valid).toBe(false);
    expect(validation.warnings).toHaveLength(1);
    expect(validation.errors).toHaveLength(1);
    expect(validation.suggestions).toHaveLength(1);
  });

  it("should define DistributionEngine interface with required methods", () => {
    // This test verifies the interface structure exists
    const mockEngine: DistributionEngine = {
      distribute: () => ({
        success: true,
        assignments: {
          itemAssignments: {},
          participantAssignments: {},
          createdAt: Date.now(),
          distributionMode: "one-per-participant",
          totalItems: 0,
          totalParticipants: 0,
        },
      }),
      validate: () => ({
        valid: true,
        warnings: [],
        errors: [],
      }),
      preview: () => ({
        itemAssignments: {},
        participantAssignments: {},
        createdAt: Date.now(),
        distributionMode: "one-per-participant",
        totalItems: 0,
        totalParticipants: 0,
      }),
    };

    expect(mockEngine.distribute).toBeDefined();
    expect(mockEngine.validate).toBeDefined();
    expect(mockEngine.preview).toBeDefined();
    expect(typeof mockEngine.distribute).toBe("function");
    expect(typeof mockEngine.validate).toBe("function");
    expect(typeof mockEngine.preview).toBe("function");
  });
});
