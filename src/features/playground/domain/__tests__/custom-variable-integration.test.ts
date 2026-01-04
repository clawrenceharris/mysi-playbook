import { describe, it, expect } from "vitest";
import {
  resolveVariable,
  interpolateVariable,
  type VariableContext,
} from "../variable-resolver";

describe("Custom Variable Integration - End to End", () => {
  it("should handle collect input with custom variable name", () => {
    // Simulate state after collect input block with custom variable
    const context: VariableContext = {
      state: {
        write_a_question: {
          "user1-abc123": "What is the meaning of life?",
          "user2-def456": "How does photosynthesis work?",
          "user3-ghi789": "What causes earthquakes?",
        },
      },
      userId: "user1",
      isHost: false,
    };

    // Resolve the variable
    const resolved = resolveVariable("write_a_question", context);
    expect(resolved).toBeDefined();
    expect(Object.keys(resolved)).toHaveLength(3);

    // Interpolate for display
    const displayed = interpolateVariable("write_a_question", context);
    expect(displayed).toContain("What is the meaning of life?");
    expect(displayed).toContain("How does photosynthesis work?");
    expect(displayed).toContain("What causes earthquakes?");
    expect(displayed).toContain("•");
    expect(displayed).not.toBe("[object Object]");
  });

  it("should handle multiple custom variables", () => {
    const context: VariableContext = {
      state: {
        student_questions: {
          "user1-abc": "Question 1",
          "user2-def": "Question 2",
        },
        student_answers: {
          "user1-ghi": "Answer 1",
          "user2-jkl": "Answer 2",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const questions = interpolateVariable("student_questions", context);
    const answers = interpolateVariable("student_answers", context);

    expect(questions).toContain("Question 1");
    expect(questions).toContain("Question 2");
    expect(answers).toContain("Answer 1");
    expect(answers).toContain("Answer 2");
  });

  it("should handle default responses structure alongside custom variables", () => {
    const context: VariableContext = {
      state: {
        // Default responses structure (blocks without custom variable names)
        responses: {
          "block-123": {
            "user1-abc": "Default response 1",
            "user2-def": "Default response 2",
          },
        },
        // Custom variable
        custom_var: {
          "user1-ghi": "Custom response 1",
          "user2-jkl": "Custom response 2",
        },
      },
      userId: "user1",
      isHost: false,
    };

    // Should resolve default responses using dot notation
    const defaultResponses = resolveVariable("responses.block-123", context);
    expect(Array.isArray(defaultResponses)).toBe(true);
    expect(defaultResponses).toHaveLength(2);
    expect(defaultResponses[0]).toHaveProperty("content", "Default response 1");
    expect(defaultResponses[1]).toHaveProperty("content", "Default response 2");

    // Should resolve custom variable
    const customVar = interpolateVariable("custom_var", context);
    expect(customVar).toContain("Custom response 1");
    expect(customVar).toContain("Custom response 2");
  });

  it("should handle empty custom variable gracefully", () => {
    const context: VariableContext = {
      state: {
        empty_responses: {},
      },
      userId: "user1",
      isHost: false,
    };

    const resolved = resolveVariable("empty_responses", context);
    // Empty custom variables should be converted to empty arrays
    expect(Array.isArray(resolved)).toBe(true);
    expect(resolved).toEqual([]);

    // When interpolated, empty arrays show error message (no items to display)
    const result = interpolateVariable("empty_responses", context);
    expect(result).toContain("[Error:");
  });

  it("should show error for non-existent custom variable", () => {
    const context: VariableContext = {
      state: {},
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("nonexistent_variable", context);
    expect(result).toContain("[Error:");
    expect(result).toContain("nonexistent_variable");
    expect(result).toContain("not found");
  });
});
