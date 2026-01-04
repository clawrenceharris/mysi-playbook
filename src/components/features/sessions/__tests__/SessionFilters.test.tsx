import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SessionFilters } from "../SessionFilters";

describe("SessionFilters", () => {
  it("should render status filter toggle group", () => {
    const mockOnFilterChange = vi.fn();

    render(
      <SessionFilters
        onFilterChange={mockOnFilterChange}
        filters={{ status: [], course: [], timeRange: "all" }}
      />
    );

    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("should render all status options", () => {
    const mockOnFilterChange = vi.fn();

    render(
      <SessionFilters
        onFilterChange={mockOnFilterChange}
        filters={{ status: [], course: [], timeRange: "all" }}
      />
    );

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Scheduled")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("should call onFilterChange when status is toggled", () => {
    const mockOnFilterChange = vi.fn();

    render(
      <SessionFilters
        onFilterChange={mockOnFilterChange}
        filters={{ status: [], course: [], timeRange: "all" }}
      />
    );

    const activeButton = screen.getByText("Active");
    fireEvent.click(activeButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      status: ["active"],
      courses: [],
      timeRange: "all",
    });
  });
});
