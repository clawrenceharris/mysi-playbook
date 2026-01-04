import { describe, it, expect } from "vitest";
import {
  distributeOnePerParticipant,
  distributeRoundRobin,
  distributeRandom,
  distributeExcludeOwn,
} from "../distribution-algorithms";
import type {
  AssignmentItem,
  Participant,
  DistributionConfig,
} from "../distribution-engine.types";

describe("Distribution Algorithms", () => {
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

  describe("distributeOnePerParticipant", () => {
    it("should assign one item per participant when counts match", () => {
      const participants = createParticipants(3);
      const items = createItems(3);

      const result = distributeOnePerParticipant(
        items,
        participants,
        baseConfig
      );

      expect(result.totalItems).toBe(3);
      expect(result.totalParticipants).toBe(3);
      expect(result.distributionMode).toBe("one-per-participant");
      expect(Object.keys(result.participantAssignments)).toHaveLength(3);

      // Each participant should have exactly one item
      participants.forEach((p) => {
        expect(result.participantAssignments[p.id]).toHaveLength(1);
      });
    });

    it("should handle more participants than items", () => {
      const participants = createParticipants(5);
      const items = createItems(3);
      const config = { ...baseConfig, allowEmptyAssignments: true };

      const result = distributeOnePerParticipant(items, participants, config);

      expect(result.totalItems).toBe(3);
      expect(result.totalParticipants).toBe(5);

      // First 3 participants get items, last 2 get empty arrays
      expect(result.participantAssignments["user1"]).toHaveLength(1);
      expect(result.participantAssignments["user2"]).toHaveLength(1);
      expect(result.participantAssignments["user3"]).toHaveLength(1);
      expect(result.participantAssignments["user4"]).toHaveLength(0);
      expect(result.participantAssignments["user5"]).toHaveLength(0);
    });

    it("should handle more items than participants", () => {
      const participants = createParticipants(2);
      const items = createItems(5);

      const result = distributeOnePerParticipant(
        items,
        participants,
        baseConfig
      );

      expect(result.totalItems).toBe(5);
      expect(result.totalParticipants).toBe(2);

      // Only first 2 items are assigned
      expect(Object.keys(result.itemAssignments)).toHaveLength(2);
      expect(result.participantAssignments["user1"]).toHaveLength(1);
      expect(result.participantAssignments["user2"]).toHaveLength(1);
    });
  });

  describe("distributeRoundRobin", () => {
    it("should distribute items evenly in round-robin fashion", () => {
      const participants = createParticipants(3);
      const items = createItems(6);

      const result = distributeRoundRobin(items, participants, baseConfig);

      expect(result.totalItems).toBe(6);
      expect(result.totalParticipants).toBe(3);
      expect(result.distributionMode).toBe("round-robin");

      // Each participant should have 2 items
      expect(result.participantAssignments["user1"]).toHaveLength(2);
      expect(result.participantAssignments["user2"]).toHaveLength(2);
      expect(result.participantAssignments["user3"]).toHaveLength(2);
    });

    it("should handle uneven distribution", () => {
      const participants = createParticipants(3);
      const items = createItems(7);

      const result = distributeRoundRobin(items, participants, baseConfig);

      expect(result.totalItems).toBe(7);

      // First participant gets 3 items, others get 2
      expect(result.participantAssignments["user1"]).toHaveLength(3);
      expect(result.participantAssignments["user2"]).toHaveLength(2);
      expect(result.participantAssignments["user3"]).toHaveLength(2);
    });

    it("should assign items in order", () => {
      const participants = createParticipants(2);
      const items = createItems(4);

      const result = distributeRoundRobin(items, participants, baseConfig);

      // user1 should get items 1 and 3, user2 should get items 2 and 4
      expect(result.participantAssignments["user1"]).toContain("item1");
      expect(result.participantAssignments["user1"]).toContain("item3");
      expect(result.participantAssignments["user2"]).toContain("item2");
      expect(result.participantAssignments["user2"]).toContain("item4");
    });
  });

  describe("distributeRandom", () => {
    it("should distribute all items to participants", () => {
      const participants = createParticipants(3);
      const items = createItems(6);

      const result = distributeRandom(items, participants, baseConfig);

      expect(result.totalItems).toBe(6);
      expect(result.totalParticipants).toBe(3);
      expect(result.distributionMode).toBe("random");

      // All items should be assigned
      expect(Object.keys(result.itemAssignments)).toHaveLength(6);

      // All participants should have items
      const totalAssigned = Object.values(result.participantAssignments).reduce(
        (sum, items) => sum + items.length,
        0
      );
      expect(totalAssigned).toBe(6);
    });

    it("should produce different distributions on multiple runs", () => {
      const participants = createParticipants(3);
      const items = createItems(9);

      const result1 = distributeRandom(items, participants, baseConfig);
      const result2 = distributeRandom(items, participants, baseConfig);

      // While not guaranteed, it's extremely unlikely to get the same distribution twice
      // We'll check that at least one participant has a different assignment
      const isDifferent = participants.some((p) => {
        const items1 = result1.participantAssignments[p.id].sort();
        const items2 = result2.participantAssignments[p.id].sort();
        return JSON.stringify(items1) !== JSON.stringify(items2);
      });

      // This test might occasionally fail due to randomness, but probability is very low
      expect(isDifferent).toBe(true);
    });
  });

  describe("distributeExcludeOwn", () => {
    it("should not assign items to their authors", () => {
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

      const result = distributeExcludeOwn(items, participants, baseConfig);

      expect(result.distributionMode).toBe("exclude-own");

      // Verify no participant got their own item
      expect(result.participantAssignments["user1"]).not.toContain("item1");
      expect(result.participantAssignments["user2"]).not.toContain("item2");
      expect(result.participantAssignments["user3"]).not.toContain("item3");

      // Each participant should have exactly one item
      participants.forEach((p) => {
        expect(result.participantAssignments[p.id]).toHaveLength(1);
      });
    });

    it("should handle participants with no eligible items", () => {
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
      const config = { ...baseConfig, allowEmptyAssignments: true };

      const result = distributeExcludeOwn(items, participants, config);

      // user1 created all items, so should get empty array
      expect(result.participantAssignments["user1"]).toHaveLength(0);

      // user2 should get one of the items
      expect(result.participantAssignments["user2"]).toHaveLength(1);
    });

    it("should randomly select from eligible items", () => {
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
        {
          id: "item3",
          content: "Content 3",
          authorId: "user2",
          createdAt: Date.now(),
        },
      ];

      const result = distributeExcludeOwn(items, participants, baseConfig);

      // user1 should not get item1 or item2 (their own), should get item3
      expect(result.participantAssignments["user1"]).toContain("item3");

      // user2 should get either item1 or item2 (not their own item3)
      const user2Items = result.participantAssignments["user2"];
      expect(user2Items).toHaveLength(1);
      expect(["item1", "item2"]).toContain(user2Items[0]);
    });
  });
});
