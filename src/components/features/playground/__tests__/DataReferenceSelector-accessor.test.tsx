import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { userEvent } from "@testing-library/user-event";
import { DataReferenceSelector } from "../DataReferenceSelector";
import { DataReference } from "@/features/playground/domain/data-reference";

describe("DataReferenceSelector - Accessor Selection", () => {
  const mockSlides = [
    { id: "slide-1", title: "Slide 1", order: 0 },
    { id: "slide-2", title: "Slide 2", order: 1 },
  ];

  it("should show accessor selector with Responses selected", () => {
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

    expect(screen.getByText("Data Type")).toBeInTheDocument();
    expect(screen.getByText("Responses")).toBeInTheDocument();
  });

  it("should show accessor selector with Assignments selected", () => {
    const onChange = vi.fn();
    const value: DataReference = {
      slideId: "slide-1",
      accessor: "assignments",
      transformer: "all",
    };

    render(
      <DataReferenceSelector
        value={value}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    expect(screen.getByText("Data Type")).toBeInTheDocument();
    expect(screen.getByText("Assignments")).toBeInTheDocument();
  });

  it("should show accessor selector with Assignment Responses selected", () => {
    const onChange = vi.fn();
    const value: DataReference = {
      slideId: "slide-1",
      accessor: "assignmentResponses",
      transformer: "all",
    };

    render(
      <DataReferenceSelector
        value={value}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    expect(screen.getByText("Data Type")).toBeInTheDocument();
    expect(screen.getByText("Assignment Responses")).toBeInTheDocument();
  });

  it("should call onChange when accessor is changed", async () => {
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

    // Find and click the accessor selector (second combobox)
    const comboboxes = screen.getAllByRole("combobox");
    const accessorSelect = comboboxes[1];
    await user.click(accessorSelect);

    // Select Assignments
    const assignmentsOption = screen.getByText("Assignments");
    await user.click(assignmentsOption);

    // Should call onChange with updated accessor
    expect(onChange).toHaveBeenCalledWith({
      slideId: "slide-1",
      accessor: "assignments",
      transformer: "all",
    });
  });

  it("should update display when accessor changes", () => {
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

    expect(screen.getByText("Responses")).toBeInTheDocument();

    const newValue: DataReference = {
      slideId: "slide-1",
      accessor: "assignments",
      transformer: "all",
    };

    rerender(
      <DataReferenceSelector
        value={newValue}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    expect(screen.getByText("Assignments")).toBeInTheDocument();
  });

  it("should not show accessor selector when no slide is selected", () => {
    const onChange = vi.fn();

    render(
      <DataReferenceSelector
        value={null}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    expect(screen.queryByText("Data Type")).not.toBeInTheDocument();
  });

  it("should show transformer selector after accessor is selected", () => {
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
  });
});
