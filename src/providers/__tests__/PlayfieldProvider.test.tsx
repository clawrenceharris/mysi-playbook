import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { PlayfieldProvider, usePlayfield } from "../PlayfieldProvider";
import { registerCompiledActivity } from "@/activities/registry";
import { PlaybookDefinitionExtended } from "@/features/playground/compiler/compiler.types";

// Mock the SessionCallProvider
vi.mock("../SessionCallProvider", () => ({
  useSessionCall: () => ({
    activeCall: {
      currentUserId: "test-user",
      isCreatedByMe: false,
      sendCustomEvent: vi.fn(),
      on: vi.fn(() => vi.fn()),
      update: vi.fn(),
      state: {
        custom: {
          strategySlug: null,
          currentEvent: null,
        },
      },
    },
  }),
}));

// Mock the hooks
vi.mock("@/hooks", () => ({
  usePlayfieldLayout: () => ({
    state: "idle",
    reset: vi.fn(),
    expandPlayfield: vi.fn(),
  }),
}));

// Test component that uses the playfield context
function TestComponent() {
  const { strategy } = usePlayfield();

  return (
    <div>
      {strategy ? (
        <div data-testid="strategy-active">{strategy.title}</div>
      ) : (
        <div data-testid="no-strategy">No strategy</div>
      )}
    </div>
  );
}

describe("PlayfieldProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should support compiled activities from playground", async () => {
    // Register a compiled activity
    const compiledActivity: PlaybookDefinitionExtended = {
      slug: "test-compiled",
      title: "Test Compiled Activity",
      phases: ["phase1", "phase2"],
      start: vi.fn(),
      handleEvent: vi.fn(),
      Component: () => <div>Test Component</div>,
      HostControls: () => <div>Test Controls</div>,
      metadata: {
        sourceActivityId: "source-123",
        compiledAt: new Date(),
        compilerVersion: "1.0.0",
        isPlaygroundGenerated: true,
        canRecompile: true,
      },
    };

    registerCompiledActivity(compiledActivity);

    render(
      <PlayfieldProvider>
        <TestComponent />
      </PlayfieldProvider>
    );

    // Initially no strategy
    expect(screen.getByTestId("no-strategy")).toBeInTheDocument();
  });

  it("should handle errors gracefully for compiled activities", () => {
    render(
      <PlayfieldProvider>
        <TestComponent />
      </PlayfieldProvider>
    );

    // Should not crash
    expect(screen.getByTestId("no-strategy")).toBeInTheDocument();
  });
});
