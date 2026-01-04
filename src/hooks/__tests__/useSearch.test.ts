import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useSearch } from "../useSearch";

describe("useSearch", () => {
  it("should not cause infinite re-renders with inline filter function", async () => {
    const mockData = [
      { id: "1", name: "Apple" },
      { id: "2", name: "Banana" },
      { id: "3", name: "Cherry" },
    ];

    const renderSpy = vi.fn();

    const { result } = renderHook(() => {
      renderSpy();
      return useSearch({
        data: mockData,
        filter: (item, query) =>
          item.name.toLowerCase().includes(query.toLowerCase()),
        minQueryLength: 1,
        debounceMs: 50,
      });
    });

    // Trigger a search
    result.current.search("app");

    // Wait for debounce
    await waitFor(() => expect(result.current.hasSearched).toBe(true), {
      timeout: 200,
    });

    // Should render a reasonable number of times (initial + search trigger + debounce result)
    // NOT hundreds or thousands of times
    // Typical: 1 (initial) + 1 (search call) + 1 (debounce) + 1-2 (state updates) = 4-5 renders
    expect(renderSpy.mock.calls.length).toBeLessThan(10);
    expect(renderSpy.mock.calls.length).toBeGreaterThan(0);
  });

  it("should not cause infinite re-renders when data array reference changes", async () => {
    const renderSpy = vi.fn();
    let renderCount = 0;

    const { result, rerender } = renderHook(
      ({ data }) => {
        renderSpy();
        renderCount++;

        // Simulate what happens in PlaybooksPage: Object.values(playbooks) creates new array
        return useSearch({
          data,
          filter: (item, query) =>
            item.name.toLowerCase().includes(query.toLowerCase()),
          minQueryLength: 1,
          debounceMs: 50,
        });
      },
      {
        initialProps: {
          data: [
            { id: "1", name: "Apple" },
            { id: "2", name: "Banana" },
          ],
        },
      }
    );

    // Trigger search
    result.current.search("app");

    await waitFor(() => expect(result.current.hasSearched).toBe(true), {
      timeout: 200,
    });

    const countAfterFirstSearch = renderCount;

    // Simulate parent re-render with new array reference (same content)
    rerender({
      data: [
        { id: "1", name: "Apple" },
        { id: "2", name: "Banana" },
      ],
    });

    // Should not trigger excessive re-renders
    expect(renderCount - countAfterFirstSearch).toBeLessThan(5);
  });
});
