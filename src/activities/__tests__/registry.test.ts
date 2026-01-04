import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  registry,
  registerCompiledActivity,
  getCompiledActivities,
  getAllActivities,
  isCompiledActivity,
} from "../registry";
import { PlaybookDefinitionExtended } from "@/features/playground/compiler/compiler.types";

describe("Activity Registry", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("registerCompiledActivity", () => {
    it("should register a compiled activity to localStorage", () => {
      const mockActivity: PlaybookDefinitionExtended = {
        slug: "test-activity",
        title: "Test Activity",
        phases: ["phase1", "phase2"],
        start: vi.fn(),
        handleEvent: vi.fn(),

        Component: vi.fn() as any,
        HostControls: vi.fn() as any,
        metadata: {
          sourceActivityId: "source-123",
          compiledAt: new Date(),
          compilerVersion: "1.0.0",
          isPlaygroundGenerated: true,
          canRecompile: true,
        },
      };

      registerCompiledActivity(mockActivity);

      const stored = localStorage.getItem("compiled-activities");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed["test-activity"]).toBeDefined();
      expect(parsed["test-activity"].slug).toBe("test-activity");
      expect(parsed["test-activity"].title).toBe("Test Activity");
    });

    it("should throw error if slug conflicts with hardcoded activity", () => {
      const mockActivity: PlaybookDefinitionExtended = {
        slug: "snowball", // Conflicts with hardcoded activity
        title: "Test Snowball",
        phases: ["phase1"],
        start: vi.fn(),
        handleEvent: vi.fn(),
        Component: vi.fn() as any,
        HostControls: vi.fn() as any,
        metadata: {
          sourceActivityId: "source-123",
          compiledAt: new Date(),
          compilerVersion: "1.0.0",
          isPlaygroundGenerated: true,
          canRecompile: true,
        },
      };

      expect(() => registerCompiledActivity(mockActivity)).toThrow(
        'Activity slug "snowball" conflicts with an existing hardcoded activity'
      );
    });

    it("should overwrite existing compiled activity with same slug", () => {
      const activity1: PlaybookDefinitionExtended = {
        slug: "test-activity",
        title: "Version 1",
        phases: ["phase1"],
        start: vi.fn(),
        handleEvent: vi.fn(),
        Component: vi.fn() as any,
        HostControls: vi.fn() as any,
        metadata: {
          sourceActivityId: "source-123",
          compiledAt: new Date(),
          compilerVersion: "1.0.0",
          isPlaygroundGenerated: true,
          canRecompile: true,
        },
      };

      const activity2: PlaybookDefinitionExtended = {
        slug: "test-activity",
        title: "Version 2",
        phases: ["phase1", "phase2"],
        start: vi.fn(),
        handleEvent: vi.fn(),
        Component: vi.fn() as any,
        HostControls: vi.fn() as any,
        metadata: {
          sourceActivityId: "source-123",
          compiledAt: new Date(),
          compilerVersion: "1.0.0",
          isPlaygroundGenerated: true,
          canRecompile: true,
        },
      };

      registerCompiledActivity(activity1);
      registerCompiledActivity(activity2);

      const activities = getCompiledActivities();
      expect(activities["test-activity"].title).toBe("Version 2");
      expect(activities["test-activity"].phases).toHaveLength(2);
    });
  });

  describe("getCompiledActivities", () => {
    it("should return empty object when no compiled activities exist", () => {
      const activities = getCompiledActivities();
      expect(activities).toEqual({});
    });

    it("should return all compiled activities from localStorage", () => {
      const activity1: PlaybookDefinitionExtended = {
        slug: "activity-1",
        title: "Activity 1",
        phases: ["phase1"],
        start: vi.fn(),
        handleEvent: vi.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Component: vi.fn() as any,
        HostControls: vi.fn() as any,
        metadata: {
          sourceActivityId: "source-1",
          compiledAt: new Date(),
          compilerVersion: "1.0.0",
          isPlaygroundGenerated: true,
          canRecompile: true,
        },
      };

      const activity2: PlaybookDefinitionExtended = {
        slug: "activity-2",
        title: "Activity 2",
        phases: ["phase1"],
        start: vi.fn(),
        handleEvent: vi.fn(),
        Component: vi.fn() as any,
        HostControls: vi.fn() as any,
        metadata: {
          sourceActivityId: "source-2",
          compiledAt: new Date(),
          compilerVersion: "1.0.0",
          isPlaygroundGenerated: true,
          canRecompile: true,
        },
      };

      registerCompiledActivity(activity1);
      registerCompiledActivity(activity2);

      const activities = getCompiledActivities();
      expect(Object.keys(activities)).toHaveLength(2);
      expect(activities["activity-1"]).toBeDefined();
      expect(activities["activity-2"]).toBeDefined();
    });
  });

  describe("getAllActivities", () => {
    it("should return only hardcoded activities when no compiled activities exist", () => {
      const activities = getAllActivities();

      expect(activities.snowball).toBeDefined();
      expect(activities["pass-the-problem"]).toBeDefined();
      expect(Object.keys(activities).length).toBeGreaterThanOrEqual(2);
    });

    it("should merge hardcoded and compiled activities", () => {
      const compiledActivity: PlaybookDefinitionExtended = {
        slug: "compiled-test",
        title: "Compiled Test",
        phases: ["phase1"],
        start: vi.fn(),
        handleEvent: vi.fn(),
        Component: vi.fn() as any,
        HostControls: vi.fn() as any,
        metadata: {
          sourceActivityId: "source-123",
          compiledAt: new Date(),
          compilerVersion: "1.0.0",
          isPlaygroundGenerated: true,
          canRecompile: true,
        },
      };

      registerCompiledActivity(compiledActivity);

      const activities = getAllActivities();

      expect(activities.snowball).toBeDefined();
      expect(activities["pass-the-problem"]).toBeDefined();
      expect(activities["compiled-test"]).toBeDefined();
      expect(activities["compiled-test"].metadata?.isPlaygroundGenerated).toBe(
        true
      );
    });
  });

  describe("isCompiledActivity", () => {
    it("should return false for hardcoded activities", () => {
      expect(isCompiledActivity("snowball")).toBe(false);
      expect(isCompiledActivity("pass-the-problem")).toBe(false);
    });

    it("should return true for compiled activities", () => {
      const compiledActivity: PlaybookDefinitionExtended = {
        slug: "compiled-test",
        title: "Compiled Test",
        phases: ["phase1"],
        start: vi.fn(),
        handleEvent: vi.fn(),
        Component: vi.fn() as any,
        HostControls: vi.fn() as any,
        metadata: {
          sourceActivityId: "source-123",
          compiledAt: new Date(),
          compilerVersion: "1.0.0",
          isPlaygroundGenerated: true,
          canRecompile: true,
        },
      };

      registerCompiledActivity(compiledActivity);

      expect(isCompiledActivity("compiled-test")).toBe(true);
    });

    it("should return false for non-existent activities", () => {
      expect(isCompiledActivity("non-existent")).toBe(false);
    });
  });
});
