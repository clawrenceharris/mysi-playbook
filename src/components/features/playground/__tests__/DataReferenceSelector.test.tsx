import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DataReferenceSelector } from "../DataReferenceSelector";
import { DataReference } from "@/features/playground/domain/data-reference";

describe("DataReferenceSelector - Base Component Structure", () => {
  const mockSlides = [
    { id: "slide-1", title: "Slide 1", order: 0 },
    { id: "slide-2", title: "Slide 2", order: 1 },
  ];

  it("should render slide selector with placeholder when no value is provided", () => {
    const onChange = vi.fn();

    render(
      <DataReferenceSelector
        value={null}
        onChange={onChange}
        availableSlides={mockSlides}
        placeholder="Select slide"
      />
    );

    // Should show the slide selector
    expect(screen.getByText("Slide")).toBeInTheDocument();
    expect(screen.getByText("Select slide")).toBeInTheDocument();
  });

  it("should show all three selects when value is complete", () => {
    const onChange = vi.fn();
    const value: DataReference = {
      slideId: "slide-1",
      accessor: "responses",
      transformer: "all",
    };

    render(
      <DataReferenceSelector
        value={value}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    // Should show all three labels
    expect(screen.getByText("Slide")).toBeInTheDocument();
    expect(screen.getByText("Data Type")).toBeInTheDocument();
    expect(screen.getByText("Transform")).toBeInTheDocument();
  });

  it("should support disabled state on all selects", () => {
    const onChange = vi.fn();
    const value: DataReference = {
      slideId: "slide-1",
      accessor: "responses",
      transformer: "all",
    };

    render(
      <DataReferenceSelector
        value={value}
        onChange={onChange}
        availableSlides={mockSlides}
        disabled={true}
      />
    );

    // All selects should be disabled
    const comboboxes = screen.getAllByRole("combobox");
    comboboxes.forEach((combobox) => {
      expect(combobox).toBeDisabled();
    });
  });

  it("should display selected values in each select", () => {
    const onChange = vi.fn();
    const value: DataReference = {
      slideId: "slide-1",
      accessor: "responses",
      transformer: "currentUser",
    };

    render(
      <DataReferenceSelector
        value={value}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    // Should display selected values
    expect(screen.getByText("Slide 1")).toBeInTheDocument();
    expect(screen.getByText("Responses")).toBeInTheDocument();
    expect(screen.getByText("Current User")).toBeInTheDocument();
  });

  it("should only show slide selector when no slide is selected", () => {
    const onChange = vi.fn();

    render(
      <DataReferenceSelector
        value={null}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    // Should only show slide label
    expect(screen.getByText("Slide")).toBeInTheDocument();
    expect(screen.queryByText("Data Type")).not.toBeInTheDocument();
    expect(screen.queryByText("Transform")).not.toBeInTheDocument();
  });

  it("should show accessor selector after slide is selected", () => {
    const onChange = vi.fn();
    const value: DataReference = {
      slideId: "slide-1",
      accessor: "responses",
      transformer: "all",
    };

    render(
      <DataReferenceSelector
        value={value}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    // Should show slide and accessor
    expect(screen.getByText("Slide")).toBeInTheDocument();
    expect(screen.getByText("Data Type")).toBeInTheDocument();
  });
});
