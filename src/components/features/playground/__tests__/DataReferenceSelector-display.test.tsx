import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DataReferenceSelector } from "../DataReferenceSelector";
import { DataReference } from "@/features/playground/domain/data-reference";

describe("DataReferenceSelector - Display String Formatting", () => {
  const mockSlides = [
    { id: "slide-1", title: "Introduction", order: 0 },
    { id: "slide-2", title: "Main Content", order: 1 },
  ];

  it("should format display as 'Slide → Accessor → Transformer'", () => {
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

    // Should show formatted string with arrows
    const displayText = screen.getByText(/Introduction.*→.*Responses.*→.*All/);
    expect(displayText).toBeInTheDocument();
  });

  it("should use human-readable names in display", () => {
    const onChange = vi.fn();
    const value: DataReference = {
      slideId: "slide-2",
      accessor: "assignmentResponses",
      transformer: "currentUser",
    };

    render(
      <DataReferenceSelector
        value={value}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    // Should show human-readable names, not technical IDs
    expect(screen.getByText(/Main Content/)).toBeInTheDocument();
    expect(screen.getByText(/Assignment Responses/)).toBeInTheDocument();
    expect(screen.getByText(/Current User/)).toBeInTheDocument();

    // Should not show technical names
    expect(screen.queryByText("assignmentResponses")).not.toBeInTheDocument();
    expect(screen.queryByText("currentUser")).not.toBeInTheDocument();
  });

  it("should update display in real-time when value changes", () => {
    const onChange = vi.fn();
    const value: DataReference = {
      slideId: "slide-1",
      accessor: "responses",
      transformer: "all",
    };

    const { rerender } = render(
      <DataReferenceSelector
        value={value}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    expect(
      screen.getByText(/Introduction.*→.*Responses.*→.*All/)
    ).toBeInTheDocument();

    // Update to different values
    const newValue: DataReference = {
      slideId: "slide-2",
      accessor: "assignments",
      transformer: "count",
    };

    rerender(
      <DataReferenceSelector
        value={newValue}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    expect(
      screen.getByText(/Main Content.*→.*Assignments.*→.*Count/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Introduction/)).not.toBeInTheDocument();
  });

  it("should handle unknown slide gracefully", () => {
    const onChange = vi.fn();
    const value: DataReference = {
      slideId: "unknown-slide",
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

    // Should show "Unknown Slide" for missing slide
    expect(screen.getByText(/Unknown Slide/)).toBeInTheDocument();
    expect(screen.getByText(/Responses/)).toBeInTheDocument();
    expect(screen.getByText(/All/)).toBeInTheDocument();
  });

  it("should show placeholder when no value is provided", () => {
    const onChange = vi.fn();

    render(
      <DataReferenceSelector
        value={null}
        onChange={onChange}
        availableSlides={mockSlides}
        placeholder="Select a data reference"
      />
    );

    expect(screen.getByText("Select a data reference")).toBeInTheDocument();
  });
});
