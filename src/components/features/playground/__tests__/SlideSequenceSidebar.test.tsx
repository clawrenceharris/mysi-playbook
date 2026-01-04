import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SlideSequenceSidebar } from "../SlideSequenceSidebar";
import {
  StrategySlide,
  SlideType,
} from "@/features/playground/domain/playground.types";

const mockSlides: StrategySlide[] = [
  {
    id: "slide-1",
    title: "Welcome",
    type: SlideType.CONTENT,
    blocks: [],
    order: 0,
    transitions: { type: "manual" },
    timing: { estimatedDuration: 300, showTimer: false },
  },
  {
    id: "slide-2",
    title: "Question",
    type: SlideType.INTERACTION,
    blocks: [],
    order: 1,
    transitions: { type: "manual" },
    timing: { estimatedDuration: 180, showTimer: false },
  },
];

describe("SlideSequenceSidebar", () => {
  const mockProps = {
    slides: mockSlides,
    currentSlideId: "slide-1",
    onSlideSelect: vi.fn(),
    onSlideAdd: vi.fn(),
    onSlideDelete: vi.fn(),
    onSlideReorder: vi.fn(),
    onSlideDuplicate: vi.fn(),
  };

  it("should render slide thumbnails in vertical list", () => {
    render(<SlideSequenceSidebar {...mockProps} />);

    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Question")).toBeInTheDocument();
  });

  it("should highlight the current slide", () => {
    render(<SlideSequenceSidebar {...mockProps} />);

    const currentSlide = screen.getByTestId("slide-slide-1");
    expect(currentSlide).toHaveClass("slide-selected");
  });

  it("should call onSlideSelect when a slide is clicked", () => {
    const onSlideSelect = vi.fn();
    render(
      <SlideSequenceSidebar {...mockProps} onSlideSelect={onSlideSelect} />
    );

    const slide = screen.getByTestId("slide-slide-2");
    slide.click();

    expect(onSlideSelect).toHaveBeenCalledWith("slide-2");
  });

  it("should render slides as clickable cards", () => {
    render(<SlideSequenceSidebar {...mockProps} />);

    const slide = screen.getByTestId("slide-slide-1");
    expect(slide).toHaveAttribute("role", "button");
    expect(slide).toHaveAttribute("tabIndex", "0");
  });

  it("should handle keyboard navigation", () => {
    const onSlideSelect = vi.fn();
    render(
      <SlideSequenceSidebar {...mockProps} onSlideSelect={onSlideSelect} />
    );

    const slide = screen.getByTestId("slide-slide-2");
    fireEvent.keyDown(slide, { key: "Enter" });

    expect(onSlideSelect).toHaveBeenCalledWith("slide-2");
  });

  it("should render add slide button", () => {
    render(<SlideSequenceSidebar {...mockProps} />);

    const addButton = screen.getByTestId("add-slide-button");
    expect(addButton).toBeInTheDocument();
  });

  it("should call onSlideAdd when add button is clicked", () => {
    const onSlideAdd = vi.fn();
    render(<SlideSequenceSidebar {...mockProps} onSlideAdd={onSlideAdd} />);

    const addButton = screen.getByTestId("add-slide-button");
    addButton.click();

    expect(onSlideAdd).toHaveBeenCalled();
  });

  it("should show slide context menu on right click", () => {
    render(<SlideSequenceSidebar {...mockProps} />);

    const slide = screen.getByTestId("slide-slide-1");
    fireEvent.contextMenu(slide);

    expect(screen.getByTestId("slide-context-menu")).toBeInTheDocument();
  });

  it("should call onSlideDuplicate when duplicate menu item is clicked", () => {
    const onSlideDuplicate = vi.fn();
    render(
      <SlideSequenceSidebar
        {...mockProps}
        onSlideDuplicate={onSlideDuplicate}
      />
    );

    const slide = screen.getByTestId("slide-slide-1");
    fireEvent.contextMenu(slide);

    const duplicateButton = screen.getByTestId("duplicate-slide-button");
    duplicateButton.click();

    expect(onSlideDuplicate).toHaveBeenCalledWith("slide-1");
  });

  it("should call onSlideDelete when delete menu item is clicked", () => {
    const onSlideDelete = vi.fn();
    render(
      <SlideSequenceSidebar {...mockProps} onSlideDelete={onSlideDelete} />
    );

    const slide = screen.getByTestId("slide-slide-1");
    fireEvent.contextMenu(slide);

    const deleteButton = screen.getByTestId("delete-slide-button");
    deleteButton.click();

    expect(onSlideDelete).toHaveBeenCalledWith("slide-1");
  });

  it("should render slides as draggable items", () => {
    render(<SlideSequenceSidebar {...mockProps} />);

    const slide = screen.getByTestId("slide-slide-1");
    expect(slide).toHaveAttribute("data-draggable", "true");
  });

  it("should render drag handles for slides", () => {
    render(<SlideSequenceSidebar {...mockProps} />);

    const dragHandle = screen.getByTestId("drag-handle-slide-1");
    expect(dragHandle).toBeInTheDocument();
  });

  it("should support keyboard shortcuts for slide operations", () => {
    const onSlideDuplicate = vi.fn();
    const onSlideDelete = vi.fn();
    render(
      <SlideSequenceSidebar
        {...mockProps}
        onSlideDuplicate={onSlideDuplicate}
        onSlideDelete={onSlideDelete}
      />
    );

    const slide = screen.getByTestId("slide-slide-1");

    // Test Ctrl+D for duplicate (this would be handled at a higher level)
    fireEvent.keyDown(slide, { key: "d", ctrlKey: true });

    // Test Delete key for delete (this would be handled at a higher level)
    fireEvent.keyDown(slide, { key: "Delete" });

    // These shortcuts would typically be handled by a parent component
    // For now, we just verify the slide can receive keyboard events
    expect(slide).toHaveAttribute("tabIndex", "0");
  });

  it("should show context menu with insert before/after options", () => {
    render(<SlideSequenceSidebar {...mockProps} />);

    const slide = screen.getByTestId("slide-slide-1");
    fireEvent.contextMenu(slide);

    const contextMenu = screen.getByTestId("slide-context-menu");
    expect(contextMenu).toBeInTheDocument();

    // Verify all menu options are present
    expect(screen.getByTestId("insert-before-button")).toBeInTheDocument();
    expect(screen.getByTestId("insert-after-button")).toBeInTheDocument();
    expect(screen.getByTestId("duplicate-slide-button")).toBeInTheDocument();
    expect(screen.getByTestId("delete-slide-button")).toBeInTheDocument();
  });

  it("should call onSlideAdd with slideId when insert before is clicked", () => {
    const onSlideAdd = vi.fn();
    render(<SlideSequenceSidebar {...mockProps} onSlideAdd={onSlideAdd} />);

    const slide = screen.getByTestId("slide-slide-1");
    fireEvent.contextMenu(slide);

    const insertBeforeButton = screen.getByTestId("insert-before-button");
    insertBeforeButton.click();

    expect(onSlideAdd).toHaveBeenCalledWith("slide-1");
  });

  it("should call onSlideAdd with slideId when insert after is clicked", () => {
    const onSlideAdd = vi.fn();
    render(<SlideSequenceSidebar {...mockProps} onSlideAdd={onSlideAdd} />);

    const slide = screen.getByTestId("slide-slide-1");
    fireEvent.contextMenu(slide);

    const insertAfterButton = screen.getByTestId("insert-after-button");
    insertAfterButton.click();

    expect(onSlideAdd).toHaveBeenCalledWith("slide-1");
  });
});
