import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PollVoteConfig } from "../PollVoteConfig";
import type { PollVoteConfig as PollVoteConfigType } from "@/features/playground/domain/playground.types";

describe("PollVoteConfig", () => {
  const defaultConfig: PollVoteConfigType = {
    question: "What is your favorite color?",
    options: ["Red", "Blue", "Green"],
    allowMultiple: false,
    showResults: "afterVoting",
    anonymous: true,
  };

  it("should render question input field", () => {
    const onChange = vi.fn();
    render(<PollVoteConfig config={defaultConfig} onChange={onChange} />);

    expect(screen.getByLabelText(/question/i)).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("What is your favorite color?")
    ).toBeInTheDocument();
  });

  it("should render save to shared state checkbox", () => {
    const onChange = vi.fn();
    render(<PollVoteConfig config={defaultConfig} onChange={onChange} />);

    expect(screen.getByLabelText(/save to shared state/i)).toBeInTheDocument();
  });

  it("should show variable name input when save to shared state is checked", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PollVoteConfig config={defaultConfig} onChange={onChange} />
    );

    const checkbox = screen.getByLabelText(/save to shared state/i);
    fireEvent.click(checkbox);

    const updatedConfig = {
      ...defaultConfig,
      saveToSharedState: true,
      variableName: "favorite_color",
    };
    rerender(<PollVoteConfig config={updatedConfig} onChange={onChange} />);

    expect(screen.getByLabelText(/variable name/i)).toBeInTheDocument();
  });

  it("should auto-suggest variable name based on question", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PollVoteConfig config={defaultConfig} onChange={onChange} />
    );

    const checkbox = screen.getByLabelText(/save to shared state/i);
    fireEvent.click(checkbox);

    const updatedConfig = {
      ...defaultConfig,
      saveToSharedState: true,
      variableName: "favorite_color",
    };
    rerender(<PollVoteConfig config={updatedConfig} onChange={onChange} />);

    const variableInput = screen.getByLabelText(/variable name/i);
    expect(variableInput).toHaveValue("favorite_color");
  });
});
