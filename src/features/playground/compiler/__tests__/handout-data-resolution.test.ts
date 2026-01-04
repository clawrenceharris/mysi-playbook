import { describe, it, expect } from "vitest";
import { interpolateVariable } from "../../domain/variable-resolver";
import type { DataReference } from "../../domain/data-reference";
import type { VariableContext } from "../../domain/variable-resolver";

describe("Handout Data Resolution with Slide-Scoped State", () => {
  it("should resolve responses from slide-scoped structure", () => {
    const dataRef: DataReference = {
      slideId: "slide-1",
      accessor: "responses",
      transformer: "all",
    };

    const context: VariableContext = {
      state: {
        phase: "test",
        "slide-1": {
          responses: {
            "user1-uuid1": { "block-1": "Response 1" },
            "user2-uuid2": { "block-1": "Response 2" },
            "user3-uuid3": { "block-1": "Response 3" },
          },
        },
      },
      userId: "user1",
      isHost: true,
    };

    const result = interpolateVariable(dataRef, context);

    // Should return formatted responses
    expect(result).toContain("Response 1");
    expect(result).toContain("Response 2");
    expect(result).toContain("Response 3");
  });

  it("should return error message when slide data doesn't exist", () => {
    const dataRef: DataReference = {
      slideId: "nonexistent-slide",
      accessor: "responses",
      transformer: "all",
    };

    const context: VariableContext = {
      state: {
        phase: "test",
      },
      userId: "user1",
      isHost: true,
    };

    const result = interpolateVariable(dataRef, context);

    expect(result).toContain("[Error:");
    expect(result).toContain("not found]");
  });

  it("should return error message when accessor doesn't exist", () => {
    const dataRef: DataReference = {
      slideId: "slide-1",
      accessor: "responses",
      transformer: "all",
    };

    const context: VariableContext = {
      state: {
        phase: "test",
        "slide-1": {
          // No responses accessor
        },
      },
      userId: "user1",
      isHost: true,
    };

    const result = interpolateVariable(dataRef, context);

    expect(result).toContain("[Error:");
    expect(result).toContain("not found]");
  });
});
