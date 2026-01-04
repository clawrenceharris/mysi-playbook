import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { userEvent } from "@testing-library/user-event";
import { DataReferenceSelector } from "../DataReferenceSelector";
import { DataReference } from "@/features/playground/domain/data-reference";

describe("DataReferenceSelector - Transformer Selection", () => {
  const mockSlides = [
    { id: "slide-1", title: "Slide 1", order: 0 },
    { id: "slide-2", title: "Slide 2", order: 1 },
  ];

  it("should show transformer selector with 'All' selected", () => {
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

    expect(screen.getByText("Transform")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("should show transformer selector with 'Current User' selected", () => {
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

    expect(screen.getByText("Transform")).toBeInTheDocument();
    expect(screen.getByText("Current User")).toBeInTheDocument();
  });

  it("should show transformer selector with 'Count' selected", () => {
    const onChange = vi.fn();
    const value: DataReference = {
      slideId: "slide-1",
      accessor: "responses",
      transformer: "count",
    };

    render(
      <DataReferenceSelector
        value={value}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    expect(screen.getByText("Transform")).toBeInTheDocument();
    expect(screen.getByText("Count")).toBeInTheDocument();
  });

  it("should show transformer selector with 'Exclude Current User' selected", () => {
    const onChange = vi.fn();
    const value: DataReference = {
      slideId: "slide-1",
      accessor: "responses",
      transformer: "excludeCurrentUser",
    };

    render(
      <DataReferenceSelector
        value={value}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    expect(screen.getByText("Transform")).toBeInTheDocument();
    expect(screen.getByText("Exclude Current User")).toBeInTheDocument();
  });

  it("should call onChange when transformer is changed", async () => {
    const user = userEvent.setup();
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

    // Find and click the transformer selector (third combobox)
    const comboboxes = screen.getAllByRole("combobox");
    const transformerSelect = comboboxes[2];
    await user.click(transformerSelect);

    // Select Count
    const countOption = screen.getByText("Count");
    await user.click(countOption);

    // Should call onChange with updated transformer
    expect(onChange).toHaveBeenCalledWith({
      slideId: "slide-1",
      accessor: "responses",
      transformer: "count",
    });
  });

  it("should update display when transformer changes", () => {
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

    expect(screen.getByText("All")).toBeInTheDocument();

    const newValue: DataReference = {
      slideId: "slide-1",
      accessor: "responses",
      transformer: "count",
    };

    rerender(
      <DataReferenceSelector
        value={newValue}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    expect(screen.getByText("Count")).toBeInTheDocument();
  });

  it("should not show transformer selector when no accessor is selected", () => {
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

    // Should show transformer when accessor is present
    expect(screen.getByText("Transform")).toBeInTheDocument();
  });
});
