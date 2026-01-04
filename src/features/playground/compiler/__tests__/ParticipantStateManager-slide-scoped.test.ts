import { describe, it, expect, beforeEach } from "vitest";
import { ParticipantStateManager } from "../ParticipantStateManager";

describe("ParticipantStateManager - Slide-Scoped State", () => {
  let manager: ParticipantStateManager;

  beforeEach(() => {
    manager = new ParticipantStateManager();
  });

  describe("rebuildSharedState - slide-scoped organization", () => {
    it("should organize responses by slide ID", () => {
      const participants = manager.getParticipants();
      const participant1 = participants[0];
      const participant2 = participants[1];

      // Update participant states with slide-scoped responses
      manager.updateParticipantState(participant1.id, {
        responses: {
          "slide-123": { "block-1": "Answer from P1" },
          "slide-456": { "block-2": "Another answer from P1" },
        },
      });

      manager.updateParticipantState(participant2.id, {
        responses: {
          "slide-123": { "block-1": "Answer from P2" },
        },
      });

      const sharedState = manager.getSharedState();

      // Should have slide-scoped structure
      expect(sharedState["slide-123"]).toBeDefined();
      expect(sharedState["slide-123"].responses).toBeDefined();
      expect(sharedState["slide-456"]).toBeDefined();
      expect(sharedState["slide-456"].responses).toBeDefined();

      // Should contain responses from both participants
      const slide123Responses = sharedState["slide-123"].responses;
      expect(Object.keys(slide123Responses)).toHaveLength(2);
    });

    it("should organize assignments by slide ID", () => {
      const participants = manager.getParticipants();
      const participant1 = participants[0];

      manager.updateParticipantState(participant1.id, {
        assignments: {
          "slide-789": ["item-1", "item-2"],
        },
      });

      const sharedState = manager.getSharedState();

      expect(sharedState["slide-789"]).toBeDefined();
      expect(sharedState["slide-789"].assignments).toBeDefined();
      expect(sharedState["slide-789"].assignments[participant1.id]).toEqual([
        "item-1",
        "item-2",
      ]);
    });

    it("should maintain phase property at root level", () => {
      const sharedState = manager.getSharedState();

      expect(sharedState.phase).toBeDefined();
      expect(typeof sharedState.phase).toBe("string");
    });

    it("should not store slide-scoped data at root level", () => {
      const participants = manager.getParticipants();
      const participant1 = participants[0];

      manager.updateParticipantState(participant1.id, {
        responses: {
          "slide-123": { "block-1": "Answer" },
        },
      });

      const sharedState = manager.getSharedState();

      // Root level should not have 'responses' key
      expect(sharedState.responses).toBeUndefined();
      // But slide-scoped should
      expect(sharedState["slide-123"].responses).toBeDefined();
    });
  });

  describe("aggregateStateField - slide namespace support", () => {
    it("should aggregate responses within slide namespaces", () => {
      const participants = manager.getParticipants();
      const participant1 = participants[0];
      const participant2 = participants[1];

      manager.updateParticipantState(participant1.id, {
        responses: {
          "slide-123": { "block-1": "P1 Answer" },
        },
      });

      manager.updateParticipantState(participant2.id, {
        responses: {
          "slide-123": { "block-1": "P2 Answer" },
        },
      });

      const sharedState = manager.getSharedState();
      const slide123Responses = sharedState["slide-123"].responses;

      // Should have entries for both participants
      const responseKeys = Object.keys(slide123Responses);
      expect(responseKeys).toHaveLength(2);

      // Keys should be in userId-uuid format
      expect(responseKeys.every((key) => key.startsWith("participant-"))).toBe(
        true
      );
    });

    it("should handle multiple slides with different participants", () => {
      const participants = manager.getParticipants();
      const participant1 = participants[0];
      const participant2 = participants[1];
      const participant3 = participants[2];

      manager.updateParticipantState(participant1.id, {
        responses: {
          "slide-123": { "block-1": "P1 on slide 123" },
          "slide-456": { "block-2": "P1 on slide 456" },
        },
      });

      manager.updateParticipantState(participant2.id, {
        responses: {
          "slide-123": { "block-1": "P2 on slide 123" },
        },
      });

      manager.updateParticipantState(participant3.id, {
        responses: {
          "slide-456": { "block-2": "P3 on slide 456" },
        },
      });

      const sharedState = manager.getSharedState();

      // Slide 123 should have 2 participants
      expect(Object.keys(sharedState["slide-123"].responses)).toHaveLength(2);

      // Slide 456 should have 2 participants
      expect(Object.keys(sharedState["slide-456"].responses)).toHaveLength(2);
    });
  });

  describe("getSlideState method", () => {
    it("should retrieve responses for a specific slide", () => {
      const participants = manager.getParticipants();
      const participant1 = participants[0];

      manager.updateParticipantState(participant1.id, {
        responses: {
          "slide-123": { "block-1": "Answer 1" },
          "slide-456": { "block-2": "Answer 2" },
        },
      });

      const slide123State = manager.getSlideState("slide-123", "responses");

      expect(slide123State).toBeDefined();
      expect(Object.keys(slide123State).length).toBeGreaterThan(0);
    });

    it("should retrieve assignments for a specific slide", () => {
      const participants = manager.getParticipants();
      const participant1 = participants[0];

      manager.updateParticipantState(participant1.id, {
        assignments: {
          "slide-789": ["item-1", "item-2"],
        },
      });

      const slide789Assignments = manager.getSlideState(
        "slide-789",
        "assignments"
      );

      expect(slide789Assignments).toBeDefined();
      expect(slide789Assignments[participant1.id]).toEqual([
        "item-1",
        "item-2",
      ]);
    });

    it("should return empty object for non-existent slide", () => {
      const result = manager.getSlideState("non-existent", "responses");

      expect(result).toEqual({});
    });

    it("should return empty object for slide with no data for accessor", () => {
      const participants = manager.getParticipants();
      const participant1 = participants[0];

      manager.updateParticipantState(participant1.id, {
        responses: {
          "slide-123": { "block-1": "Answer" },
        },
      });

      // Slide exists but has no assignments
      const result = manager.getSlideState("slide-123", "assignments");

      expect(result).toEqual({});
    });
  });

  describe("updateSlideState method", () => {
    it("should update responses for a specific slide", () => {
      manager.updateSlideState("slide-123", "responses", {
        "user-1-abc": { "block-1": "New response" },
      });

      const sharedState = manager.getSharedState();

      expect(sharedState["slide-123"]).toBeDefined();
      expect(sharedState["slide-123"].responses).toEqual({
        "user-1-abc": { "block-1": "New response" },
      });
    });

    it("should update assignments for a specific slide", () => {
      manager.updateSlideState("slide-456", "assignments", {
        "user-1": ["item-1", "item-2"],
        "user-2": ["item-3"],
      });

      const sharedState = manager.getSharedState();

      expect(sharedState["slide-456"]).toBeDefined();
      expect(sharedState["slide-456"].assignments).toEqual({
        "user-1": ["item-1", "item-2"],
        "user-2": ["item-3"],
      });
    });

    it("should create slide namespace if it doesn't exist", () => {
      const sharedState = manager.getSharedState();
      expect(sharedState["new-slide"]).toBeUndefined();

      manager.updateSlideState("new-slide", "responses", {
        "user-1-xyz": { "block-1": "Response" },
      });

      const updatedState = manager.getSharedState();
      expect(updatedState["new-slide"]).toBeDefined();
      expect(updatedState["new-slide"].responses).toBeDefined();
    });

    it("should preserve other accessors when updating one", () => {
      manager.updateSlideState("slide-123", "responses", {
        "user-1-abc": { "block-1": "Response" },
      });

      manager.updateSlideState("slide-123", "assignments", {
        "user-1": ["item-1"],
      });

      const sharedState = manager.getSharedState();

      expect(sharedState["slide-123"].responses).toBeDefined();
      expect(sharedState["slide-123"].assignments).toBeDefined();
    });
  });
});
