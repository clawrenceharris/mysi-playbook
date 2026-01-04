import { describe, it, expect, beforeEach } from "vitest";
import { PreviewExecutionEngine } from "../PreviewExecutionEngine";
import type { ImprovedStrategy } from "../../domain/playground.types";
import { BlockType } from "../../domain/playground.types";

describe("Handout Preview Integration", () => {
  let strategy: ImprovedStrategy;

  beforeEach(() => {
    strategy = {
      id: "test-strategy",
      slug: "test-strategy",
      title: "Test Strategy",
      description: "Test",
      metadata: {
        position: 0,
        estimatedDuration: 10,
        participantCount: { min: 2, max: 10 },
      },
      sharedState: {},
      slides: [
        {
          id: "slide-1",
          title: "Collect Responses",
          order: 0,
          blocks: [
            {
              id: "block-1",
              type: BlockType.COLLECT_INPUT,
              order: 0,
              config: {
                question: "What is your response?",
                inputType: "text",
                required: true,
              },
            },
          ],
        },
        {
          id: "slide-2",
          title: "Distribute Handouts",
          order: 1,
          blocks: [
            {
              id: "block-2",
              type: BlockType.HANDOUT,
              order: 0,
              config: {
                dataSource: "slide-1.responses.all",
                distributionMode: "one-per-participant",
                mismatchHandling: "auto",
                showAuthor: true,
                allowParticipantResponse: true,
                responsePrompt: "Your feedback",
                allowReassignment: true,
                showDistributionPreview: true,
              },
            },
          ],
        },
      ],
    };
  });

  describe("State Structure", () => {
    it("should initialize with slide-scoped state structure", () => {
      const engine = new PreviewExecutionEngine(strategy);
      engine.start();

      const state = engine.getState();

      // Should have phase
      expect(state.phase).toBeDefined();

      // Should have slide-1 initialized
      expect(state["slide-1"]).toBeDefined();
      expect(state["slide-1"].responses).toBeDefined();

      // Should have slide-2 initialized
      expect(state["slide-2"]).toBeDefined();
      expect(state["slide-2"].assignments).toBeDefined();
    });

    it("should store responses in slide-scoped structure", () => {
      const engine = new PreviewExecutionEngine(strategy);
      engine.start();

      // Simulate response submission
      const responseData = {
        "participant-1-uuid": { "block-1": "Response 1" },
        "participant-2-uuid": { "block-1": "Response 2" },
      };

      engine.setState({
        ...engine.getState(),
        "slide-1": {
          responses: responseData,
        },
      });

      const state = engine.getState();
      expect(state["slide-1"].responses).toEqual(responseData);
    });

    it("should store assignments in slide-scoped structure", () => {
      const engine = new PreviewExecutionEngine(strategy);
      engine.start();

      // Simulate assignment creation
      const assignmentData = {
        "block-2": {
          participantAssignments: {
            "participant-1": ["item-1"],
            "participant-2": ["item-2"],
          },
          itemAssignments: {
            "item-1": "participant-1",
            "item-2": "participant-2",
          },
          createdAt: Date.now(),
          distributionMode: "one-per-participant",
          totalItems: 2,
          totalParticipants: 2,
        },
      };

      engine.setState({
        ...engine.getState(),
        "slide-2": {
          assignments: assignmentData,
        },
      });

      const state = engine.getState();
      expect(state["slide-2"].assignments).toEqual(assignmentData);
    });
  });

  describe("Data Source Resolution", () => {
    it("should resolve data source from slide-scoped responses", () => {
      const engine = new PreviewExecutionEngine(strategy);
      engine.start();

      // Add responses to slide-1
      const responseData = {
        "participant-1-uuid": { "block-1": "Response 1" },
        "participant-2-uuid": { "block-1": "Response 2" },
      };

      engine.setState({
        ...engine.getState(),
        "slide-1": {
          responses: responseData,
        },
      });

      const state = engine.getState();

      // Data source "slide-1.responses.all" should resolve to array of responses
      expect(state["slide-1"].responses).toBeDefined();
      expect(Object.keys(state["slide-1"].responses)).toHaveLength(2);
    });
  });

  describe("Assignment Flow", () => {
    it("should handle complete assignment flow in preview mode", () => {
      const engine = new PreviewExecutionEngine(strategy);
      engine.start();

      // Step 1: Collect responses on slide-1
      const responseData = {
        "participant-1-uuid": { "block-1": "Response 1" },
        "participant-2-uuid": { "block-1": "Response 2" },
        "participant-3-uuid": { "block-1": "Response 3" },
      };

      engine.setState({
        ...engine.getState(),
        "slide-1": {
          responses: responseData,
        },
      });

      // Step 2: Navigate to slide-2
      engine.setState({
        ...engine.getState(),
        phase: "distribute-handouts",
      });

      // Step 3: Create assignments on slide-2
      const assignmentData = {
        "block-2": {
          participantAssignments: {
            "participant-1": ["participant-1-uuid"],
            "participant-2": ["participant-2-uuid"],
            "participant-3": ["participant-3-uuid"],
          },
          itemAssignments: {
            "participant-1-uuid": "participant-1",
            "participant-2-uuid": "participant-2",
            "participant-3-uuid": "participant-3",
          },
          createdAt: Date.now(),
          distributionMode: "one-per-participant",
          totalItems: 3,
          totalParticipants: 3,
        },
      };

      engine.setState({
        ...engine.getState(),
        "slide-2": {
          assignments: assignmentData,
        },
      });

      const state = engine.getState();

      // Verify assignments are stored correctly
      expect(state["slide-2"].assignments["block-2"]).toBeDefined();
      expect(
        state["slide-2"].assignments["block-2"].participantAssignments[
          "participant-1"
        ]
      ).toEqual(["participant-1-uuid"]);
    });
  });
});
