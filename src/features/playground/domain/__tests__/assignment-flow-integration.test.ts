import { describe, it, expect } from "vitest";
import { resolveVariable } from "../variable-resolver";
import { distributeOnePerParticipant } from "../distribution-algorithms";
import type {
  AssignmentItem,
  Participant,
  DistributionConfig,
} from "../distribution-engine.types";

describe("Assignment Flow Integration", () => {
  it("should maintain consistent IDs throughout the assignment flow", () => {
    // RED: Test the complete flow from data collection to assignment display

    // Step 1: Simulate data collection (responses stored in state)
    const state = {
      customQuestions: {
        "user1-abc123": "What is React?",
        "user2-def456": "What is TypeScript?",
        "user3-ghi789": "What is Vitest?",
      },
    };

    const context = {
      state,
      userId: "host",
      isHost: true,
    };

    // Step 2: Host clicks "Assign" - resolve items for distribution
    const itemsForDistribution = resolveVariable(
      "customQuestions",
      context
    ) as AssignmentItem[];

    expect(itemsForDistribution).toHaveLength(3);
    expect(itemsForDistribution[0]).toHaveProperty("id");
    expect(itemsForDistribution[0]).toHaveProperty("content");
    expect(itemsForDistribution[0]).toHaveProperty("authorId");

    // Step 3: Create distribution
    const participants: Participant[] = [
      { id: "user1", name: "User 1", isHost: false },
      { id: "user2", name: "User 2", isHost: false },
      { id: "user3", name: "User 3", isHost: false },
    ];

    const distributionConfig: DistributionConfig = {
      mode: "one-per-participant",
      mismatchHandling: "auto",
      excludeOwnResponses: false,
      allowMultiplePerParticipant: true,
      allowEmptyAssignments: true,
    };

    const assignmentMap = distributeOnePerParticipant(
      itemsForDistribution,
      participants,
      distributionConfig
    );

    // Step 4: Display assignments - resolve items again for display
    const itemsForDisplay = resolveVariable(
      "customQuestions",
      context
    ) as AssignmentItem[];

    // Step 5: Verify IDs match between distribution and display
    expect(itemsForDisplay).toHaveLength(3);

    // Check that we can find assigned items by their IDs
    const user1AssignedIds = assignmentMap.participantAssignments["user1"];
    const user1AssignedItems = itemsForDisplay.filter((item) =>
      user1AssignedIds.includes(item.id)
    );

    expect(user1AssignedItems).toHaveLength(1);
    expect(user1AssignedItems[0].content).toBeDefined();
  });

  it("should handle multiple resolution calls with consistent results", () => {
    // RED: Test that multiple calls to resolveVariable return the same IDs
    const state = {
      myCustomData: {
        "user1-uuid1": "Response 1",
        "user2-uuid2": "Response 2",
      },
    };

    const context = {
      state,
      userId: "host",
      isHost: true,
    };

    // Resolve multiple times
    const resolution1 = resolveVariable(
      "myCustomData",
      context
    ) as AssignmentItem[];
    const resolution2 = resolveVariable(
      "myCustomData",
      context
    ) as AssignmentItem[];
    const resolution3 = resolveVariable(
      "myCustomData",
      context
    ) as AssignmentItem[];

    // All resolutions should have the same IDs
    expect(resolution1[0].id).toBe(resolution2[0].id);
    expect(resolution1[0].id).toBe(resolution3[0].id);
    expect(resolution1[1].id).toBe(resolution2[1].id);
    expect(resolution1[1].id).toBe(resolution3[1].id);
  });
});
