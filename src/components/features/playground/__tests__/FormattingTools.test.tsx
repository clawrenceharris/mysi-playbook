import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FormattingTools } from "../FormattingTools";

describe("FormattingTools", () => {
  const mockOnFormatting = vi.fn();
  const mockOnQuickAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render text formatting tools", () => {
    render(
      <FormattingTools
        onFormatting={mockOnFormatting}
        onQuickAction={mockOnQuickAction}
      />
    );

    expect(screen.getByLabelText("Bold")).toBeInTheDocument();
    expect(screen.getByLabelText("Italic")).toBeInTheDocument();
    expect(screen.getByLabelText("Heading")).toBeInTheDocument();
    expect(screen.getByLabelText("List")).toBeInTheDocument();
    expect(screen.getByLabelText("Link")).toBeInTheDocument();
  });

  it("should render quick action tools", () => {
    render(
      <FormattingTools
        onFormatting={mockOnFormatting}
        onQuickAction={mockOnQuickAction}
      />
    );

    expect(screen.getByText("Duplicate")).toBeInTheDocument();
    expect(screen.getByText("Configure")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should call onFormatting when formatting button is clicked", () => {
    render(
      <FormattingTools
        onFormatting={mockOnFormatting}
        onQuickAction={mockOnQuickAction}
      />
    );

    fireEvent.click(screen.getByLabelText("Bold"));
    expect(mockOnFormatting).toHaveBeenCalledWith({ type: "bold" });

    fireEvent.click(screen.getByLabelText("Italic"));
    expect(mockOnFormatting).toHaveBeenCalledWith({ type: "italic" });
  });

  it("should call onQuickAction when quick action button is clicked", () => {
    render(
      <FormattingTools
        onFormatting={mockOnFormatting}
        onQuickAction={mockOnQuickAction}
      />
    );

    fireEvent.click(screen.getByText("Duplicate"));
    expect(mockOnQuickAction).toHaveBeenCalledWith("duplicate");

    fireEvent.click(screen.getByText("Configure"));
    expect(mockOnQuickAction).toHaveBeenCalledWith("configure");

    fireEvent.click(screen.getByText("Delete"));
    expect(mockOnQuickAction).toHaveBeenCalledWith("delete");
  });

  it("should render block-specific tools when blockType is provided", () => {
    render(
      <FormattingTools
        onFormatting={mockOnFormatting}
        onQuickAction={mockOnQuickAction}
        blockType="poll-vote"
      />
    );

    expect(screen.getByText("Add Option")).toBeInTheDocument();
    expect(screen.getByText("Show Results")).toBeInTheDocument();
  });

  it("should render different block-specific tools for different block types", () => {
    const { rerender } = render(
      <FormattingTools
        onFormatting={mockOnFormatting}
        onQuickAction={mockOnQuickAction}
        blockType="timer"
      />
    );

    expect(screen.getByText("Set Duration")).toBeInTheDocument();

    rerender(
      <FormattingTools
        onFormatting={mockOnFormatting}
        onQuickAction={mockOnQuickAction}
        blockType="collect-input"
      />
    );

    expect(screen.getByText("Input Type")).toBeInTheDocument();
  });
});
