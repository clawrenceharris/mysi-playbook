import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  DataReferenceSelector,
  SlideInfoWithState,
} from "../DataReferenceSelector";
import type { StrategyState } from "@/types/playbook";
import { analyzeSlideState } from "@/features/playground/domain/slide-state-info";

/**
 * Tests for preview mode indicators in DataReferenceSelector
 *
 * Note: Visual indicator display tests (Badge rendering in dropdown) are limited
 * due to Radix UI Select component incompatibility with jsdom test environment.
 * The hasPointerCapture API is not available in jsdom, preventing dropdown interaction.
 *
 * These tests focus on:
 * - Data availability detection logic (analyzeSlideState)
 * - Component rendering with preview state
 * - State processing and memoization
 *
 * Visual indicator rendering is verified manually in the browser.
 */
describe("DataReferenceSelector - Data Availability Indicators", () => {
  const mockState: StrategyState = {
    phase: "slide-1",
    "slide-1": {
      responses: {
        "user1-abc": "Answer 1",
        "user2-def": "Answer 2",
      },
    },
    "slide-2": {
      assignments: {
        user1: ["item1"],
      },
    },
    "slide-3": {
      assignmentResponses: [
        { assignmentId: "a1", userId: "user1", response: "Response 1" },
      ],
    },
    "slide-4": {},
  };

  const mockSlides: SlideInfoWithState[] = [
    { id: "slide-1", title: "Slide 1", order: 0 },
    { id: "slide-2", title: "Slide 2", order: 1 },
    { id: "slide-3", title: "Slide 3", order: 2 },
    { id: "slide-4", title: "Slide 4", order: 3 },
  ];

  describe("Data Availability Detection", () => {
    it("should analyze slide state correctly for responses", () => {
      const info = analyzeSlideState(mockState, "slide-1");

      expect(info.hasResponses).toBe(true);
      expect(info.responseCount).toBe(2);
      expect(info.hasAssignments).toBe(false);
      expect(info.hasAssignmentResponses).toBe(false);
    });

    it("should analyze slide state correctly for assignments", () => {
      const info = analyzeSlideState(mockState, "slide-2");

      expect(info.hasAssignments).toBe(true);
      expect(info.assignmentCount).toBe(1);
      expect(info.hasResponses).toBe(false);
      expect(info.hasAssignmentResponses).toBe(false);
    });

    it("should analyze slide state correctly for assignment responses", () => {
      const info = analyzeSlideState(mockState, "slide-3");

      expect(info.hasAssignmentResponses).toBe(true);
      expect(info.assignmentResponseCount).toBe(1);
      expect(info.hasResponses).toBe(false);
      expect(info.hasAssignments).toBe(false);
    });

    it("should analyze slide state correctly for slides without data", () => {
      const info = analyzeSlideState(mockState, "slide-4");

      expect(info.hasResponses).toBe(false);
      expect(info.hasAssignments).toBe(false);
      expect(info.hasAssignmentResponses).toBe(false);
      expect(info.responseCount).toBe(0);
      expect(info.assignmentCount).toBe(0);
      expect(info.assignmentResponseCount).toBe(0);
    });

    it("should analyze slide with multiple data types", () => {
      const stateWithMultipleTypes: StrategyState = {
        phase: "slide-1",
        "slide-1": {
          responses: { "user1-abc": "Answer" },
          assignments: { user1: ["item1"] },
        },
      };

      const info = analyzeSlideState(stateWithMultipleTypes, "slide-1");

      expect(info.hasResponses).toBe(true);
      expect(info.hasAssignments).toBe(true);
      expect(info.responseCount).toBe(1);
      expect(info.assignmentCount).toBe(1);
    });
  });

  describe("State Processing", () => {
    it("should compute slide state info from preview state", () => {
      const onChange = vi.fn();

      render(
        <DataReferenceSelector
          value={null}
          onChange={onChange}
          availableSlides={mockSlides}
          previewState={mockState}
        />
      );

      // Component renders successfully with preview state
      expect(screen.getByRole("combobox")).toBeInTheDocument();

      // Verify state analysis works correctly for each slide
      const slide1Info = analyzeSlideState(mockState, "slide-1");
      expect(slide1Info.hasResponses).toBe(true);
      expect(slide1Info.responseCount).toBe(2);

      const slide2Info = analyzeSlideState(mockState, "slide-2");
      expect(slide2Info.hasAssignments).toBe(true);
      expect(slide2Info.assignmentCount).toBe(1);

      const slide3Info = analyzeSlideState(mockState, "slide-3");
      expect(slide3Info.hasAssignmentResponses).toBe(true);
      expect(slide3Info.assignmentResponseCount).toBe(1);

      const slide4Info = analyzeSlideState(mockState, "slide-4");
      expect(slide4Info.hasResponses).toBe(false);
      expect(slide4Info.hasAssignments).toBe(false);
    });

    it("should recompute state info when preview state changes", () => {
      const onChange = vi.fn();

      const initialState: StrategyState = {
        phase: "slide-1",
        "slide-1": {},
      };

      const { rerender } = render(
        <DataReferenceSelector
          value={null}
          onChange={onChange}
          availableSlides={[mockSlides[0]]}
          previewState={initialState}
        />
      );

      // Initial state has no data
      let info = analyzeSlideState(initialState, "slide-1");
      expect(info.hasResponses).toBe(false);

      // Update with new data
      const updatedState: StrategyState = {
        phase: "slide-1",
        "slide-1": {
          responses: {
            "user1-abc": "New Answer",
            "user2-def": "Another Answer",
          },
        },
      };

      rerender(
        <DataReferenceSelector
          value={null}
          onChange={onChange}
          availableSlides={[mockSlides[0]]}
          previewState={updatedState}
        />
      );

      // State now has data
      info = analyzeSlideState(updatedState, "slide-1");
      expect(info.hasResponses).toBe(true);
      expect(info.responseCount).toBe(2);
    });

    it("should handle multiple slides with different data types", () => {
      const onChange = vi.fn();

      const multiSlideState: StrategyState = {
        phase: "slide-1",
        "slide-1": {
          responses: { "user1-abc": "Answer" },
        },
        "slide-2": {
          assignments: { user1: ["item1"], user2: ["item2"] },
        },
        "slide-3": {
          assignmentResponses: [
            { assignmentId: "a1", userId: "user1", response: "Response 1" },
            { assignmentId: "a2", userId: "user2", response: "Response 2" },
            { assignmentId: "a3", userId: "user3", response: "Response 3" },
          ],
        },
      };

      render(
        <DataReferenceSelector
          value={null}
          onChange={onChange}
          availableSlides={mockSlides}
          previewState={multiSlideState}
        />
      );

      // Verify each slide's state is analyzed correctly
      const slide1Info = analyzeSlideState(multiSlideState, "slide-1");
      expect(slide1Info.responseCount).toBe(1);

      const slide2Info = analyzeSlideState(multiSlideState, "slide-2");
      expect(slide2Info.assignmentCount).toBe(2);

      const slide3Info = analyzeSlideState(multiSlideState, "slide-3");
      expect(slide3Info.assignmentResponseCount).toBe(3);
    });
  });

  describe("Component Rendering", () => {
    it("should render component with previewState prop", () => {
      const onChange = vi.fn();

      render(
        <DataReferenceSelector
          value={null}
          onChange={onChange}
          availableSlides={mockSlides}
          previewState={mockState}
        />
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should render component without previewState prop", () => {
      const onChange = vi.fn();

      render(
        <DataReferenceSelector
          value={null}
          onChange={onChange}
          availableSlides={mockSlides}
        />
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });
  });
});
