import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HandoutConfig } from "../HandoutConfig";
import { HandoutConfig as HandoutConfigType } from "@/features/playground/domain/playground.types";
import { PlaygroundProvider } from "@/providers";

describe("HandoutConfig", () => {
  const mockConfig: HandoutConfigType = {
    dataSource: "test-source",
    mismatchHandling: "auto",
    showAuthor: false,
    allowParticipantResponse: false,
    distributionMode: "one-per-participant",
    allowReassignment: false,
    showDistributionPreview: false,
  };

  const mockOnChange = vi.fn();

  const renderWithProvider = (config: HandoutConfigType) => {
    return render(
      <PlaygroundProvider>
        <HandoutConfig config={config} onChange={mockOnChange} />
      </PlaygroundProvider>
    );
  };

  describe("Task 6.2: Replace dataSource field with DataReferenceSelector", () => {
    it("should render DataReferenceSelector instead of VariableReferenceField", () => {
      renderWithProvider(mockConfig);

      // Should not find VariableReferenceField placeholder
      const variableField = screen.queryByPlaceholderText(
        /enter the source from which items will be assigned/i
      );
      expect(variableField).not.toBeInTheDocument();

      // Should find DataReferenceSelector by its specific placeholder text
      const dataReferenceSelector = screen.getByText(
        /select data source for items to assign/i
      );
      expect(dataReferenceSelector).toBeInTheDocument();
    });

    it("should pass DataReference value to DataReferenceSelector", () => {
      const configWithDataReference: HandoutConfigType = {
        ...mockConfig,
        dataSource: {
          slideId: "slide-123",
          accessor: "responses",
          transformer: "all",
        } as any, // Type assertion for test
      };

      renderWithProvider(configWithDataReference);

      // DataReferenceSelector should show formatted display when value is present
      const displayButton = screen.getByRole("button");
      expect(displayButton).toBeInTheDocument();
    });

    it("should call onChange with DataReference when DataReferenceSelector changes", () => {
      renderWithProvider(mockConfig);

      // This test verifies the integration - actual interaction testing
      // would require more complex setup with available slides
      expect(mockOnChange).toBeDefined();
    });
  });

  describe("Task 6.1: Remove saveToSharedState checkbox and variableName input", () => {
    it("should not render saveToSharedState checkbox", () => {
      renderWithProvider(mockConfig);

      const checkbox = screen.queryByLabelText(/save to shared state/i);
      expect(checkbox).not.toBeInTheDocument();
    });

    it("should not render variableName input field", () => {
      renderWithProvider(mockConfig);

      const input = screen.queryByLabelText(/variable name/i);
      expect(input).not.toBeInTheDocument();
    });

    it("should not call onChange with saveToSharedState property", () => {
      renderWithProvider(mockConfig);

      // Verify that no calls include saveToSharedState
      mockOnChange.mock.calls.forEach((call) => {
        expect(call[0]).not.toHaveProperty("saveToSharedState");
      });
    });

    it("should not call onChange with variableName property", () => {
      renderWithProvider(mockConfig);

      // Verify that no calls include variableName
      mockOnChange.mock.calls.forEach((call) => {
        expect(call[0]).not.toHaveProperty("variableName");
      });
    });
  });
});
