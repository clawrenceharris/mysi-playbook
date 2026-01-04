import { describe, it, expect } from "vitest";
import {
  interpolateVariable,
  type VariableContext,
} from "../variable-resolver";

describe("Visual Formatting Examples", () => {
  it("should format student questions as readable list", () => {
    const context: VariableContext = {
      state: {
        write_a_question: {
          "alice-uuid1": "What is the capital of France?",
          "bob-uuid2": "How does photosynthesis work?",
          "charlie-uuid3": "What causes earthquakes?",
        },
      },
      userId: "alice",
      isHost: false,
    };

    const result = interpolateVariable("write_a_question", context);

    console.log("\n=== Display Variable Block Output ===");
    console.log(result);
    console.log("=====================================\n");

    // Verify it's formatted correctly
    expect(result).toContain("•");
    expect(result).toContain("What is the capital of France?");
    expect(result).not.toBe("[object Object]");
  });

  it("should format poll responses as readable list", () => {
    const context: VariableContext = {
      state: {
        favorite_color: {
          "user1-abc": "Blue",
          "user2-def": "Red",
          "user3-ghi": "Green",
          "user4-jkl": "Blue",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("favorite_color", context);

    console.log("\n=== Poll Results Display ===");
    console.log(result);
    console.log("============================\n");

    expect(result).toContain("Blue");
    expect(result).toContain("Red");
    expect(result).toContain("Green");
  });

  it("should show error message for missing variable", () => {
    const context: VariableContext = {
      state: {},
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("missing_variable", context);

    console.log("\n=== Error Display ===");
    console.log(result);
    console.log("=====================\n");

    expect(result).toContain("[Error:");
    expect(result).toContain("missing_variable");
  });
});
