import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CollectInputConfig } from "../CollectInputConfig";
import type { CollectInputConfig as CollectInputConfigType } from "@/features/playground/domain/playground.types";

describe("CollectInputConfig", () => {
  const defaultConfig: CollectInputConfigType = {
    content: "What is your name?",
    inputType: "text",
    required: false,
  };

  it("should render question input field", () => {
    const onChange = vi.fn();
    render(<CollectInputConfig config={defaultConfig} onChange={onChange} />);

    expect(screen.getByLabelText(/question/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("What is your name?")).toBeInTheDocument();
  });

  it("should NOT render save to shared state checkbox", () => {
    const onChange = vi.fn();
    render(<CollectInputConfig config={defaultConfig} onChange={onChange} />);

    expect(
      screen.queryByLabelText(/save to shared state/i)
    ).not.toBeInTheDocument();
  });

  it("should NOT render variable name input", () => {
    const onChange = vi.fn();
    render(<CollectInputConfig config={defaultConfig} onChange={onChange} />);

    expect(screen.queryByLabelText(/variable name/i)).not.toBeInTheDocument();
  });

  it("should automatically save to slide-scoped state without user configuration", () => {
    const onChange = vi.fn();
    render(<CollectInputConfig config={defaultConfig} onChange={onChange} />);

    // The component should render without any save-to-state configuration UI
    // Data will be automatically saved to slide-scoped state by the execution engine
    expect(
      screen.queryByLabelText(/save to shared state/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/variable name/i)).not.toBeInTheDocument();
  });
});
