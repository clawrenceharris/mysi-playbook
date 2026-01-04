import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateTemplateDialog } from "../CreateTemplateDialog";
import {
  StrategySlide,
  SlideType,
} from "@/features/playground/domain/playground.types";

describe("CreateTemplateDialog", () => {
  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  const mockSlide: StrategySlide = {
    id: "slide-1",
    title: "Test Slide",
    type: SlideType.INTERACTION,
    blocks: [
      {
        id: "block-1",
        type: "display-prompt",
        order: 0,
        config: {
          title: "Test Title",
          content: "Test Content",
        },
      },
    ],
    order: 0,
    transitions: { type: "manual" },
    timing: {
      estimatedDuration: 300,
      showTimer: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render create template dialog", () => {
    render(
      <CreateTemplateDialog
        isOpen={true}
        slide={mockSlide}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Create Template" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Template Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
  });

  it("should not render when isOpen is false", () => {
    render(
      <CreateTemplateDialog
        isOpen={false}
        slide={mockSlide}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText("Create Template")).not.toBeInTheDocument();
  });

  it("should display slide preview information", () => {
    render(
      <CreateTemplateDialog
        isOpen={true}
        slide={mockSlide}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("Test Slide")).toBeInTheDocument();
    expect(screen.getByText("1 block")).toBeInTheDocument();
    expect(screen.getByText("5 min")).toBeInTheDocument();
  });

  it("should validate required fields", async () => {
    render(
      <CreateTemplateDialog
        isOpen={true}
        slide={mockSlide}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Try to save without filling required fields
    fireEvent.click(screen.getByRole("button", { name: "Create Template" }));

    await waitFor(() => {
      expect(screen.getByText("Template name is required")).toBeInTheDocument();
      expect(screen.getByText("Description is required")).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("should call onSave with template data when form is valid", async () => {
    render(
      <CreateTemplateDialog
        isOpen={true}
        slide={mockSlide}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText("Template Name"), {
      target: { value: "My Custom Template" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "A custom template description" },
    });
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "custom" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Create Template" }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        name: "My Custom Template",
        description: "A custom template description",
        category: "custom",
        tags: [],
      });
    });
  });

  it("should handle tags input", async () => {
    render(
      <CreateTemplateDialog
        isOpen={true}
        slide={mockSlide}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText("Template Name"), {
      target: { value: "Tagged Template" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Template with tags" },
    });

    // Add tags
    fireEvent.change(screen.getByLabelText("Tags (comma-separated)"), {
      target: { value: "tag1, tag2, tag3" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create Template" }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        name: "Tagged Template",
        description: "Template with tags",
        category: "custom",
        tags: ["tag1", "tag2", "tag3"],
      });
    });
  });

  it("should call onClose when cancel button is clicked", () => {
    render(
      <CreateTemplateDialog
        isOpen={true}
        slide={mockSlide}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should reset form when dialog is closed and reopened", () => {
    const { rerender } = render(
      <CreateTemplateDialog
        isOpen={true}
        slide={mockSlide}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Fill in some data
    fireEvent.change(screen.getByLabelText("Template Name"), {
      target: { value: "Test Name" },
    });

    // Close dialog
    rerender(
      <CreateTemplateDialog
        isOpen={false}
        slide={mockSlide}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Reopen dialog
    rerender(
      <CreateTemplateDialog
        isOpen={true}
        slide={mockSlide}
        onSave={mockOnSave}
        onClose={mockOnClose}
      />
    );

    // Form should be reset
    expect(screen.getByLabelText("Template Name")).toHaveValue("");
  });
});
