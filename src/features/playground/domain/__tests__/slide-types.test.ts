import { describe, it, expect } from "vitest";
import {
  SlideType,
  StrategySlide,
  ImprovedStrategy,
  StrategyBlock,
} from "../playground.types";

describe("Slide Types", () => {
  describe("SlideType enum", () => {
    it("should have all required slide types", () => {
      expect(SlideType.CONTENT).toBe("content");
      expect(SlideType.INTERACTION).toBe("interaction");
      expect(SlideType.POLL).toBe("poll");
      expect(SlideType.TIMER).toBe("timer");
      expect(SlideType.MIXED).toBe("mixed");
    });
  });

  describe("StrategySlide interface", () => {
    it("should create a valid strategy slide", () => {
      const slide: StrategySlide = {
        id: "slide-1",
        title: "Welcome Slide",
        type: SlideType.CONTENT,
        blocks: [],
        order: 0,
        transitions: {
          type: "manual",
        },
        timing: {
          estimatedDuration: 300,
          showTimer: false,
        },
      };

      expect(slide.id).toBe("slide-1");
      expect(slide.title).toBe("Welcome Slide");
      expect(slide.type).toBe(SlideType.CONTENT);
      expect(slide.blocks).toEqual([]);
      expect(slide.order).toBe(0);
    });

    it("should support optional properties", () => {
      const slide: StrategySlide = {
        id: "slide-2",
        title: "Question Slide",
        type: SlideType.INTERACTION,
        blocks: [],
        order: 1,
        transitions: {
          type: "auto",
          delay: 5000,
        },
        timing: {
          estimatedDuration: 180,
          maxDuration: 300,
          showTimer: true,
        },
        thumbnail: "data:image/png;base64,abc123",
      };

      expect(slide.thumbnail).toBe("data:image/png;base64,abc123");
      expect(slide.transitions.delay).toBe(5000);
      expect(slide.timing.maxDuration).toBe(300);
    });
  });

  describe("ImprovedStrategy interface", () => {
    it("should create a valid improved strategy", () => {
      const strategy: ImprovedStrategy = {
        id: "strategy-1",
        title: "Test Strategy",
        slides: [],
        settings: {
          allowParticipantNavigation: false,
          showProgress: true,
          autoSave: true,
        },
        metadata: {
          participantCount: 25,
          position: 0,
        },
      };

      expect(strategy.id).toBe("strategy-1");
      expect(strategy.title).toBe("Test Strategy");
      expect(strategy.slides).toEqual([]);
      expect(strategy.settings.allowParticipantNavigation).toBe(false);
    });
  });

  describe("StrategyBlock without position", () => {
    it("should create blocks without position requirements", () => {
      const block: StrategyBlock = {
        id: "block-1",
        type: "display-prompt",
        order: 0,
        config: {
          title: "Welcome",
          content: "Welcome to the session",
          requireAcknowledgment: false,
        },
      };

      expect(block.id).toBe("block-1");
      expect(block.type).toBe("display-prompt");
      expect(block.order).toBe(0);
      expect("position" in block).toBe(false);
    });
  });
});
