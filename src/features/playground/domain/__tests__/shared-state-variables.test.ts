import { describe, it, expect } from "vitest";
import {
  resolveVariable,
  interpolateVariable,
  type VariableContext,
} from "../variable-resolver";

describe("Shared State Variables - Custom Variable Names", () => {
  it("should resolve custom variable from collect input block", () => {
    const context: VariableContext = {
      state: {
        write_a_question: {
          "user1-uuid1": "What is 2+2?",
          "user2-uuid2": "What is the capital of France?",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("write_a_question", context);
    // Should convert userId-uuid object to array of AssignmentItems
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("content", "What is 2+2?");
    expect(result[0]).toHaveProperty("authorId", "user1");
    expect(result[1]).toHaveProperty(
      "content",
      "What is the capital of France?"
    );
    expect(result[1]).toHaveProperty("authorId", "user2");
  });

  it("should resolve custom variable and format as array of values", () => {
    const context: VariableContext = {
      state: {
        student_questions: {
          "user1-uuid1": "Question 1",
          "user2-uuid2": "Question 2",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("student_questions", context);
    expect(result).toBeDefined();
  });

  it("should interpolate custom variable as readable list", () => {
    const context: VariableContext = {
      state: {
        responses_var: {
          "user1-uuid1": "Answer A",
          "user2-uuid2": "Answer B",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("responses_var", context);
    // Should display in a readable format, not [object Object]
    expect(result).not.toBe("[object Object]");
    expect(result).toContain("Answer A");
    expect(result).toContain("Answer B");
    // Should be formatted as bullet list
    expect(result).toContain("•");
  });

  it("should handle empty custom variable as empty array", () => {
    const context: VariableContext = {
      state: {
        empty_var: {},
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("empty_var", context);
    // Empty custom variables should return empty array for consistency with handout blocks
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([]);
  });

  it("should return error for non-existent custom variable", () => {
    const context: VariableContext = {
      state: {},
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("nonexistent_var", context);
    expect(result).toContain("[Error:");
    expect(result).toContain("nonexistent_var");
  });
});

describe("Shared State Variables - responses accessor", () => {
  it("should treat 'responses' as a custom variable (not a predefined accessor)", () => {
    const context: VariableContext = {
      state: {
        responses: {
          "user1-uuid1": "Response 1",
          "user2-uuid2": "Response 2",
          "user3-uuid3": "Response 3",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("responses", context);
    // Should convert userId-uuid structure to AssignmentItem array
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3);
    expect(result[0]).toHaveProperty("content", "Response 1");
  });

  it("should resolve nested responses structure with dot notation", () => {
    const context: VariableContext = {
      state: {
        responses: {
          block1: {
            "user1-uuid1": "My Response 1",
            "user2-uuid2": "Other Response",
          },
          block2: {
            "user1-uuid3": "My Response 2",
          },
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("responses.block1", context);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("content", "My Response 1");
  });
});

describe("Variable Interpolation - Formatting", () => {
  it("should format response objects as bullet lists", () => {
    const context: VariableContext = {
      state: {
        write_a_question: {
          "user1-uuid1": "What is 2+2?",
          "user2-uuid2": "What is the capital of France?",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("write_a_question", context);
    expect(result).toContain("•");
    expect(result).toContain("What is 2+2?");
    expect(result).toContain("What is the capital of France?");
  });

  it("should format custom variable arrays as bullet lists", () => {
    const context: VariableContext = {
      state: {
        myResponses: {
          "user1-uuid1": "Response 1",
          "user2-uuid2": "Response 2",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("myResponses", context);
    expect(result).toContain("•");
    expect(result).toContain("Response 1");
    expect(result).toContain("Response 2");
  });

  it("should format simple strings without bullets", () => {
    const context: VariableContext = {
      state: {
        name: "John Doe",
      },
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("name", context);
    expect(result).toBe("John Doe");
    expect(result).not.toContain("•");
  });
});
