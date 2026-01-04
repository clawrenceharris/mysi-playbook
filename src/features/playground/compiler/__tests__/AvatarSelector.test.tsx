import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { AvatarSelector } from "../AvatarSelector";
import type { MockParticipant } from "../ParticipantStateManager";

describe("AvatarSelector", () => {
  const mockParticipants: MockParticipant[] = [
    {
      id: "participant-1",
      name: "Participant 1",
      avatarNumber: 1,
      isHost: false,
    },
    {
      id: "participant-2",
      name: "Participant 2",
      avatarNumber: 2,
      isHost: false,
    },
    {
      id: "participant-3",
      name: "Participant 3",
      avatarNumber: 3,
      isHost: false,
    },
  ];

  it("should render avatar buttons for each participant", () => {
    const onSelectParticipant = vi.fn();
    const onAddParticipant = vi.fn();

    render(
      <AvatarSelector
        participants={mockParticipants}
        currentParticipantId="participant-1"
        onSelectParticipant={onSelectParticipant}
        onAddParticipant={onAddParticipant}
      />
    );

    // Should render 3 avatar buttons
    const avatarButtons = screen.getAllByRole("button");
    expect(avatarButtons.length).toBe(4); // 3 participants + 1 add button
  });

  it("should display circular avatar images for each participant", () => {
    const onSelectParticipant = vi.fn();
    const onAddParticipant = vi.fn();

    const { container } = render(
      <AvatarSelector
        participants={mockParticipants}
        currentParticipantId="participant-1"
        onSelectParticipant={onSelectParticipant}
        onAddParticipant={onAddParticipant}
      />
    );

    // Check for avatar containers (span with data-slot="avatar")
    const avatars = container.querySelectorAll('[data-slot="avatar"]');
    expect(avatars.length).toBe(3);

    // Verify avatar buttons have rounded-full class
    const avatarButtons = screen.getAllByRole("button");
    expect(avatarButtons[0]).toHaveClass("rounded-full");
    expect(avatarButtons[1]).toHaveClass("rounded-full");
    expect(avatarButtons[2]).toHaveClass("rounded-full");
  });

  it("should highlight active participant with border and ring", () => {
    const onSelectParticipant = vi.fn();
    const onAddParticipant = vi.fn();

    render(
      <AvatarSelector
        participants={mockParticipants}
        currentParticipantId="participant-2"
        onSelectParticipant={onSelectParticipant}
        onAddParticipant={onAddParticipant}
      />
    );

    const avatarButtons = screen.getAllByRole("button");
    // Second button should be active (participant-2)
    expect(avatarButtons[1]).toHaveClass("border-primary-500");
    expect(avatarButtons[1]).toHaveClass("ring-2");
  });

  it("should show Add Participant button with plus icon", () => {
    const onSelectParticipant = vi.fn();
    const onAddParticipant = vi.fn();

    render(
      <AvatarSelector
        participants={mockParticipants}
        currentParticipantId="participant-1"
        onSelectParticipant={onSelectParticipant}
        onAddParticipant={onAddParticipant}
      />
    );

    // Find the add button (last button)
    const buttons = screen.getAllByRole("button");
    const addButton = buttons[buttons.length - 1];

    // Should have plus icon (check for svg)
    const svg = addButton.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should show current participant name", () => {
    const onSelectParticipant = vi.fn();
    const onAddParticipant = vi.fn();

    render(
      <AvatarSelector
        participants={mockParticipants}
        currentParticipantId="participant-2"
        onSelectParticipant={onSelectParticipant}
        onAddParticipant={onAddParticipant}
      />
    );

    expect(screen.getByText("Participant 2")).toBeInTheDocument();
  });

  it("should handle participant selection clicks", async () => {
    const user = userEvent.setup();
    const onSelectParticipant = vi.fn();
    const onAddParticipant = vi.fn();

    render(
      <AvatarSelector
        participants={mockParticipants}
        currentParticipantId="participant-1"
        onSelectParticipant={onSelectParticipant}
        onAddParticipant={onAddParticipant}
      />
    );

    const avatarButtons = screen.getAllByRole("button");
    await user.click(avatarButtons[1]); // Click second participant

    expect(onSelectParticipant).toHaveBeenCalledWith(mockParticipants[1]);
  });

  it("should handle add participant button click", async () => {
    const user = userEvent.setup();
    const onSelectParticipant = vi.fn();
    const onAddParticipant = vi.fn();

    render(
      <AvatarSelector
        participants={mockParticipants}
        currentParticipantId="participant-1"
        onSelectParticipant={onSelectParticipant}
        onAddParticipant={onAddParticipant}
      />
    );

    const buttons = screen.getAllByRole("button");
    const addButton = buttons[buttons.length - 1];
    await user.click(addButton);

    expect(onAddParticipant).toHaveBeenCalled();
  });

  it("should display Viewing as label", () => {
    const onSelectParticipant = vi.fn();
    const onAddParticipant = vi.fn();

    render(
      <AvatarSelector
        participants={mockParticipants}
        currentParticipantId="participant-1"
        onSelectParticipant={onSelectParticipant}
        onAddParticipant={onAddParticipant}
      />
    );

    expect(screen.getByText("Viewing as:")).toBeInTheDocument();
  });
});
