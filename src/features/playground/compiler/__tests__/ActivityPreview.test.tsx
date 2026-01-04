import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SlideType, type ImprovedStrategy } from "../../";
import { ActivityPreview } from "../";

const mockStrategy: ImprovedStrategy = {
  id: "test-strategy",
  slug: "test-strategy",

  title: "Test Strategy",
  slides: [
    {
      id: "slide-1",
      title: "Test Slide",
      order: 0,
      blocks: [],
      timing: {
        estimatedDuration: 300,
        showTimer: false,
      },
      transitions: {
        type: "manual",
      },
      type: SlideType.CONTENT,
    },
  ],
  metadata: {
    position: 0,
  },
};

describe("ActivityPreview", () => {
  it("should wrap preview content with ParticipantManagerProvider", () => {
    render(<ActivityPreview strategy={mockStrategy} onEndPreview={() => {}} />);

    // Should render tabs (which require ParticipantManagerProvider)
    expect(
      screen.getByRole("tab", { name: /participant view/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /host view/i })).toBeInTheDocument();
  });
});
