import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { userEvent } from "@testing-library/user-event";
import { DataReferenceSelector } from "../DataReferenceSelector";

describe("DataReferenceSelector - Slide Selection", () => {
  const mockSlides = [
    { id: "slide-1", title: "Introduction", order: 0 },
    { id: "slide-2", title: "Main Content", order: 1 },
    { id: "slide-3", title: "Conclusion", order: 2 },
  ];

  it("should display available slides in chronological order", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DataReferenceSelector
        value={null}
        onChange={onChange}
        availableSlides={mockSlides}
        placeholder="Select slide"
      />
    );

    // Open the slide dropdown
    const triggers = screen.getAllByRole("combobox");
    const slideTrigger = triggers[0]; // First select is the slide selector
    await user.click(slideTrigger);

    // Check that slides appear in order
    const slideOptions = screen.getAllByRole("option");
    expect(slideOptions[0]).toHaveTextContent("Introduction");
    expect(slideOptions[1]).toHaveTextContent("Main Content");
    expect(slideOptions[2]).toHaveTextContent("Conclusion");
  });

  it("should show slide titles not IDs", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DataReferenceSelector
        value={null}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    const triggers = screen.getAllByRole("combobox");
    await user.click(triggers[0]);

    // Should show titles
    expect(screen.getByText("Introduction")).toBeInTheDocument();
    expect(screen.getByText("Main Content")).toBeInTheDocument();

    // Should not show IDs
    expect(screen.queryByText("slide-1")).not.toBeInTheDocument();
  });

  it("should call onChange with complete reference when slide is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DataReferenceSelector
        value={null}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    const triggers = screen.getAllByRole("combobox");
    await user.click(triggers[0]);

    // Select a slide
    const slideOption = screen.getByText("Main Content");
    await user.click(slideOption);

    // Should call onChange with complete reference (with defaults)
    expect(onChange).toHaveBeenCalledWith({
      slideId: "slide-2",
      accessor: "responses",
      transformer: "all",
    });
  });

  it("should show accessor selector after slide selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DataReferenceSelector
        value={null}
        onChange={onChange}
        availableSlides={mockSlides}
      />
    );

    // Initially no accessor selector
    expect(screen.queryByText("Data Type")).not.toBeInTheDocument();

    // Select a slide
    const triggers = screen.getAllByRole("combobox");
    await user.click(triggers[0]);
    await user.click(screen.getByText("Introduction"));

    // Now accessor selector should appear
    expect(screen.getByText("Data Type")).toBeInTheDocument();
  });
});
