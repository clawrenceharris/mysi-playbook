import { describe, it, expect } from "vitest";
import { resolveVariable } from "../variable-resolver";
import { distributeOnePerParticipant } from "../distribution-algorithms";
import type {
  AssignmentItem,
  Participant,
  DistributionConfig,
} from "../distribution-engine.types";

describe("Handout Assignment Bug Fix", () => {
  it("should correctly assign and display items when participants submit questions", () => {
    // Simulate the exact scenario from the bug report:
    // 1. Three participants submit one question each
    // 2. Host clicks "Assign"
    // 3. Participants should see their assigned items

    // Step 1: Participants submit questions (stored in custom variable)
    const state = {
      studentQuestions: {
        "participant1-uuid1": "What is React?",
        "participant2-uuid2": "What is TypeScript?",
        "participant3-uuid3": "What is Vitest?",
      },
    };

    const hostContext = {
      state,
      userId: "host",
      isHost: true,
    };

    // Step 2: Host clicks "Assign" - first resolution to get items
    const itemsForDistribution = resolveVariable(
      "studentQuestions",
      hostContext
    ) as AssignmentItem[];

    // Verify we have 3 items
    expect(itemsForDistribution).toHaveLength(3);
    expect(itemsForDistribution[0].content).toBe("What is React?");
    expect(itemsForDistribution[1].content).toBe("What is TypeScript?");
    expect(itemsForDistribution[2].content).toBe("What is Vitest?");

    // Step 3: Create distribution
    const participants: Participant[] = [
      { id: "participant1", name: "Participant 1", isHost: false },
      { id: "participant2", name: "Participant 2", isHost: false },
      { id: "participant3", name: "Participant 3", isHost: false },
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

    // Verify assignments were created
    expect(assignmentMap.participantAssignments["participant1"]).toHaveLength(
      1
    );
    expect(assignmentMap.participantAssignments["participant2"]).toHaveLength(
      1
    );
    expect(assignmentMap.participantAssignments["participant3"]).toHaveLength(
      1
    );

    // Step 4: Display assignments - second resolution (this is where the bug occurred)
    const itemsForDisplay = resolveVariable(
      "studentQuestions",
      hostContext
    ) as AssignmentItem[];

    // Step 5: Verify each participant can find their assigned item
    for (const participant of participants) {
      const assignedItemIds =
        assignmentMap.participantAssignments[participant.id];
      const assignedItems = itemsForDisplay.filter((item) =>
        assignedItemIds.includes(item.id)
      );

      // This should NOT be empty (the bug made this empty)
      expect(assignedItems).toHaveLength(1);
      expect(assignedItems[0].content).toBeDefined();
      expect(typeof assignedItems[0].content).toBe("string");
    }
  });

  it("should handle the exact warning scenario: 0 items on first click, 3 items on second click", () => {
    // This test simulates the warning behavior described in the bug report

    const state = {
      questions: {
        "user1-abc": "Q1",
        "user2-def": "Q2",
        "user3-ghi": "Q3",
      },
    };

    const context = {
      state,
      userId: "host",
      isHost: true,
    };

    // First resolution (when checking for warnings)
    const firstResolution = resolveVariable(
      "questions",
      context
    ) as AssignmentItem[];
    expect(firstResolution).toHaveLength(3); // Should NOT be 0

    // Second resolution (when actually assigning)
    const secondResolution = resolveVariable(
      "questions",
      context
    ) as AssignmentItem[];
    expect(secondResolution).toHaveLength(3);

    // Verify IDs match between resolutions
    expect(firstResolution[0].id).toBe(secondResolution[0].id);
    expect(firstResolution[1].id).toBe(secondResolution[1].id);
    expect(firstResolution[2].id).toBe(secondResolution[2].id);
  });
});
