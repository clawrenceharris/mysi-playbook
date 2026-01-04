import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TemplateSelector } from "../TemplateSelector";
import { SlideTemplate } from "@/features/playground/domain/slide-templates";
import { SlideType } from "@/features/playground/domain/playground.types";

describe("TemplateSelector", () => {
  const mockOnTemplateSelect = vi.fn();
  const mockOnClose = vi.fn();

  const mockTemplates: SlideTemplate[] = [
    {
      id: "template-1",
      name: "Question & Response",
      description: "Ask a question and collect responses",
      slideType: SlideType.INTERACTION,
      blocks: [],
      metadata: {
        estimatedDuration: 300,
        tags: ["question", "response"],
        author: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    {
      id: "template-2",
      name: "Content Display",
      description: "Display information to participants",
      slideType: SlideType.CONTENT,
      blocks: [],
      metadata: {
        estimatedDuration: 180,
        tags: ["content", "display"],
        author: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render template selection dialog", () => {
    render(
      <TemplateSelector
        isOpen={true}
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("Choose a Template")).toBeInTheDocument();
    expect(screen.getByText("Question & Response")).toBeInTheDocument();
    expect(screen.getByText("Content Display")).toBeInTheDocument();
  });

  it("should not render when isOpen is false", () => {
    render(
      <TemplateSelector
        isOpen={false}
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText("Choose a Template")).not.toBeInTheDocument();
  });

  it("should display template previews and descriptions", () => {
    render(
      <TemplateSelector
        isOpen={true}
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
        onClose={mockOnClose}
      />
    );

    expect(
      screen.getByText("Ask a question and collect responses")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Display information to participants")
    ).toBeInTheDocument();
    expect(screen.getByText("5 min")).toBeInTheDocument(); // Duration display
    expect(screen.getByText("3 min")).toBeInTheDocument();
  });

  it("should filter templates by category", () => {
    render(
      <TemplateSelector
        isOpen={true}
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
        onClose={mockOnClose}
      />
    );

    // Click on content category filter
    fireEvent.click(screen.getByText("Content"));

    expect(screen.getByText("Content Display")).toBeInTheDocument();
    expect(screen.queryByText("Question & Response")).not.toBeInTheDocument();
  });

  it("should call onTemplateSelect when template is selected", () => {
    render(
      <TemplateSelector
        isOpen={true}
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText("Question & Response"));
    expect(mockOnTemplateSelect).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it("should call onClose when cancel button is clicked", () => {
    render(
      <TemplateSelector
        isOpen={true}
        templates={mockTemplates}
        onTemplateSelect={mockOnTemplateSelect}
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should show empty state when no templates available", () => {
    render(
      <TemplateSelector
        isOpen={true}
        templates={[]}
        onTemplateSelect={mockOnTemplateSelect}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("No templates available")).toBeInTheDocument();
  });
});
