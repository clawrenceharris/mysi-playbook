import { describe, it, expect } from "vitest";
import { extractAvailableVariables } from "../variable-extraction";
import type { StrategySlide, StrategyBlock } from "../playground.types";
import { SlideType } from "../playground.types";

describe("extractAvailableVariables", () => {
  it("should extract variables from collect-input blocks", () => {
    const slides: StrategySlide[] = [
      {
        id: "slide-1",
        title: "Collect Name",
        type: SlideType.INTERACTION,
        blocks: [
          {
            id: "block-1",
            type: "collect-input",
            config: {
              question: "What is your name?",
              inputType: "text",
              required: true,
              saveToSharedState: true,
              variableName: "student_name",
            },
            order: 0,
          } as StrategyBlock,
        ],
        order: 0,
        transitions: { type: "manual" },
        timing: { estimatedDuration: 300, showTimer: false },
      },
    ];

    const variables = extractAvailableVariables(slides);

    expect(variables).toHaveLength(1);
    expect(variables[0]).toEqual({
      name: "student_name",
      type: "text",
      sourceSlideId: "slide-1",
      sourceSlideTitle: "Collect Name",
      sourceBlockId: "block-1",
    });
  });

  it("should extract variables from poll-vote blocks", () => {
    const slides: StrategySlide[] = [
      {
        id: "slide-1",
        title: "Vote on Color",
        type: SlideType.INTERACTION,
        blocks: [
          {
            id: "block-1",
            type: "poll-vote",
            config: {
              question: "What is your favorite color?",
              options: ["Red", "Blue", "Green"],
              allowMultiple: false,
              showResults: "afterVoting",
              anonymous: true,
              saveToSharedState: true,
              variableName: "favorite_color",
            },
            order: 0,
          } as StrategyBlock,
        ],
        order: 0,
        transitions: { type: "manual" },
        timing: { estimatedDuration: 300, showTimer: false },
      },
    ];

    const variables = extractAvailableVariables(slides);

    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe("favorite_color");
    expect(variables[0].type).toBe("multiple_choice");
  });

  it("should return empty array when no variables are defined", () => {
    const slides: StrategySlide[] = [
      {
        id: "slide-1",
        title: "Display Only",
        type: SlideType.CONTENT,
        blocks: [
          {
            id: "block-1",
            type: "display-prompt",
            config: {
              title: "Welcome",
              content: "Hello everyone",
              requireAcknowledgment: false,
            },
            order: 0,
          } as StrategyBlock,
        ],
        order: 0,
        transitions: { type: "manual" },
        timing: { estimatedDuration: 300, showTimer: false },
      },
    ];

    const variables = extractAvailableVariables(slides);

    expect(variables).toHaveLength(0);
  });

  it("should extract multiple variables from multiple slides", () => {
    const slides: StrategySlide[] = [
      {
        id: "slide-1",
        title: "Collect Name",
        type: SlideType.INTERACTION,
        blocks: [
          {
            id: "block-1",
            type: "collect-input",
            config: {
              question: "What is your name?",
              inputType: "text",
              required: true,
              saveToSharedState: true,
              variableName: "student_name",
            },
            order: 0,
          } as StrategyBlock,
        ],
        order: 0,
        transitions: { type: "manual" },
        timing: { estimatedDuration: 300, showTimer: false },
      },
      {
        id: "slide-2",
        title: "Vote on Color",
        type: SlideType.INTERACTION,
        blocks: [
          {
            id: "block-2",
            type: "poll-vote",
            config: {
              question: "What is your favorite color?",
              options: ["Red", "Blue", "Green"],
              allowMultiple: false,
              showResults: "afterVoting",
              anonymous: true,
              saveToSharedState: true,
              variableName: "favorite_color",
            },
            order: 0,
          } as StrategyBlock,
        ],
        order: 1,
        transitions: { type: "manual" },
        timing: { estimatedDuration: 300, showTimer: false },
      },
    ];

    const variables = extractAvailableVariables(slides);

    expect(variables).toHaveLength(2);
    expect(variables[0].name).toBe("student_name");
    expect(variables[1].name).toBe("favorite_color");
  });

  it("should skip blocks without saveToSharedState enabled", () => {
    const slides: StrategySlide[] = [
      {
        id: "slide-1",
        title: "Collect Name",
        type: SlideType.INTERACTION,
        blocks: [
          {
            id: "block-1",
            type: "collect-input",
            config: {
              question: "What is your name?",
              inputType: "text",
              required: true,
              saveToSharedState: false,
            },
            order: 0,
          } as StrategyBlock,
        ],
        order: 0,
        transitions: { type: "manual" },
        timing: { estimatedDuration: 300, showTimer: false },
      },
    ];

    const variables = extractAvailableVariables(slides);

    expect(variables).toHaveLength(0);
  });
});
