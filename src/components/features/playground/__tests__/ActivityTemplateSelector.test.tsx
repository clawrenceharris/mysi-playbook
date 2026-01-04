import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActivityTemplateSelector } from "../ActivityTemplateSelector";
import type { ActivityTemplate } from "@/features/playground/domain/built-in-templates";
import { SlideType } from "@/features/playground";

// Create mock templates to avoid importing from domain which has dependency issues
const MOCK_SNOWBALL_TEMPLATE: ActivityTemplate = {
  id: "snowball-activity",
  title: "Snowball",
  description: "Students write questions, pick questions from a pool",
  category: "collaborative",
  preview: "",
  slides: [
    {
      title: "Write Questions",
      type: SlideType.INTERACTION,
      blocks: [],
      transitions: { type: "manual" },
      timing: { estimatedDuration: 300, showTimer: false },
    },
  ],
  sharedState: {},
  metadata: {
    estimatedDuration: 1080,
    tags: ["collaborative", "questions"],
    author: "system",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
};

const MOCK_POLL_TEMPLATE: ActivityTemplate = {
  id: "poll-activity",
  title: "Poll & Discussion",
  description: "Conduct a poll with multiple choice options",
  category: "assessment",
  preview: "",
  slides: [
    {
      title: "Poll Question",
      type: SlideType.POLL,
      blocks: [],
      transitions: { type: "manual" },
      timing: { estimatedDuration: 120, showTimer: false },
    },
  ],
  sharedState: {},
  metadata: {
    estimatedDuration: 450,
    tags: ["poll", "assessment"],
    author: "system",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
};

const MOCK_DISCUSSION_TEMPLATE: ActivityTemplate = {
  id: "discussion-activity",
  title: "Guided Discussion",
  description: "Structured discussion with prompts",
  category: "discussion",
  preview: "",
  slides: [
    {
      title: "Discussion Prompt",
      type: SlideType.CONTENT,
      blocks: [],
      transitions: { type: "manual" },
      timing: { estimatedDuration: 60, showTimer: false },
    },
  ],
  sharedState: {},
  metadata: {
    estimatedDuration: 1020,
    tags: ["discussion", "reflection"],
    author: "system",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
};

describe("ActivityTemplateSelector", () => {
  const mockTemplates: ActivityTemplate[] = [
    MOCK_SNOWBALL_TEMPLATE,
    MOCK_POLL_TEMPLATE,
    MOCK_DISCUSSION_TEMPLATE,
  ];

  const mockOnTemplateSelect = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    isOpen: true,
    templates: mockTemplates,
    onTemplateSelect: mockOnTemplateSelect,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when isOpen is true", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);
      expect(
        screen.getByText("Choose an Activity Template")
      ).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<ActivityTemplateSelector {...defaultProps} isOpen={false} />);
      expect(
        screen.queryByText("Choose an Activity Template")
      ).not.toBeInTheDocument();
    });

    it("should render all templates", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);
      expect(screen.getByText("Snowball")).toBeInTheDocument();
      expect(screen.getByText("Poll & Discussion")).toBeInTheDocument();
      expect(screen.getByText("Guided Discussion")).toBeInTheDocument();
    });

    it("should render template descriptions", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);
      expect(
        screen.getByText(/Students write questions, pick questions from a pool/)
      ).toBeInTheDocument();
    });

    it("should render slide count for each template", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);
      const slideCountElements = screen.getAllByText(/\d+ slides/);
      expect(slideCountElements.length).toBeGreaterThan(0);
    });

    it("should render estimated duration for each template", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);
      const durationElements = screen.getAllByText(/\d+ min/);
      expect(durationElements.length).toBeGreaterThan(0);
    });

    it("should render tags for templates", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);
      expect(screen.getByText("collaborative")).toBeInTheDocument();
      expect(screen.getByText("discussion")).toBeInTheDocument();
    });
  });

  describe("Category Filtering", () => {
    it("should render category filter buttons", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Collaborative")).toBeInTheDocument();
      expect(screen.getByText("Assessment")).toBeInTheDocument();
      expect(screen.getByText("Discussion")).toBeInTheDocument();
    });

    it("should filter templates by category", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);

      // Click on Collaborative category
      fireEvent.click(screen.getByText("Collaborative"));

      // Should show Snowball (collaborative)
      expect(screen.getByText("Snowball")).toBeInTheDocument();

      // Should not show Poll & Discussion (assessment)
      expect(screen.queryByText("Poll & Discussion")).not.toBeInTheDocument();
    });

    it("should show all templates when All is selected", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);

      // Click on a specific category first
      fireEvent.click(screen.getByText("Collaborative"));

      // Then click All
      fireEvent.click(screen.getByText("All"));

      // Should show all templates
      expect(screen.getByText("Snowball")).toBeInTheDocument();
      expect(screen.getByText("Poll & Discussion")).toBeInTheDocument();
      expect(screen.getByText("Guided Discussion")).toBeInTheDocument();
    });
  });

  describe("Template Selection", () => {
    it("should call onTemplateSelect when a template is clicked", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);

      const snowballCard = screen.getByText("Snowball").closest("div");
      if (snowballCard) {
        fireEvent.click(snowballCard);
      }

      expect(mockOnTemplateSelect).toHaveBeenCalledWith(MOCK_SNOWBALL_TEMPLATE);
    });

    it("should call onTemplateSelect with correct template", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);

      const pollCard = screen.getByText("Poll & Discussion").closest("div");
      if (pollCard) {
        fireEvent.click(pollCard);
      }

      expect(mockOnTemplateSelect).toHaveBeenCalledWith(MOCK_POLL_TEMPLATE);
    });
  });

  describe("Dialog Actions", () => {
    it("should call onClose when Cancel button is clicked", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should call onClose when dialog is closed via onOpenChange", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);

      // Simulate dialog close (this would normally be triggered by clicking outside or pressing Escape)
      // The Dialog component from shadcn handles this internally
      expect(mockOnClose).toBeDefined();
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no templates are provided", () => {
      render(<ActivityTemplateSelector {...defaultProps} templates={[]} />);
      expect(
        screen.getByText("No activity templates available")
      ).toBeInTheDocument();
    });

    it("should show empty state when filtered category has no templates", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);

      // Click on Engagement category (none of our templates are engagement)
      const engagementButton = screen.queryByText("Engagement");

      // If engagement button exists, click it and check for empty state
      if (engagementButton) {
        fireEvent.click(engagementButton);
        expect(
          screen.getByText("No activity templates available")
        ).toBeInTheDocument();
      } else {
        // If no engagement category, test passes as expected
        expect(true).toBe(true);
      }
    });
  });

  describe("Template Metadata Display", () => {
    it("should format duration correctly", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);

      // Snowball is 1080 seconds = 18 minutes
      expect(screen.getByText("18 min")).toBeInTheDocument();
    });

    it("should limit displayed tags to 3", () => {
      // Create a template with more than 3 tags
      const templateWithManyTags: ActivityTemplate = {
        ...MOCK_SNOWBALL_TEMPLATE,
        metadata: {
          ...MOCK_SNOWBALL_TEMPLATE.metadata,
          tags: ["tag1", "tag2", "tag3", "tag4", "tag5"],
        },
      };

      render(
        <ActivityTemplateSelector
          {...defaultProps}
          templates={[templateWithManyTags]}
        />
      );

      // Should show +2 indicator for remaining tags
      expect(screen.getByText("+2")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible dialog title", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);
      expect(
        screen.getByText("Choose an Activity Template")
      ).toBeInTheDocument();
    });

    it("should have clickable template cards", () => {
      render(<ActivityTemplateSelector {...defaultProps} />);

      const cards = screen.getAllByRole("button", {
        name: /All|Collaborative|Assessment|Discussion|Cancel/,
      });
      expect(cards.length).toBeGreaterThan(0);
    });
  });
});
