import { describe, it, expect, vi } from "vitest";
import {
  resolveVariable,
  interpolateVariable,
  type VariableContext,
} from "../variable-resolver";

describe("Variable Resolver - resolveVariable", () => {
  it("should resolve simple variable from state", () => {
    const context: VariableContext = {
      state: { name: "John" },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("name", context);
    expect(result).toBe("John");
  });

  it("should resolve nested variable with dot notation", () => {
    const context: VariableContext = {
      state: {
        user: {
          name: "Jane",
          email: "jane@example.com",
        },
      },
      userId: "user1",
      isHost: false,
    };

    expect(resolveVariable("user.name", context)).toBe("Jane");
    expect(resolveVariable("user.email", context)).toBe("jane@example.com");
  });

  it("should resolve deeply nested paths", () => {
    const context: VariableContext = {
      state: {
        data: {
          responses: {
            student1: {
              answer: "42",
            },
          },
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("data.responses.student1.answer", context);
    expect(result).toBe("42");
  });

  it("should return empty array for non-existent paths", () => {
    const context: VariableContext = {
      state: { name: "John" },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("nonexistent", context);
    expect(result).toEqual([]);
  });

  it("should return empty array for invalid nested paths", () => {
    const context: VariableContext = {
      state: { user: { name: "John" } },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("user.email.invalid", context);
    expect(result).toEqual([]);
  });
});

describe("Variable Resolver - Predefined Accessors (Removed)", () => {
  it("should treat 'responses' as a custom variable name", () => {
    const context: VariableContext = {
      state: {
        responses: {
          "user1-uuid1": "answer1",
          "user2-uuid2": "answer2",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("responses", context);
    // Should convert userId-uuid structure to AssignmentItem array
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("content", "answer1");
    expect(result[1]).toHaveProperty("content", "answer2");
  });

  it("should handle nested responses structure with dot notation", () => {
    const context: VariableContext = {
      state: {
        responses: {
          block1: {
            "user1-uuid1": "answer1",
            "user1-uuid2": "answer2",
          },
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("responses.block1", context);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });
});

describe("Variable Resolver - Custom Variables", () => {
  it("should resolve custom variables from root level of state", () => {
    const context: VariableContext = {
      state: {
        student_ideas: {
          "user1-uuid1": "Idea 1",
          "user2-uuid2": "Idea 2",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("student_ideas", context);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should convert userId-uuid object structures to arrays", () => {
    const context: VariableContext = {
      state: {
        custom_responses: {
          "user1-abc123": "Response 1",
          "user2-def456": "Response 2",
          "user3-ghi789": "Response 3",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("custom_responses", context);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3);
  });

  it("should extract authorId from userId-uuid keys", () => {
    const context: VariableContext = {
      state: {
        ideas: {
          "user123-uuid1": "First idea",
          "user456-uuid2": "Second idea",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("ideas", context);
    expect(result[0]).toHaveProperty("authorId", "user123");
    expect(result[1]).toHaveProperty("authorId", "user456");
  });

  it("should include content in converted array items", () => {
    const context: VariableContext = {
      state: {
        custom_answers: {
          "user1-uuid1": "Answer A",
          "user2-uuid2": "Answer B",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("custom_answers", context);
    expect(result[0]).toHaveProperty("content", "Answer A");
    expect(result[1]).toHaveProperty("content", "Answer B");
  });

  it("should include id and createdAt in converted array items", () => {
    const context: VariableContext = {
      state: {
        items: {
          "user1-uuid1": "Item 1",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("items", context);
    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("createdAt");
    expect(typeof result[0].id).toBe("string");
    expect(typeof result[0].createdAt).toBe("number");
  });

  it("should return empty array for missing custom variables", () => {
    const context: VariableContext = {
      state: {},
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("nonexistent_custom_var", context);
    expect(result).toEqual([]);
  });

  it("should check root level before dot notation", () => {
    const context: VariableContext = {
      state: {
        student_ideas: {
          "user1-uuid1": "Root level idea",
        },
        nested: {
          student_ideas: "Nested value",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("student_ideas", context);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].content).toBe("Root level idea");
  });

  it("should handle custom variables that are already arrays", () => {
    const context: VariableContext = {
      state: {
        my_array: ["item1", "item2", "item3"],
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("my_array", context);
    expect(result).toEqual(["item1", "item2", "item3"]);
  });

  it("should not convert objects without userId-uuid pattern", () => {
    const context: VariableContext = {
      state: {
        config: {
          setting1: "value1",
          setting2: "value2",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("config", context);
    expect(result).toEqual({
      setting1: "value1",
      setting2: "value2",
    });
  });
});

describe("Variable Resolver - Error Handling", () => {
  it("should return error message for invalid variable reference", () => {
    const context: VariableContext = {
      state: {},
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("nonexistent.path", context);
    expect(result).toEqual([]);
  });

  it("should handle null state gracefully", () => {
    const context: VariableContext = {
      state: null,
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("any.path", context);
    expect(result).toEqual([]);
  });
});

describe("Variable Resolver - interpolateVariable", () => {
  it("should resolve and format a simple variable", () => {
    const context: VariableContext = {
      state: { name: "Alice" },
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("name", context);
    expect(result).toBe("Alice");
  });

  it("should resolve and format nested variable paths", () => {
    const context: VariableContext = {
      state: {
        user: {
          name: "Charlie",
          email: "charlie@example.com",
        },
      },
      userId: "user1",
      isHost: false,
    };

    expect(interpolateVariable("user.name", context)).toBe("Charlie");
    expect(interpolateVariable("user.email", context)).toBe(
      "charlie@example.com"
    );
  });

  it("should show error for non-existent variables", () => {
    const context: VariableContext = {
      state: {},
      userId: "user123",
      isHost: false,
    };

    const result = interpolateVariable("current_user", context);
    expect(result).toContain("[Error:");
    expect(result).toContain("current_user");
  });

  it("should display error message for invalid variables", () => {
    const context: VariableContext = {
      state: {},
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("invalid.path", context);
    expect(result).toContain("[Error:");
    expect(result).toContain("invalid.path");
  });

  it("should format arrays as bullet lists", () => {
    const context: VariableContext = {
      state: {
        items: ["answer1", "answer2"],
      },
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("items", context);
    expect(result).toContain("•");
    expect(result).toContain("answer1");
    expect(result).toContain("answer2");
  });

  it("should format objects as JSON strings", () => {
    const context: VariableContext = {
      state: {
        data: { key: "value", count: 42 },
      },
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("data", context);
    // Should be formatted JSON (with pretty printing)
    expect(result).toContain('"key"');
    expect(result).toContain('"value"');
    expect(result).toContain('"count"');
    expect(result).toContain("42");
  });

  it("should format numbers as strings", () => {
    const context: VariableContext = {
      state: { count: 5 },
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("count", context);
    expect(result).toBe("5");
  });

  it("should handle null values", () => {
    const context: VariableContext = {
      state: { value: null },
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("value", context);
    expect(result).toContain("[Error:");
  });

  it("should handle undefined values", () => {
    const context: VariableContext = {
      state: {},
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("nonexistent", context);
    expect(result).toContain("[Error:");
    expect(result).toContain("nonexistent");
  });
});

describe("Variable Resolver - interpolateVariable with Custom Variables", () => {
  it("should format custom variables with userId-uuid structure correctly", () => {
    const context: VariableContext = {
      state: {
        student_ideas: {
          "user1-uuid1": "First idea",
          "user2-uuid2": "Second idea",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("student_ideas", context);
    expect(result).toContain("•");
    expect(result).toContain("First idea");
    expect(result).toContain("Second idea");
  });

  it("should handle array format custom variables", () => {
    const context: VariableContext = {
      state: {
        my_list: ["Item 1", "Item 2", "Item 3"],
      },
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("my_list", context);
    expect(result).toContain("•");
    expect(result).toContain("Item 1");
    expect(result).toContain("Item 2");
    expect(result).toContain("Item 3");
  });

  it("should handle object format custom variables", () => {
    const context: VariableContext = {
      state: {
        config: {
          setting1: "value1",
          setting2: "value2",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("config", context);
    expect(result).toContain("setting1");
    expect(result).toContain("value1");
    expect(result).toContain("setting2");
    expect(result).toContain("value2");
  });

  it("should show appropriate empty message when variable is undefined", () => {
    const context: VariableContext = {
      state: {},
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("missing_var", context);
    expect(result).toContain("[Error:");
    expect(result).toContain("missing_var");
    expect(result).toContain("not found");
  });

  it("should show appropriate empty message when variable is empty array", () => {
    const context: VariableContext = {
      state: {
        empty_list: [],
      },
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("empty_list", context);
    expect(result).toContain("[Error:");
    expect(result).toContain("empty_list");
  });

  it("should format converted AssignmentItem arrays correctly", () => {
    const context: VariableContext = {
      state: {
        custom_data: {
          "user1-abc": "Response A",
          "user2-def": "Response B",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = interpolateVariable("custom_data", context);
    expect(result).toContain("•");
    expect(result).toContain("Response A");
    expect(result).toContain("Response B");
  });
});

describe("Variable Resolver - DataReference Support", () => {
  it("should resolve DataReference with 'all' transformer", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: {
            "user1-uuid1": "Response 1",
            "user2-uuid2": "Response 2",
          },
        },
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-1",
      accessor: "responses" as const,
      transformer: "all" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(result).toEqual({
      "user1-uuid1": "Response 1",
      "user2-uuid2": "Response 2",
    });
  });

  it("should resolve DataReference with 'currentUser' transformer", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: {
            "user1-uuid1": "My response",
            "user2-uuid2": "Other response",
          },
        },
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-1",
      accessor: "responses" as const,
      transformer: "currentUser" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(result).toEqual({
      "user1-uuid1": "My response",
    });
  });

  it("should resolve DataReference with 'count' transformer", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: {
            "user1-uuid1": "Response 1",
            "user2-uuid2": "Response 2",
            "user3-uuid3": "Response 3",
          },
        },
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-1",
      accessor: "responses" as const,
      transformer: "count" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(result).toBe(3);
  });

  it("should resolve DataReference with 'excludeCurrentUser' transformer", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: {
            "user1-uuid1": "My response",
            "user2-uuid2": "Other response 1",
            "user3-uuid3": "Other response 2",
          },
        },
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-1",
      accessor: "responses" as const,
      transformer: "excludeCurrentUser" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(result).toEqual({
      "user2-uuid2": "Other response 1",
      "user3-uuid3": "Other response 2",
    });
  });

  it("should return empty object for non-existent slide", () => {
    const context: VariableContext = {
      state: {},
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "non-existent",
      accessor: "responses" as const,
      transformer: "all" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(result).toEqual({});
  });

  it("should return empty object for non-existent accessor", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: {
            "user1-uuid1": "Response 1",
          },
        },
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-1",
      accessor: "assignments" as const,
      transformer: "all" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(result).toEqual({});
  });

  it("should maintain backward compatibility with string references", () => {
    const context: VariableContext = {
      state: {
        customVar: "value",
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("customVar", context);
    expect(result).toBe("value");
  });

  it("should resolve DataReference for assignments accessor", () => {
    const context: VariableContext = {
      state: {
        "slide-2": {
          assignments: {
            user1: ["item1", "item2"],
            user2: ["item3"],
          },
        },
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-2",
      accessor: "assignments" as const,
      transformer: "all" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(result).toEqual({
      user1: ["item1", "item2"],
      user2: ["item3"],
    });
  });

  it("should resolve DataReference for assignmentResponses accessor", () => {
    const context: VariableContext = {
      state: {
        "slide-3": {
          assignmentResponses: [
            { assignmentId: "a1", userId: "user1", response: "Answer 1" },
            { assignmentId: "a2", userId: "user2", response: "Answer 2" },
          ],
        },
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-3",
      accessor: "assignmentResponses" as const,
      transformer: "all" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(result).toEqual([
      { assignmentId: "a1", userId: "user1", response: "Answer 1" },
      { assignmentId: "a2", userId: "user2", response: "Answer 2" },
    ]);
  });
});

describe("Variable Resolver - Legacy Variable Resolution", () => {
  it("should resolve custom variable from root level", () => {
    const context: VariableContext = {
      state: {
        myCustomVar: "root value",
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("myCustomVar", context);
    expect(result).toBe("root value");
  });

  it("should check all slide namespaces if not found at root", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: {
            "user1-uuid1": "Response 1",
          },
        },
        "slide-2": {
          customData: "Found in slide 2",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("customData", context);
    expect(result).toBe("Found in slide 2");
  });

  it("should prioritize root level over slide namespaces", () => {
    const context: VariableContext = {
      state: {
        myVar: "root value",
        "slide-1": {
          myVar: "slide value",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("myVar", context);
    expect(result).toBe("root value");
  });

  it("should return empty array if variable not found anywhere", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: {},
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("nonExistent", context);
    expect(result).toEqual([]);
  });

  it("should handle slide namespaces with standard accessors", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: {
            "user1-uuid1": "Response 1",
          },
        },
      },
      userId: "user1",
      isHost: false,
    };

    // Should not find 'responses' as a legacy variable since it's a standard accessor
    const result = resolveVariable("responses", context);
    expect(result).toEqual([]);
  });

  it("should search through multiple slides for legacy variable", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: {},
        },
        "slide-2": {
          assignments: {},
        },
        "slide-3": {
          legacyVar: "found it",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("legacyVar", context);
    expect(result).toBe("found it");
  });

  it("should skip phase property when searching slides", () => {
    const context: VariableContext = {
      state: {
        phase: "current-slide",
        "slide-1": {
          myData: "slide data",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("myData", context);
    expect(result).toBe("slide data");
  });

  it("should log deprecation warning for legacy usage", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const context: VariableContext = {
      state: {
        "slide-1": {
          legacyVar: "value",
        },
      },
      userId: "user1",
      isHost: false,
    };

    resolveVariable("legacyVar", context);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/DEPRECATED.*legacyVar/)
    );

    consoleSpy.mockRestore();
  });

  it("should not log warning for root-level variables", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const context: VariableContext = {
      state: {
        rootVar: "value",
      },
      userId: "user1",
      isHost: false,
    };

    resolveVariable("rootVar", context);

    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

describe("Variable Resolver - Comprehensive Slide-Scoped Resolution (Req 7.1, 7.2, 7.3)", () => {
  it("should resolve slide ID from DataReference (Req 7.1)", () => {
    const context: VariableContext = {
      state: {
        "slide-abc": {
          responses: {
            "user1-uuid1": "Test response",
          },
        },
        "slide-xyz": {
          responses: {
            "user2-uuid2": "Other response",
          },
        },
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-abc",
      accessor: "responses" as const,
      transformer: "all" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(result).toHaveProperty("user1-uuid1", "Test response");
    expect(result).not.toHaveProperty("user2-uuid2");
  });

  it("should access specified state accessor for slide (Req 7.2)", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: { "user1-uuid1": "Response data" },
          assignments: { user1: ["item1"] },
          assignmentResponses: [{ assignmentId: "a1", response: "Answer" }],
        },
      },
      userId: "user1",
      isHost: false,
    };

    // Test responses accessor
    const responsesRef = {
      slideId: "slide-1",
      accessor: "responses" as const,
      transformer: "all" as const,
    };
    expect(resolveVariable(responsesRef, context)).toHaveProperty(
      "user1-uuid1"
    );

    // Test assignments accessor
    const assignmentsRef = {
      slideId: "slide-1",
      accessor: "assignments" as const,
      transformer: "all" as const,
    };
    expect(resolveVariable(assignmentsRef, context)).toHaveProperty("user1");

    // Test assignmentResponses accessor
    const assignmentResponsesRef = {
      slideId: "slide-1",
      accessor: "assignmentResponses" as const,
      transformer: "all" as const,
    };
    expect(resolveVariable(assignmentResponsesRef, context)).toHaveLength(1);
  });

  it("should apply specified transformer to slide data (Req 7.3)", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: {
            "user1-uuid1": "My response",
            "user2-uuid2": "Other response",
            "user3-uuid3": "Another response",
          },
        },
      },
      userId: "user1",
      isHost: false,
    };

    // Test 'all' transformer
    const allRef = {
      slideId: "slide-1",
      accessor: "responses" as const,
      transformer: "all" as const,
    };
    const allResult = resolveVariable(allRef, context);
    expect(Object.keys(allResult)).toHaveLength(3);

    // Test 'currentUser' transformer
    const currentUserRef = {
      slideId: "slide-1",
      accessor: "responses" as const,
      transformer: "currentUser" as const,
    };
    const currentUserResult = resolveVariable(currentUserRef, context);
    expect(Object.keys(currentUserResult)).toHaveLength(1);
    expect(currentUserResult).toHaveProperty("user1-uuid1");

    // Test 'count' transformer
    const countRef = {
      slideId: "slide-1",
      accessor: "responses" as const,
      transformer: "count" as const,
    };
    expect(resolveVariable(countRef, context)).toBe(3);

    // Test 'excludeCurrentUser' transformer
    const excludeRef = {
      slideId: "slide-1",
      accessor: "responses" as const,
      transformer: "excludeCurrentUser" as const,
    };
    const excludeResult = resolveVariable(excludeRef, context);
    expect(Object.keys(excludeResult)).toHaveLength(2);
    expect(excludeResult).not.toHaveProperty("user1-uuid1");
  });
});

describe("Variable Resolver - Invalid References (Req 7.4, 7.5)", () => {
  it("should return empty object when referenced slide has no data (Req 7.4)", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: {},
        },
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-2", // Non-existent slide
      accessor: "responses" as const,
      transformer: "all" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(result).toEqual({});
  });

  it("should return empty object when accessor has no data (Req 7.4)", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: { "user1-uuid1": "data" },
        },
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-1",
      accessor: "assignments" as const, // Accessor doesn't exist
      transformer: "all" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(result).toEqual({});
  });

  it("should handle null slide data gracefully", () => {
    const context: VariableContext = {
      state: {
        "slide-1": null,
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-1",
      accessor: "responses" as const,
      transformer: "all" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(result).toEqual({});
  });

  it("should handle undefined accessor data gracefully", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: undefined,
        },
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-1",
      accessor: "responses" as const,
      transformer: "all" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(result).toEqual({});
  });

  it("should display error message for invalid DataReference in interpolateVariable (Req 7.5)", () => {
    const context: VariableContext = {
      state: {},
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "non-existent-slide",
      accessor: "responses" as const,
      transformer: "all" as const,
    };

    const result = interpolateVariable(dataRef, context);
    expect(result).toContain("[Error:");
    expect(result).toContain("non-existent-slide");
    expect(result).toContain("responses");
  });

  it("should display error message for empty DataReference result", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: {},
        },
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-1",
      accessor: "responses" as const,
      transformer: "all" as const,
    };

    const result = interpolateVariable(dataRef, context);
    expect(result).toContain("[Error:");
    expect(result).toContain("not found");
  });
});

describe("Variable Resolver - Backward Compatibility (Req 8.1, 8.2)", () => {
  it("should attempt to resolve custom variable from root-level state first (Req 8.1)", () => {
    const context: VariableContext = {
      state: {
        customVariable: "root level value",
        "slide-1": {
          customVariable: "slide level value",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("customVariable", context);
    expect(result).toBe("root level value");
  });

  it("should check slide-scoped data when custom variable not found at root (Req 8.2)", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: {},
        },
        "slide-2": {
          oldCustomVar: "found in slide namespace",
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("oldCustomVar", context);
    expect(result).toBe("found in slide namespace");
  });

  it("should maintain backward compatibility with string variable references", () => {
    const context: VariableContext = {
      state: {
        legacyVar: "legacy value",
      },
      userId: "user1",
      isHost: false,
    };

    // String reference should still work
    const result = resolveVariable("legacyVar", context);
    expect(result).toBe("legacy value");
  });

  it("should handle both DataReference and string types in same context", () => {
    const context: VariableContext = {
      state: {
        legacyVar: "string reference",
        "slide-1": {
          responses: {
            "user1-uuid1": "DataReference value",
          },
        },
      },
      userId: "user1",
      isHost: false,
    };

    // String reference
    const stringResult = resolveVariable("legacyVar", context);
    expect(stringResult).toBe("string reference");

    // DataReference
    const dataRef = {
      slideId: "slide-1",
      accessor: "responses" as const,
      transformer: "all" as const,
    };
    const dataRefResult = resolveVariable(dataRef, context);
    expect(dataRefResult).toHaveProperty("user1-uuid1");
  });

  it("should not search for standard accessors in legacy fallback", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: { "user1-uuid1": "data" },
        },
      },
      userId: "user1",
      isHost: false,
    };

    // 'responses' is a standard accessor, should not be found via legacy search
    const result = resolveVariable("responses", context);
    expect(result).toEqual([]);
  });

  it("should not search for 'assignments' in legacy fallback", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          assignments: { user1: ["item1"] },
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("assignments", context);
    expect(result).toEqual([]);
  });

  it("should not search for 'assignmentResponses' in legacy fallback", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          assignmentResponses: [{ assignmentId: "a1", response: "data" }],
        },
      },
      userId: "user1",
      isHost: false,
    };

    const result = resolveVariable("assignmentResponses", context);
    expect(result).toEqual([]);
  });
});

describe("Variable Resolver - Transformer Application Edge Cases", () => {
  it("should apply currentUser transformer to array-type data", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          assignmentResponses: [
            {
              assignmentId: "a1",
              userId: "user1",
              authorId: "user1",
              response: "My answer",
            },
            {
              assignmentId: "a2",
              userId: "user2",
              authorId: "user2",
              response: "Other answer",
            },
          ],
        },
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-1",
      accessor: "assignmentResponses" as const,
      transformer: "currentUser" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe("user1");
  });

  it("should apply excludeCurrentUser transformer to array-type data", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          assignmentResponses: [
            {
              assignmentId: "a1",
              userId: "user1",
              authorId: "user1",
              response: "My answer",
            },
            {
              assignmentId: "a2",
              userId: "user2",
              authorId: "user2",
              response: "Other answer",
            },
            {
              assignmentId: "a3",
              userId: "user3",
              authorId: "user3",
              response: "Another answer",
            },
          ],
        },
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-1",
      accessor: "assignmentResponses" as const,
      transformer: "excludeCurrentUser" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result.every((item) => item.userId !== "user1")).toBe(true);
  });

  it("should apply count transformer to empty data", () => {
    const context: VariableContext = {
      state: {
        "slide-1": {
          responses: {},
        },
      },
      userId: "user1",
      isHost: false,
    };

    const dataRef = {
      slideId: "slide-1",
      accessor: "responses" as const,
      transformer: "count" as const,
    };

    const result = resolveVariable(dataRef, context);
    expect(result).toBe(0);
  });

  it("should handle transformers with different user contexts", () => {
    const state = {
      "slide-1": {
        responses: {
          "user1-uuid1": "User 1 response",
          "user2-uuid2": "User 2 response",
          "user3-uuid3": "User 3 response",
        },
      },
    };

    const dataRef = {
      slideId: "slide-1",
      accessor: "responses" as const,
      transformer: "currentUser" as const,
    };

    // Test as user1
    const user1Context: VariableContext = {
      state,
      userId: "user1",
      isHost: false,
    };
    const user1Result = resolveVariable(dataRef, user1Context);
    expect(Object.keys(user1Result)).toHaveLength(1);
    expect(user1Result).toHaveProperty("user1-uuid1");

    // Test as user2
    const user2Context: VariableContext = {
      state,
      userId: "user2",
      isHost: false,
    };
    const user2Result = resolveVariable(dataRef, user2Context);
    expect(Object.keys(user2Result)).toHaveLength(1);
    expect(user2Result).toHaveProperty("user2-uuid2");
  });
});
