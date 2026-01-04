import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContextualToolbar } from "../ContextualToolbar";

describe("ContextualToolbar", () => {
  const mockOnBlockAdd = vi.fn();
  const mockOnFormatting = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render empty slide context with common starting blocks", () => {
    render(
      <ContextualToolbar
        context="slide-empty"
        onBlockAdd={mockOnBlockAdd}
        onFormatting={mockOnFormatting}
      />
    );

    expect(screen.getByText("Add Text")).toBeInTheDocument();
    expect(screen.getByText("Add Question")).toBeInTheDocument();
    expect(screen.getByText("Add Poll")).toBeInTheDocument();
    expect(screen.getByText("Add Timer")).toBeInTheDocument();
  });

  it("should render content slide context with enhancement blocks", () => {
    render(
      <ContextualToolbar
        context="slide-content"
        onBlockAdd={mockOnBlockAdd}
        onFormatting={mockOnFormatting}
      />
    );

    expect(screen.getByText("Add Interaction")).toBeInTheDocument();
    expect(screen.getByText("Add Break")).toBeInTheDocument();
  });

  it("should render text editing context with formatting tools", () => {
    render(
      <ContextualToolbar
        context="text-editing"
        onBlockAdd={mockOnBlockAdd}
        onFormatting={mockOnFormatting}
      />
    );

    expect(screen.getByLabelText("Bold")).toBeInTheDocument();
    expect(screen.getByLabelText("Italic")).toBeInTheDocument();
    expect(screen.getByLabelText("Heading")).toBeInTheDocument();
  });

  it("should call onBlockAdd when block button is clicked", () => {
    render(
      <ContextualToolbar
        context="slide-empty"
        onBlockAdd={mockOnBlockAdd}
        onFormatting={mockOnFormatting}
      />
    );

    fireEvent.click(screen.getByText("Add Text"));
    expect(mockOnBlockAdd).toHaveBeenCalledWith("display-prompt");
  });

  it("should call onFormatting when formatting button is clicked", () => {
    render(
      <ContextualToolbar
        context="text-editing"
        onBlockAdd={mockOnBlockAdd}
        onFormatting={mockOnFormatting}
      />
    );

    fireEvent.click(screen.getByLabelText("Bold"));
    expect(mockOnFormatting).toHaveBeenCalledWith({ type: "bold" });
  });

  it("should smoothly transition between different toolbar states", () => {
    const { rerender } = render(
      <ContextualToolbar
        context="slide-empty"
        onBlockAdd={mockOnBlockAdd}
        onFormatting={mockOnFormatting}
      />
    );

    expect(screen.getByText("Add Text")).toBeInTheDocument();

    rerender(
      <ContextualToolbar
        context="text-editing"
        onBlockAdd={mockOnBlockAdd}
        onFormatting={mockOnFormatting}
      />
    );

    expect(screen.getByLabelText("Bold")).toBeInTheDocument();
    expect(screen.queryByText("Add Text")).not.toBeInTheDocument();
  });
});
