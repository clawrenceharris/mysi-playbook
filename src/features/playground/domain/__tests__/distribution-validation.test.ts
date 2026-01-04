import { describe, it, expect } from "vitest";
import { validateDistribution } from "../distribution-validation";
import type {
  AssignmentItem,
  Participant,
  DistributionConfig,
} from "../distribution-engine.types";

describe("Distribution Validation", () => {
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

  const baseConfig: DistributionConfig = {
    mode: "one-per-participant",
    mismatchHandling: "auto",
    excludeOwnResponses: false,
    allowMultiplePerParticipant: false,
    allowEmptyAssignments: false,
  };

  describe("Empty validation", () => {
    it("should return error when no items are provided", () => {
      const participants = createParticipants(3);
      const items: AssignmentItem[] = [];

      const result = validateDistribution(items, participants, baseConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("No items available for distribution");
    });

    it("should return error when no participants are provided", () => {
      const participants: Participant[] = [];
      const items = createItems(3);

      const result = validateDistribution(items, participants, baseConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "No participants available for distribution"
      );
    });

    it("should return valid when both items and participants exist", () => {
      const participants = createParticipants(3);
      const items = createItems(3);

      const result = validateDistribution(items, participants, baseConfig);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Mismatch detection", () => {
    it("should warn when more items than participants with auto handling", () => {
      const participants = createParticipants(2);
      const items = createItems(5);
      const config = { ...baseConfig, mismatchHandling: "auto" as const };

      const result = validateDistribution(items, participants, config);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain(
        "Some participants will receive multiple items (5 items, 2 participants)"
      );
    });

    it("should error when more items than participants with strict handling and multiple not allowed", () => {
      const participants = createParticipants(2);
      const items = createItems(5);
      const config = {
        ...baseConfig,
        mismatchHandling: "strict" as const,
        allowMultiplePerParticipant: false,
      };

      const result = validateDistribution(items, participants, config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("More items");
      expect(result.errors[0]).toContain(
        'Enable "Allow multiple per participant"'
      );
    });

    it("should warn when fewer items than participants with auto handling", () => {
      const participants = createParticipants(5);
      const items = createItems(3);
      const config = { ...baseConfig, mismatchHandling: "auto" as const };

      const result = validateDistribution(items, participants, config);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain(
        "Some participants will not receive items (3 items, 5 participants)"
      );
    });

    it("should error when fewer items than participants with strict handling and empty not allowed", () => {
      const participants = createParticipants(5);
      const items = createItems(3);
      const config = {
        ...baseConfig,
        mismatchHandling: "strict" as const,
        allowEmptyAssignments: false,
      };

      const result = validateDistribution(items, participants, config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("Fewer items");
      expect(result.errors[0]).toContain('Enable "Allow empty assignments"');
    });

    it("should be valid when counts match", () => {
      const participants = createParticipants(3);
      const items = createItems(3);

      const result = validateDistribution(items, participants, baseConfig);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Exclude-own mode validation", () => {
    it("should warn when participant has no eligible items in exclude-own mode", () => {
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
      const config = { ...baseConfig, mode: "exclude-own" as const };

      const result = validateDistribution(items, participants, config);

      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain(
        "participant(s) have no eligible items"
      );
    });

    it("should be valid when all participants have eligible items in exclude-own mode", () => {
      const participants = createParticipants(3);
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
      const config = { ...baseConfig, mode: "exclude-own" as const };

      const result = validateDistribution(items, participants, config);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it("should not check exclude-own logic for other modes", () => {
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
      const config = { ...baseConfig, mode: "round-robin" as const };

      const result = validateDistribution(items, participants, config);

      expect(result.valid).toBe(true);
      // Should not have warnings about eligible items since it's not exclude-own mode
      const hasEligibleWarning = result.warnings.some((w) =>
        w.includes("eligible items")
      );
      expect(hasEligibleWarning).toBe(false);
    });
  });

  describe("Suggestions", () => {
    it("should provide suggestions when validation fails", () => {
      const participants = createParticipants(5);
      const items = createItems(3);
      const config = {
        ...baseConfig,
        mismatchHandling: "strict" as const,
        allowEmptyAssignments: false,
      };

      const result = validateDistribution(items, participants, config);

      expect(result.valid).toBe(false);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.length).toBeGreaterThan(0);
    });

    it("should not provide suggestions when validation passes", () => {
      const participants = createParticipants(3);
      const items = createItems(3);

      const result = validateDistribution(items, participants, baseConfig);

      expect(result.valid).toBe(true);
      expect(result.suggestions).toBeUndefined();
    });
  });
});
