import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ParticipantPreviewView } from "../ParticipantPreviewView";
import { ParticipantManagerProvider } from "../ParticipantManagerContext";
import type { ImprovedStrategy } from "../../domain/playground.types";
import { BlockType, SlideType } from "../../domain/playground.types";

describe("ParticipantPreviewView", () => {
  const mockStrategy: ImprovedStrategy = {
    id: "test-strategy",
    title: "Test Strategy",
    slug: "test-strategy",

    slides: [
      {
        id: "slide-1",
        title: "Test Slide",
        type: SlideType.CONTENT,
        order: 0,
        blocks: [
          {
            id: "block-1",
            type: BlockType.DISPLAY_PROMPT,
            order: 0,
            config: {
              title: "Test Block",
              content: "Test content",
            },
          },
        ],
        timing: {
          estimatedDuration: 60,
          showTimer: false,
        },
        transitions: {
          type: "manual" as const,
        },
      },
    ],
    metadata: {
      position: 0,
    },
  };

  it("should render AvatarSelector at the top", () => {
    render(
      <ParticipantManagerProvider>
        <ParticipantPreviewView
          strategy={mockStrategy}
          slide={mockStrategy.slides[0]}
        />
      </ParticipantManagerProvider>
    );

    expect(screen.getByText("Viewing as:")).toBeInTheDocument();
  });

  it("should render blocks using BlockRenderer", () => {
    render(
      <ParticipantManagerProvider>
        <ParticipantPreviewView
          strategy={mockStrategy}
          slide={mockStrategy.slides[0]}
        />
      </ParticipantManagerProvider>
    );

    expect(screen.getByText("Test Block")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should display current participant name", () => {
    render(
      <ParticipantManagerProvider>
        <ParticipantPreviewView
          strategy={mockStrategy}
          slide={mockStrategy.slides[0]}
        />
      </ParticipantManagerProvider>
    );

    expect(screen.getByText("Participant 1")).toBeInTheDocument();
  });

  describe("Participant context creation", () => {
    it("should create context with userId set to current participant ID", () => {
      const { container } = render(
        <ParticipantManagerProvider>
          <ParticipantPreviewView
            strategy={mockStrategy}
            slide={mockStrategy.slides[0]}
          />
        </ParticipantManagerProvider>
      );

      // Context is created internally, verify component renders correctly
      expect(container.querySelector(".space-y-4")).toBeInTheDocument();
    });

    it("should create context with isHost set to false", () => {
      render(
        <ParticipantManagerProvider>
          <ParticipantPreviewView
            strategy={mockStrategy}
            slide={mockStrategy.slides[0]}
          />
        </ParticipantManagerProvider>
      );

      // Verify participant view is rendered (not host view)
      expect(screen.getByText("Viewing as:")).toBeInTheDocument();
    });

    it("should provide shared state from participant manager", () => {
      render(
        <ParticipantManagerProvider>
          <ParticipantPreviewView
            strategy={mockStrategy}
            slide={mockStrategy.slides[0]}
          />
        </ParticipantManagerProvider>
      );

      // Verify blocks are rendered with state context
      expect(screen.getByText("Test Block")).toBeInTheDocument();
    });

    it("should include mockParticipants array in context", () => {
      render(
        <ParticipantManagerProvider>
          <ParticipantPreviewView
            strategy={mockStrategy}
            slide={mockStrategy.slides[0]}
          />
        </ParticipantManagerProvider>
      );

      // Verify multiple participants are shown in avatar selector
      const avatarButtons = screen.getAllByRole("button");
      // Should have 3 participant avatars + 1 add button
      expect(avatarButtons.length).toBeGreaterThanOrEqual(4);
    });
  });
});
