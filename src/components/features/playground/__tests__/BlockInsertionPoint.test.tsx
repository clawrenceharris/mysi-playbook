import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BlockInsertionPoint } from "../BlockInsertionPoint";

const mockProps = {
  position: 1,
  onInsert: vi.fn(),
  suggestedBlocks: ["display-prompt", "collect-input"],
};

describe("BlockInsertionPoint", () => {
  it("should render insertion point with plus button", () => {
    render(<BlockInsertionPoint {...mockProps} />);

    const insertButton = screen.getByTestId("insertion-point-1");
    expect(insertButton).toBeInTheDocument();
    expect(insertButton).toHaveClass("opacity-0"); // Hidden by default
  });

  it("should show insertion point on hover", () => {
    render(<BlockInsertionPoint {...mockProps} />);

    const insertionArea = screen.getByTestId("insertion-area-1");
    fireEvent.mouseEnter(insertionArea);

    const insertButton = screen.getByTestId("insertion-point-1");
    expect(insertButton).toHaveClass("opacity-100");
  });

  it("should hide insertion point when not hovering", () => {
    render(<BlockInsertionPoint {...mockProps} />);

    const insertionArea = screen.getByTestId("insertion-area-1");
    fireEvent.mouseEnter(insertionArea);
    fireEvent.mouseLeave(insertionArea);

    const insertButton = screen.getByTestId("insertion-point-1");
    expect(insertButton).toHaveClass("opacity-0");
  });

  it("should show block picker when clicked", () => {
    render(<BlockInsertionPoint {...mockProps} />);

    const insertButton = screen.getByTestId("insertion-point-1");
    fireEvent.click(insertButton);

    expect(screen.getByTestId("block-picker")).toBeInTheDocument();
    expect(screen.getByText("Display Prompt")).toBeInTheDocument();
    expect(screen.getByText("Collect Input")).toBeInTheDocument();
  });

  it("should call onInsert when block type is selected", () => {
    render(<BlockInsertionPoint {...mockProps} />);

    const insertButton = screen.getByTestId("insertion-point-1");
    fireEvent.click(insertButton);

    const displayPromptOption = screen.getByText("Display Prompt");
    fireEvent.click(displayPromptOption);

    expect(mockProps.onInsert).toHaveBeenCalledWith("display-prompt", 1);
  });

  it("should close block picker when clicking outside", () => {
    render(<BlockInsertionPoint {...mockProps} />);

    const insertButton = screen.getByTestId("insertion-point-1");
    fireEvent.click(insertButton);

    expect(screen.getByTestId("block-picker")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByTestId("block-picker")).not.toBeInTheDocument();
  });
});
