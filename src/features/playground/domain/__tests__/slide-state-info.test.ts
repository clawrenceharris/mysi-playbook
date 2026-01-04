import { describe, it, expect } from "vitest";
import { analyzeSlideState, SlideStateInfo } from "../slide-state-info";
import type { StrategyState } from "@/types/playbook";

describe("analyzeSlideState", () => {
  it("should return empty info for slide with no data", () => {
    const state: StrategyState = {
      phase: "slide-1",
      "slide-1": {},
    };

    const result = analyzeSlideState(state, "slide-1");

    expect(result).toEqual({
      slideId: "slide-1",
      hasResponses: false,
      hasAssignments: false,
      hasAssignmentResponses: false,
      responseCount: 0,
      assignmentCount: 0,
      assignmentResponseCount: 0,
    });
  });

  it("should detect responses data and count items", () => {
    const state: StrategyState = {
      phase: "slide-1",
      "slide-1": {
        responses: {
          "user1-abc": "Answer 1",
          "user2-def": "Answer 2",
          "user3-ghi": "Answer 3",
        },
      },
    };

    const result = analyzeSlideState(state, "slide-1");

    expect(result.hasResponses).toBe(true);
    expect(result.responseCount).toBe(3);
    expect(result.hasAssignments).toBe(false);
    expect(result.hasAssignmentResponses).toBe(false);
  });

  it("should detect assignments data and count items", () => {
    const state: StrategyState = {
      phase: "slide-1",
      "slide-1": {
        assignments: {
          user1: ["item1", "item2"],
          user2: ["item3"],
        },
      },
    };

    const result = analyzeSlideState(state, "slide-1");

    expect(result.hasAssignments).toBe(true);
    expect(result.assignmentCount).toBe(2);
    expect(result.hasResponses).toBe(false);
    expect(result.hasAssignmentResponses).toBe(false);
  });

  it("should detect assignmentResponses data and count items", () => {
    const state: StrategyState = {
      phase: "slide-1",
      "slide-1": {
        assignmentResponses: [
          { assignmentId: "a1", userId: "user1", response: "Response 1" },
          { assignmentId: "a2", userId: "user2", response: "Response 2" },
        ],
      },
    };

    const result = analyzeSlideState(state, "slide-1");

    expect(result.hasAssignmentResponses).toBe(true);
    expect(result.assignmentResponseCount).toBe(2);
    expect(result.hasResponses).toBe(false);
    expect(result.hasAssignments).toBe(false);
  });

  it("should handle slide with all data types", () => {
    const state: StrategyState = {
      phase: "slide-1",
      "slide-1": {
        responses: {
          "user1-abc": "Answer",
        },
        assignments: {
          user1: ["item1"],
        },
        assignmentResponses: [
          { assignmentId: "a1", userId: "user1", response: "Response" },
        ],
      },
    };

    const result = analyzeSlideState(state, "slide-1");

    expect(result.hasResponses).toBe(true);
    expect(result.hasAssignments).toBe(true);
    expect(result.hasAssignmentResponses).toBe(true);
    expect(result.responseCount).toBe(1);
    expect(result.assignmentCount).toBe(1);
    expect(result.assignmentResponseCount).toBe(1);
  });

  it("should return empty info for non-existent slide", () => {
    const state: StrategyState = {
      phase: "slide-1",
      "slide-1": {
        responses: { "user1-abc": "Answer" },
      },
    };

    const result = analyzeSlideState(state, "slide-2");

    expect(result).toEqual({
      slideId: "slide-2",
      hasResponses: false,
      hasAssignments: false,
      hasAssignmentResponses: false,
      responseCount: 0,
      assignmentCount: 0,
      assignmentResponseCount: 0,
    });
  });

  it("should handle empty responses object", () => {
    const state: StrategyState = {
      phase: "slide-1",
      "slide-1": {
        responses: {},
      },
    };

    const result = analyzeSlideState(state, "slide-1");

    expect(result.hasResponses).toBe(false);
    expect(result.responseCount).toBe(0);
  });

  it("should handle empty assignments object", () => {
    const state: StrategyState = {
      phase: "slide-1",
      "slide-1": {
        assignments: {},
      },
    };

    const result = analyzeSlideState(state, "slide-1");

    expect(result.hasAssignments).toBe(false);
    expect(result.assignmentCount).toBe(0);
  });

  it("should handle empty assignmentResponses array", () => {
    const state: StrategyState = {
      phase: "slide-1",
      "slide-1": {
        assignmentResponses: [],
      },
    };

    const result = analyzeSlideState(state, "slide-1");

    expect(result.hasAssignmentResponses).toBe(false);
    expect(result.assignmentResponseCount).toBe(0);
  });
});
