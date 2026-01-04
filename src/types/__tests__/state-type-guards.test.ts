import { describe, it, expect } from "vitest";
import type { StrategyState } from "../playbook";
import {
  isSlideId,
  isSlideData,
  isSlideScopedState,
  isLegacyState,
  getSlideIds,
} from "../state-guards";

describe("State Type Guards", () => {
  describe("isSlideId", () => {
    it("should return true for valid slide ID keys", () => {
      expect(isSlideId("slide-123")).toBe(true);
      expect(isSlideId("slide-abc-def")).toBe(true);
      expect(isSlideId("abc-123-def")).toBe(true);
    });

    it("should return false for reserved keys", () => {
      expect(isSlideId("phase")).toBe(false);
      expect(isSlideId("responses")).toBe(false);
      expect(isSlideId("assignments")).toBe(false);
      expect(isSlideId("assignmentResponses")).toBe(false);
      expect(isSlideId("sharedState")).toBe(false);
    });

    it("should return false for non-slide-like keys", () => {
      expect(isSlideId("customVar")).toBe(false);
      expect(isSlideId("myData")).toBe(false);
    });
  });

  describe("isSlideData", () => {
    it("should return true for objects with slide data structure", () => {
      expect(
        isSlideData({
          responses: { "user1-abc": "answer" },
        })
      ).toBe(true);

      expect(
        isSlideData({
          assignments: { user1: { assignmentId: "a1", itemIds: [] } },
        })
      ).toBe(true);

      expect(
        isSlideData({
          assignmentResponses: [],
        })
      ).toBe(true);

      expect(
        isSlideData({
          responses: {},
          assignments: {},
        })
      ).toBe(true);
    });

    it("should return false for non-slide data objects", () => {
      expect(isSlideData({ customKey: "value" })).toBe(false);
      expect(isSlideData({ phase: "intro" })).toBe(false);
      expect(isSlideData(null)).toBe(false);
      expect(isSlideData(undefined)).toBe(false);
      expect(isSlideData("string")).toBe(false);
      expect(isSlideData(123)).toBe(false);
    });
  });

  describe("isSlideScopedState", () => {
    it("should return true for slide-scoped state", () => {
      const state: StrategyState = {
        phase: "slide-1",
        "slide-123": {
          responses: { "user1-abc": "answer" },
        },
      };

      expect(isSlideScopedState(state)).toBe(true);
    });

    it("should return false for legacy state", () => {
      const state: StrategyState = {
        phase: "intro",
        responses: { user1: "answer" },
      };

      expect(isSlideScopedState(state)).toBe(false);
    });

    it("should return false for empty state", () => {
      const state: StrategyState = {
        phase: "intro",
      };

      expect(isSlideScopedState(state)).toBe(false);
    });
  });

  describe("isLegacyState", () => {
    it("should return true for state with root-level data accessors", () => {
      const state1: StrategyState = {
        phase: "intro",
        responses: { user1: "answer" },
      };
      expect(isLegacyState(state1)).toBe(true);

      const state2: StrategyState = {
        phase: "intro",
        assignments: { user1: { assignmentId: "a1", itemIds: [] } },
      };
      expect(isLegacyState(state2)).toBe(true);

      const state3: StrategyState = {
        phase: "intro",
        assignmentResponses: [],
      };
      expect(isLegacyState(state3)).toBe(true);
    });

    it("should return false for slide-scoped state", () => {
      const state: StrategyState = {
        phase: "slide-1",
        "slide-123": {
          responses: { "user1-abc": "answer" },
        },
      };

      expect(isLegacyState(state)).toBe(false);
    });
  });

  describe("getSlideIds", () => {
    it("should extract all slide IDs from state", () => {
      const state: StrategyState = {
        phase: "current",
        "slide-1": { responses: {} },
        "slide-2": { assignments: {} },
        "slide-3": { assignmentResponses: [] },
      };

      const slideIds = getSlideIds(state);
      expect(slideIds).toContain("slide-1");
      expect(slideIds).toContain("slide-2");
      expect(slideIds).toContain("slide-3");
      expect(slideIds).toHaveLength(3);
    });

    it("should not include reserved keys", () => {
      const state: StrategyState = {
        phase: "current",
        responses: {},
        "slide-1": { responses: {} },
      };

      const slideIds = getSlideIds(state);
      expect(slideIds).toContain("slide-1");
      expect(slideIds).not.toContain("phase");
      expect(slideIds).not.toContain("responses");
    });

    it("should return empty array for state with no slides", () => {
      const state: StrategyState = {
        phase: "intro",
        responses: {},
      };

      const slideIds = getSlideIds(state);
      expect(slideIds).toEqual([]);
    });
  });
});
