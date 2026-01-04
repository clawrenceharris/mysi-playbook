import { describe, it, expect } from "vitest";
import type { StrategyState } from "../playbook";

describe("ExtendedStrategyState - Slide-Scoped Structure", () => {
  describe("Type Guards", () => {
    it("should identify slide-scoped state structure", () => {
      const slideScopedState: StrategyState = {
        phase: "slide-1",
        "slide-123": {
          responses: { "user1-abc": "answer" },
        },
      };

      // Type guard function should exist
      const isSlideScoped = (state: StrategyState): boolean => {
        // Check if any key (except 'phase') matches slide ID pattern
        const keys = Object.keys(state).filter((k) => k !== "phase");
        return keys.some((key) => {
          const value = state[key];
          return (
            typeof value === "object" &&
            value !== null &&
            ("responses" in value ||
              "assignments" in value ||
              "assignmentResponses" in value)
          );
        });
      };

      expect(isSlideScoped(slideScopedState)).toBe(true);
    });

    it("should identify legacy state structure", () => {
      const legacyState: StrategyState = {
        phase: "intro",
        responses: { user1: "answer" },
        customVar: "value",
      };

      const isLegacyState = (state: StrategyState): boolean => {
        return (
          "responses" in state ||
          "assignments" in state ||
          "assignmentResponses" in state
        );
      };

      expect(isLegacyState(legacyState)).toBe(true);
    });
  });

  describe("Slide-Scoped State Structure", () => {
    it("should support slide ID indexing for responses", () => {
      const state: StrategyState = {
        phase: "current-slide",
        "slide-123": {
          responses: {
            "user1-abc": "What is 2+2?",
            "user2-def": "What is the capital?",
          },
        },
      };

      expect(state["slide-123"]).toBeDefined();
      expect(state["slide-123"].responses).toBeDefined();
      expect(state["slide-123"].responses?.["user1-abc"]).toBe("What is 2+2?");
    });

    it("should support slide ID indexing for assignments", () => {
      const state: StrategyState = {
        phase: "current-slide",
        "slide-456": {
          assignments: {
            user1: { assignmentId: "assign-1", itemIds: ["item1", "item2"] },
            user2: { assignmentId: "assign-2", itemIds: ["item3"] },
          },
        },
      };

      expect(state["slide-456"]).toBeDefined();
      expect(state["slide-456"].assignments).toBeDefined();
      expect(state["slide-456"].assignments?.user1).toBeDefined();
    });

    it("should support slide ID indexing for assignmentResponses", () => {
      const state: StrategyState = {
        phase: "current-slide",
        "slide-789": {
          assignmentResponses: [
            {
              assignmentId: "assign-1",
              userId: "user1",
              response: "Good question!",
            },
          ],
        },
      };

      expect(state["slide-789"]).toBeDefined();
      expect(state["slide-789"].assignmentResponses).toBeDefined();
      expect(state["slide-789"].assignmentResponses?.length).toBe(1);
    });

    it("should maintain phase property at root level", () => {
      const state: StrategyState = {
        phase: "write-questions",
        "slide-123": {
          responses: { "user1-abc": "answer" },
        },
      };

      expect(state.phase).toBe("write-questions");
      expect(typeof state.phase).toBe("string");
    });

    it("should support multiple slides with different data types", () => {
      const state: StrategyState = {
        phase: "review",
        "slide-1": {
          responses: { "user1-abc": "answer1" },
        },
        "slide-2": {
          assignments: {
            user1: { assignmentId: "a1", itemIds: ["i1"] },
          },
        },
        "slide-3": {
          assignmentResponses: [
            { assignmentId: "a1", userId: "user1", response: "response1" },
          ],
        },
      };

      expect(state["slide-1"].responses).toBeDefined();
      expect(state["slide-2"].assignments).toBeDefined();
      expect(state["slide-3"].assignmentResponses).toBeDefined();
    });
  });

  describe("Backward Compatibility", () => {
    it("should allow legacy root-level responses", () => {
      const legacyState: StrategyState = {
        phase: "intro",
        responses: { user1: "legacy answer" },
      };

      expect(legacyState.responses).toBeDefined();
      expect(legacyState.responses?.user1).toBe("legacy answer");
    });

    it("should allow legacy root-level assignments", () => {
      const legacyState: StrategyState = {
        phase: "intro",
        assignments: {
          user1: { assignmentId: "a1", itemIds: ["i1"] },
        },
      };

      expect(legacyState.assignments).toBeDefined();
    });

    it("should allow mixed legacy and slide-scoped state", () => {
      const mixedState: StrategyState = {
        phase: "transition",
        responses: { user1: "legacy" }, // Legacy
        "slide-123": {
          // New slide-scoped
          responses: { "user2-abc": "new format" },
        },
      };

      expect(mixedState.responses).toBeDefined();
      expect(mixedState["slide-123"]).toBeDefined();
    });
  });
});
