import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  ParticipantManagerProvider,
  useParticipantManager,
} from "../ParticipantManagerContext";

describe("ParticipantManagerContext", () => {
  describe("useParticipantManager", () => {
    it("should throw error when used outside provider", () => {
      expect(() => {
        renderHook(() => useParticipantManager());
      }).toThrow(
        "useParticipantManager must be used within a ParticipantManagerProvider"
      );
    });

    it("should provide manager instance when used within provider", () => {
      const { result } = renderHook(() => useParticipantManager(), {
        wrapper: ParticipantManagerProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.getParticipants).toBeDefined();
      expect(result.current.addParticipant).toBeDefined();
    });
  });

  describe("ParticipantManagerProvider", () => {
    it("should initialize manager with 3 default participants", () => {
      const { result } = renderHook(() => useParticipantManager(), {
        wrapper: ParticipantManagerProvider,
      });

      const participants = result.current.getParticipants();
      expect(participants).toHaveLength(3);
    });

    it("should provide stable manager instance across renders", () => {
      const { result, rerender } = renderHook(() => useParticipantManager(), {
        wrapper: ParticipantManagerProvider,
      });

      const firstManager = result.current;
      rerender();
      const secondManager = result.current;

      expect(firstManager).toBe(secondManager);
    });

    it("should allow adding participants through context", () => {
      const { result } = renderHook(() => useParticipantManager(), {
        wrapper: ParticipantManagerProvider,
      });

      const initialCount = result.current.getParticipants().length;

      act(() => {
        result.current.addParticipant();
      });

      expect(result.current.getParticipants()).toHaveLength(initialCount + 1);
    });

    it("should allow switching current participant through context", () => {
      const { result } = renderHook(() => useParticipantManager(), {
        wrapper: ParticipantManagerProvider,
      });

      const participants = result.current.getParticipants();
      const targetParticipant = participants[1];

      act(() => {
        result.current.setCurrentParticipant(targetParticipant.id);
      });

      expect(result.current.getCurrentParticipantId()).toBe(
        targetParticipant.id
      );
    });

    it("should allow updating participant state through context", () => {
      const { result } = renderHook(() => useParticipantManager(), {
        wrapper: ParticipantManagerProvider,
      });

      const participants = result.current.getParticipants();
      const participantId = participants[0].id;

      act(() => {
        result.current.updateParticipantState(participantId, {
          responses: { block1: { response: "test response" } },
        });
      });

      const state = result.current.getParticipantState(participantId);
      expect(state.responses).toEqual({ block1: "test response" });
    });

    it("should provide access to shared state through context", () => {
      const { result } = renderHook(() => useParticipantManager(), {
        wrapper: ParticipantManagerProvider,
      });

      const sharedState = result.current.getSharedState();
      expect(sharedState).toBeDefined();
      expect(sharedState).toHaveProperty("phase");
      expect(sharedState).toHaveProperty("responses");
    });
  });
});
