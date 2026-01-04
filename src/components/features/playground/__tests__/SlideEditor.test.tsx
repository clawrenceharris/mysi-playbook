import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SlideEditor } from "../SlideEditor";
import {
  StrategySlide,
  SlideType,
} from "@/features/playground/domain/playground.types";

const mockSlide: StrategySlide = {
  id: "slide-1",
  title: "Test Slide",
  type: SlideType.CONTENT,
  blocks: [
    {
      id: "block-1",
      type: "display-prompt",
      order: 0,
      config: { title: "Welcome", content: "Hello world" },
    },
    {
      id: "block-2",
      type: "collect-input",
      order: 1,
      config: {
        question: "What's your name?",
        inputType: "text",
        required: true,
      },
    },
  ],
  order: 0,
  transitions: { type: "manual" },
  timing: { estimatedDuration: 300, showTimer: false },
};

const mockProps = {
  slide: mockSlide,
  onSlideUpdate: vi.fn(),
  onBlockAdd: vi.fn(),
  onBlockUpdate: vi.fn(),
  onBlockDelete: vi.fn(),
  onBlockReorder: vi.fn(),
};

describe("SlideEditor", () => {
  it("should render slide title and allow editing", () => {
    render(<SlideEditor {...mockProps} />);

    const titleInput = screen.getByDisplayValue("Test Slide");
    expect(titleInput).toBeInTheDocument();

    fireEvent.change(titleInput, { target: { value: "Updated Title" } });
    expect(mockProps.onSlideUpdate).toHaveBeenCalledWith("slide-1", {
      title: "Updated Title",
    });
  });

  it("should display blocks in vertical arrangement", () => {
    render(<SlideEditor {...mockProps} />);

    const blocks = screen.getAllByTestId(/^block-/);
    expect(blocks).toHaveLength(2);

    // Check that blocks are displayed in order
    expect(screen.getByTestId("block-block-1")).toBeInTheDocument();
    expect(screen.getByTestId("block-block-2")).toBeInTheDocument();
  });

  it("should show slide metadata", () => {
    render(<SlideEditor {...mockProps} />);

    expect(screen.getByText("Content")).toBeInTheDocument(); // slide type
    expect(screen.getByText("5 min")).toBeInTheDocument(); // estimated duration
  });

  it("should handle empty slide", () => {
    const emptySlide = { ...mockSlide, blocks: [] };
    render(<SlideEditor {...mockProps} slide={emptySlide} />);

    expect(screen.getByText("This slide is empty")).toBeInTheDocument();
    expect(
      screen.getByText("Add your first block to get started")
    ).toBeInTheDocument();
    expect(screen.getByTestId("insertion-point-0")).toBeInTheDocument();
  });

  it("should show insertion points between blocks", () => {
    render(<SlideEditor {...mockProps} />);

    // Should have insertion points: before first block, between blocks, and after last block
    expect(screen.getByTestId("insertion-point-0")).toBeInTheDocument(); // Before first
    expect(screen.getByTestId("insertion-point-1")).toBeInTheDocument(); // Between blocks
    expect(screen.getByTestId("insertion-point-2")).toBeInTheDocument(); // After last
  });

  it("should call onBlockAdd when insertion point is used", () => {
    render(<SlideEditor {...mockProps} />);

    const insertionPoint = screen.getByTestId("insertion-point-1");
    fireEvent.click(insertionPoint);

    const displayPromptOption = screen.getByText("Display Prompt");
    fireEvent.click(displayPromptOption);

    expect(mockProps.onBlockAdd).toHaveBeenCalledWith("display-prompt", 1);
  });

  it("should render blocks with drag handles", () => {
    render(<SlideEditor {...mockProps} />);

    expect(screen.getByTestId("drag-handle-block-1")).toBeInTheDocument();
    expect(screen.getByTestId("drag-handle-block-2")).toBeInTheDocument();
  });
});
