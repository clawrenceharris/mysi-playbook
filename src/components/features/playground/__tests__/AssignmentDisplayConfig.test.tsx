import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HandoutConfig } from "../HandoutConfig";
import type { HandoutConfig as HandoutConfigType } from "@/features/playground/domain/playground.types";

describe("AssignmentDisplayConfig", () => {
  const defaultConfig: HandoutConfigType = {
    dataSource: "",
    distributionMode: "one-per-participant",
    mismatchHandling: "auto",
    showAuthor: false,
    allowParticipantResponse: false,
    allowReassignment: true,
    showDistributionPreview: true,
  };

  it("should render data source input field", () => {
    const onChange = vi.fn();
    render(<HandoutConfig config={defaultConfig} onChange={onChange} />);

    expect(screen.getByLabelText(/data source/i)).toBeInTheDocument();
  });

  it("should render distribution mode select", () => {
    const onChange = vi.fn();
    render(<HandoutConfig config={defaultConfig} onChange={onChange} />);

    expect(screen.getByLabelText(/distribution mode/i)).toBeInTheDocument();
  });

  it("should render mismatch handling select", () => {
    const onChange = vi.fn();
    render(<HandoutConfig config={defaultConfig} onChange={onChange} />);

    expect(screen.getByLabelText(/mismatch handling/i)).toBeInTheDocument();
  });

  it("should render display mode select", () => {
    const onChange = vi.fn();
    render(<HandoutConfig config={defaultConfig} onChange={onChange} />);

    expect(screen.getByLabelText(/display mode/i)).toBeInTheDocument();
  });

  it("should render show author checkbox", () => {
    const onChange = vi.fn();
    render(<HandoutConfig config={defaultConfig} onChange={onChange} />);

    expect(
      screen.getByLabelText(/show author information/i)
    ).toBeInTheDocument();
  });

  it("should render allow participant response checkbox", () => {
    const onChange = vi.fn();
    render(<HandoutConfig config={defaultConfig} onChange={onChange} />);

    expect(
      screen.getByLabelText(/allow participant responses/i)
    ).toBeInTheDocument();
  });

  it("should show response prompt field when allow participant response is enabled", () => {
    const onChange = vi.fn();
    const configWithResponse = {
      ...defaultConfig,
      allowParticipantResponse: true,
    };
    render(<HandoutConfig config={configWithResponse} onChange={onChange} />);

    expect(screen.getByLabelText(/response prompt/i)).toBeInTheDocument();
  });

  it("should not show response prompt field when allow participant response is disabled", () => {
    const onChange = vi.fn();
    render(<HandoutConfig config={defaultConfig} onChange={onChange} />);

    expect(screen.queryByLabelText(/response prompt/i)).not.toBeInTheDocument();
  });

  it("should render allow reassignment checkbox", () => {
    const onChange = vi.fn();
    render(<HandoutConfig config={defaultConfig} onChange={onChange} />);

    expect(screen.getByLabelText(/allow reassignment/i)).toBeInTheDocument();
  });

  it("should render show distribution preview checkbox", () => {
    const onChange = vi.fn();
    render(<HandoutConfig config={defaultConfig} onChange={onChange} />);

    expect(
      screen.getByLabelText(/show distribution preview/i)
    ).toBeInTheDocument();
  });

  it("should show variable selector when available variables are provided", () => {
    const onChange = vi.fn();

    render(<HandoutConfig config={defaultConfig} onChange={onChange} />);

    expect(screen.getByText("Select...")).toBeInTheDocument();
  });

  it("should display helpful description for each distribution mode", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <HandoutConfig config={defaultConfig} onChange={onChange} />
    );

    expect(
      screen.getByText(/each participant gets exactly one item/i)
    ).toBeInTheDocument();

    rerender(
      <HandoutConfig
        config={{ ...defaultConfig, distributionMode: "round-robin" }}
        onChange={onChange}
      />
    );
    expect(
      screen.getByText(/items distributed evenly in order/i)
    ).toBeInTheDocument();

    rerender(
      <HandoutConfig
        config={{ ...defaultConfig, distributionMode: "random" }}
        onChange={onChange}
      />
    );
    expect(
      screen.getByText(/items shuffled before distribution/i)
    ).toBeInTheDocument();

    rerender(
      <HandoutConfig
        config={{ ...defaultConfig, distributionMode: "exclude-own" }}
        onChange={onChange}
      />
    );
    expect(
      screen.getByText(/participants.*receive.*own items/i)
    ).toBeInTheDocument();
  });
});
