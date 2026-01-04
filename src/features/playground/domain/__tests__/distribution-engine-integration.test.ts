import { describe, it, expect } from "vitest";
import {
  validateDistribution,
  distributeOnePerParticipant,
  distributeRoundRobin,
  distributeRandom,
  distributeExcludeOwn,
  type AssignmentItem,
  type Participant,
  type DistributionConfig,
} from "../distribution-engine";

describe("Distribution Engine Integration", () => {
  const createParticipants = (count: number): Participant[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `user${i + 1}`,
      name: `User ${i + 1}`,
      isHost: i === 0,
    }));
  };

  const createItems = (count: number, authorId?: string): AssignmentItem[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `item${i + 1}`,
      content: `Content ${i + 1}`,
      authorId: authorId || `user${i + 1}`,
      createdAt: Date.now(),
    }));
  };

  it("should validate and distribute items successfully", () => {
    const participants = createParticipants(3);
    const items = createItems(3);
    const config: DistributionConfig = {
      mode: "one-per-participant",
      mismatchHandling: "auto",
      excludeOwnResponses: false,
      allowMultiplePerParticipant: false,
      allowEmptyAssignments: false,
    };

    // Validate first
    const validation = validateDistribution(items, participants, config);
    expect(validation.valid).toBe(true);

    // Then distribute
    const result = distributeOnePerParticipant(items, participants, config);
    expect(result.totalItems).toBe(3);
    expect(result.totalParticipants).toBe(3);
    expect(Object.keys(result.participantAssignments)).toHaveLength(3);
  });

  it("should handle validation failure gracefully", () => {
    const participants = createParticipants(5);
    const items = createItems(3);
    const config: DistributionConfig = {
      mode: "one-per-participant",
      mismatchHandling: "strict",
      excludeOwnResponses: false,
      allowMultiplePerParticipant: false,
      allowEmptyAssignments: false,
    };

    // Validation should fail
    const validation = validateDistribution(items, participants, config);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.suggestions).toBeDefined();
  });

  it("should support all distribution modes", () => {
    const participants = createParticipants(3);
    const items = createItems(6);
    const baseConfig: DistributionConfig = {
      mode: "one-per-participant",
      mismatchHandling: "auto",
      excludeOwnResponses: false,
      allowMultiplePerParticipant: true,
      allowEmptyAssignments: false,
    };

    // Test one-per-participant
    const onePerResult = distributeOnePerParticipant(
      items,
      participants,
      baseConfig
    );
    expect(onePerResult.distributionMode).toBe("one-per-participant");

    // Test round-robin
    const roundRobinResult = distributeRoundRobin(
      items,
      participants,
      baseConfig
    );
    expect(roundRobinResult.distributionMode).toBe("round-robin");

    // Test random
    const randomResult = distributeRandom(items, participants, baseConfig);
    expect(randomResult.distributionMode).toBe("random");

    // Test exclude-own
    const excludeOwnItems: AssignmentItem[] = [
      {
        id: "item1",
        content: "Content 1",
        authorId: "user1",
        createdAt: Date.now(),
      },
      {
        id: "item2",
        content: "Content 2",
        authorId: "user2",
        createdAt: Date.now(),
      },
      {
        id: "item3",
        content: "Content 3",
        authorId: "user3",
        createdAt: Date.now(),
      },
    ];
    const excludeOwnResult = distributeExcludeOwn(
      excludeOwnItems,
      participants,
      baseConfig
    );
    expect(excludeOwnResult.distributionMode).toBe("exclude-own");
  });

  it("should validate exclude-own mode correctly", () => {
    const participants = createParticipants(2);
    const items: AssignmentItem[] = [
      {
        id: "item1",
        content: "Content 1",
        authorId: "user1",
        createdAt: Date.now(),
      },
      {
        id: "item2",
        content: "Content 2",
        authorId: "user1",
        createdAt: Date.now(),
      },
    ];
    const config: DistributionConfig = {
      mode: "exclude-own",
      mismatchHandling: "auto",
      excludeOwnResponses: false,
      allowMultiplePerParticipant: false,
      allowEmptyAssignments: true,
    };

    // Validation should warn about user1 having no eligible items
    const validation = validateDistribution(items, participants, config);
    expect(validation.valid).toBe(true);
    expect(validation.warnings.length).toBeGreaterThan(0);
    expect(validation.warnings[0]).toContain("have no eligible items");

    // Distribution should still work
    const result = distributeExcludeOwn(items, participants, config);
    expect(result.participantAssignments["user1"]).toHaveLength(0);
    expect(result.participantAssignments["user2"]).toHaveLength(1);
  });
});
