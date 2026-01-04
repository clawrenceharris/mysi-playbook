import { describe, it, expect } from "vitest";
import { resolveVariable } from "../variable-resolver";

describe("Assignment ID Stability", () => {
  it("should return consistent IDs when resolving the same variable multiple times", () => {
    // RED: Test that variable resolution returns stable IDs
    const state = {
      customVar: {
        "user1-abc123": "Question 1",
        "user2-def456": "Question 2",
        "user3-ghi789": "Question 3",
      },
    };

    const context = {
      state,
      userId: "host",
      isHost: true,
    };

    // Resolve the variable twice
    const firstResolution = resolveVariable("customVar", context);
    const secondResolution = resolveVariable("customVar", context);

    // IDs should be the same
    expect(firstResolution).toHaveLength(3);
    expect(secondResolution).toHaveLength(3);

    // Check that IDs are stable
    expect(firstResolution[0].id).toBe(secondResolution[0].id);
    expect(firstResolution[1].id).toBe(secondResolution[1].id);
    expect(firstResolution[2].id).toBe(secondResolution[2].id);
  });
});
