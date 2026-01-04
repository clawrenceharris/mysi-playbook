import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { InlineBlockEditor } from "../InlineBlockEditor";
import { StrategyBlock } from "@/features/playground/domain/playground.types";

const mockDisplayPromptBlock: StrategyBlock = {
  id: "block-1",
  type: "display-prompt",
  order: 0,
  config: {
    title: "Welcome",
    content: "Hello world",
    requireAcknowledgment: false,
  },
};

const mockCollectInputBlock: StrategyBlock = {
  id: "block-2",
  type: "collect-input",
  order: 1,
  config: { question: "What's your name?", inputType: "text", required: true },
};

const mockProps = {
  block: mockDisplayPromptBlock,
  onUpdate: vi.fn(),
  isEditing: false,
  onEditingChange: vi.fn(),
};

describe("InlineBlockEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render block in view mode by default", () => {
    render(<InlineBlockEditor {...mockProps} />);

    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("should show edit indicator for editable blocks", () => {
    render(<InlineBlockEditor {...mockProps} />);

    const blockElement = screen.getByTestId("inline-block-block-1");
    expect(blockElement).toHaveClass("cursor-pointer");
    expect(screen.getByTestId("edit-indicator")).toBeInTheDocument();
  });

  it("should enter edit mode when clicked", () => {
    render(<InlineBlockEditor {...mockProps} />);

    const blockElement = screen.getByTestId("inline-block-block-1");
    fireEvent.click(blockElement);

    expect(mockProps.onEditingChange).toHaveBeenCalledWith(true);
  });

  it("should render input fields in edit mode", () => {
    render(<InlineBlockEditor {...mockProps} isEditing={true} />);

    expect(screen.getByDisplayValue("Welcome")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Hello world")).toBeInTheDocument();
  });

  it("should save changes when clicking outside", () => {
    render(<InlineBlockEditor {...mockProps} isEditing={true} />);

    const titleInput = screen.getByDisplayValue("Welcome");
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });

    fireEvent.mouseDown(document.body);

    expect(mockProps.onUpdate).toHaveBeenCalledWith({
      config: { ...mockDisplayPromptBlock.config, title: "Updated Title" },
    });
    expect(mockProps.onEditingChange).toHaveBeenCalledWith(false);
  });

  it("should handle different block types", () => {
    render(<InlineBlockEditor {...mockProps} block={mockCollectInputBlock} />);

    expect(screen.getByText("What's your name?")).toBeInTheDocument();
    expect(screen.getByText(/Text Input/)).toBeInTheDocument();
  });

  it("should show configuration button for complex blocks", () => {
    render(<InlineBlockEditor {...mockProps} block={mockCollectInputBlock} />);

    expect(screen.getByTestId("configure-button")).toBeInTheDocument();
  });

  it("should save changes on Enter key", () => {
    render(<InlineBlockEditor {...mockProps} isEditing={true} />);

    const titleInput = screen.getByDisplayValue("Welcome");
    fireEvent.change(titleInput, { target: { value: "New Title" } });
    fireEvent.keyDown(titleInput, { key: "Enter" });

    expect(mockProps.onUpdate).toHaveBeenCalledWith({
      config: { ...mockDisplayPromptBlock.config, title: "New Title" },
    });
    expect(mockProps.onEditingChange).toHaveBeenCalledWith(false);
  });

  it("should cancel changes on Escape key", () => {
    render(<InlineBlockEditor {...mockProps} isEditing={true} />);

    const titleInput = screen.getByDisplayValue("Welcome");
    fireEvent.change(titleInput, { target: { value: "Changed Title" } });
    fireEvent.keyDown(titleInput, { key: "Escape" });

    expect(mockProps.onUpdate).not.toHaveBeenCalled();
    expect(mockProps.onEditingChange).toHaveBeenCalledWith(false);
  });
});
