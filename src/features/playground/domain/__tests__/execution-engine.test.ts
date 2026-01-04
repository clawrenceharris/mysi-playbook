import { describe, it, expect, beforeEach, vi } from "vitest";
import { ExecutionEngine } from "../execution-engine";
import { ActivityRuntime } from "../activity-runtime";
import { BlockRegistry } from "../block-registry";
import {
  StrategyBlock,
  Connection,
  ExecutionContext,
  ExecutionResult,
  BlockDefinition,
} from "../playground.types";

describe("ExecutionEngine", () => {
  let engine: ExecutionEngine;
  let mockRegistry: BlockRegistry;
  let mockRuntime: ActivityRuntime;
  let mockBlocks: StrategyBlock[];
  let mockConnections: Connection[];

  beforeEach(() => {
    mockBlocks = [
      {
        id: "block-1",
        type: "display-prompt",
        position: { x: 0, y: 0 },
        config: { title: "Welcome", content: "Welcome to the activity" },
        connections: { inputs: [], outputs: [] },
      },
    ];

    mockConnections = [];

    mockRuntime = new ActivityRuntime(
      "activity-1",
      mockBlocks,
      mockConnections
    );
    mockRegistry = new BlockRegistry();
    engine = new ExecutionEngine(mockRegistry);
  });

  describe("initialization", () => {
    it("should initialize with block registry", () => {
      expect(engine).toBeInstanceOf(ExecutionEngine);
    });
  });

  describe("block execution", () => {
    it("should execute a block successfully", async () => {
      const mockBlockDefinition: BlockDefinition = {
        type: "display-prompt",
        title: "Display Prompt",
        description: "Shows a prompt to participants",
        icon: vi.fn() as any,
        category: "display",
        configSchema: {},
        execute: vi.fn().mockResolvedValue({
          success: true,
          nextBlockId: "block-2",
        }),
        renderParticipant: vi.fn() as any,
        renderHost: vi.fn() as any,
      };

      mockRegistry.register(mockBlockDefinition);

      const context: ExecutionContext = {
        block: mockBlocks[0],
        runtime: mockRuntime,
        isHost: false,
        userId: "user-1",
      };

      const result = await engine.executeBlock(context);

      expect(result.success).toBe(true);
      expect(result.nextBlockId).toBe("block-2");
      expect(mockBlockDefinition.execute).toHaveBeenCalledWith(context);
    });

    it("should handle unknown block type", async () => {
      const context: ExecutionContext = {
        block: mockBlocks[0],
        runtime: mockRuntime,
        isHost: false,
        userId: "user-1",
      };

      const result = await engine.executeBlock(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown block type");
    });

    it("should handle block execution errors", async () => {
      const mockBlockDefinition: BlockDefinition = {
        type: "display-prompt",
        title: "Display Prompt",
        description: "Shows a prompt to participants",
        icon: vi.fn() as any,
        category: "display",
        configSchema: {},
        execute: vi.fn().mockRejectedValue(new Error("Execution failed")),
        renderParticipant: vi.fn() as any,
        renderHost: vi.fn() as any,
      };

      mockRegistry.register(mockBlockDefinition);

      const context: ExecutionContext = {
        block: mockBlocks[0],
        runtime: mockRuntime,
        isHost: false,
        userId: "user-1",
      };

      const result = await engine.executeBlock(context);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Execution failed");
    });
  });

  describe("activity coordination", () => {
    it("should start activity execution", async () => {
      mockRuntime.start();

      const result = await engine.startActivity(mockRuntime);

      expect(result.success).toBe(true);
      expect(mockRuntime.getState().status).toBe("running");
    });

    it("should advance to next block after successful execution", async () => {
      const mockBlockDefinition: BlockDefinition = {
        type: "display-prompt",
        title: "Display Prompt",
        description: "Shows a prompt to participants",
        icon: vi.fn() as any,
        category: "display",
        configSchema: {},
        execute: vi.fn().mockResolvedValue({
          success: true,
          nextBlockId: "block-2",
        }),
        renderParticipant: vi.fn() as any,
        renderHost: vi.fn() as any,
      };

      mockRegistry.register(mockBlockDefinition);
      mockRuntime.start();

      const context: ExecutionContext = {
        block: mockBlocks[0],
        runtime: mockRuntime,
        isHost: false,
        userId: "user-1",
      };

      const result = await engine.executeBlockAndAdvance(context);

      expect(result.success).toBe(true);
    });

    it("should handle participant responses", async () => {
      mockRuntime.start();
      mockRuntime.addParticipant("user-1");

      const response = { answer: "Hello World" };

      await engine.handleParticipantResponse(
        mockRuntime,
        "user-1",
        "block-1",
        response
      );

      const participant = mockRuntime.getParticipantState("user-1");
      expect(participant?.responses["block-1"]).toEqual(response);
    });
  });

  describe("state synchronization", () => {
    it("should sync participant state", async () => {
      mockRuntime.start();
      mockRuntime.addParticipant("user-1");

      const updates = { currentBlockId: "block-2" };

      await engine.syncParticipantState(mockRuntime, "user-1", updates);

      const participant = mockRuntime.getParticipantState("user-1");
      expect(participant?.currentBlockId).toBe("block-2");
    });

    it("should get execution statistics", () => {
      mockRuntime.start();
      mockRuntime.addParticipant("user-1");
      mockRuntime.addParticipant("user-2");
      mockRuntime.markBlockCompleted("user-1", "block-1");

      const stats = engine.getExecutionStats(mockRuntime);

      expect(stats.totalParticipants).toBe(2);
      expect(stats.completedParticipants).toBe(1);
      expect(stats.completionRate).toBe(50);
    });
  });
});
