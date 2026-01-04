/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BlockRenderer } from "../BlockRenderer";
import { BlockType } from "../../domain/playground.types";
import type { StrategyBlock } from "../../domain/playground.types";
import type { PlayfieldContext } from "@/types/playbook";

describe("BlockRenderer - handleSubmit storage logic", () => {
  let mockCall: any;
  let mockSetState: any;
  let mockState: any;
  let mockCtx: Partial<PlayfieldContext>;

  beforeEach(() => {
    mockCall = {
      sendCustomEvent: vi.fn(),
    };

    mockSetState = vi.fn();

    mockState = {
      phase: "initial",
      responses: {},
    };

    mockCtx = {
      call: mockCall,
      state: mockState,
      setState: mockSetState,
      userId: "user-123",
      isHost: false,
    };
  });

  describe("when saveToSharedState is true and variableName exists", () => {
    it("should store response in custom variable at root level", () => {
      const block: StrategyBlock = {
        id: "block-1",
        type: BlockType.COLLECT_INPUT,
        order: 1,
        config: {
          question: "What is your idea?",
          inputType: "text",
          required: true,
          saveToSharedState: true,
          variableName: "studentIdeas",
        },
      };

      render(<BlockRenderer block={block} ctx={mockCtx} />);

      const input = screen.getByLabelText(/your response/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "My great idea" } });
      fireEvent.click(submitButton);

      const setStateCall = mockSetState.mock.calls[0][0];
      expect(setStateCall.studentIdeas).toBeDefined();

      // Check that the key starts with userId and contains a UUID
      const keys = Object.keys(setStateCall.studentIdeas);
      expect(keys.length).toBe(1);
      expect(keys[0]).toMatch(/^user-123-[a-f0-9-]+$/);
      expect(setStateCall.studentIdeas[keys[0]]).toBe("My great idea");
    });

    it("should not store in default responses structure", () => {
      const block: StrategyBlock = {
        id: "block-1",
        type: BlockType.COLLECT_INPUT,
        order: 1,
        config: {
          question: "What is your idea?",
          inputType: "text",
          required: true,
          saveToSharedState: true,
          variableName: "studentIdeas",
        },
      };

      render(<BlockRenderer block={block} ctx={mockCtx} />);

      const input = screen.getByLabelText(/your response/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "My great idea" } });
      fireEvent.click(submitButton);

      const setStateCall = mockSetState.mock.calls[0][0];
      // Should not have responses in the nested structure
      expect(setStateCall.responses["block-1"]).toBeUndefined();
    });
  });

  describe("when saveToSharedState is false", () => {
    it("should store response in default responses[blockId] structure", () => {
      const block: StrategyBlock = {
        id: "block-1",
        type: BlockType.COLLECT_INPUT,
        order: 1,
        config: {
          question: "What is your idea?",
          inputType: "text",
          required: true,
          saveToSharedState: false,
        },
      };

      render(<BlockRenderer block={block} ctx={mockCtx} />);

      const input = screen.getByLabelText(/your response/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "My response" } });
      fireEvent.click(submitButton);

      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({
          responses: expect.objectContaining({
            "block-1": expect.any(Object),
          }),
        })
      );
    });

    it("should not store in custom variable", () => {
      const block: StrategyBlock = {
        id: "block-1",
        type: BlockType.COLLECT_INPUT,
        order: 1,
        config: {
          question: "What is your idea?",
          inputType: "text",
          required: true,
          saveToSharedState: false,
          variableName: "studentIdeas", // Should be ignored
        },
      };

      render(<BlockRenderer block={block} ctx={mockCtx} />);

      const input = screen.getByLabelText(/your response/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "My response" } });
      fireEvent.click(submitButton);

      const setStateCall = mockSetState.mock.calls[0][0];
      expect(setStateCall.studentIdeas).toBeUndefined();
    });
  });

  describe("when saveToSharedState is true but variableName is missing", () => {
    it("should log error and fall back to default responses structure", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const block: StrategyBlock = {
        id: "block-1",
        type: BlockType.COLLECT_INPUT,
        order: 1,
        config: {
          question: "What is your idea?",
          inputType: "text",
          required: true,
          saveToSharedState: true,
          // variableName is missing
        },
      };

      render(<BlockRenderer block={block} ctx={mockCtx} />);

      const input = screen.getByLabelText(/your response/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "My response" } });
      fireEvent.click(submitButton);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          /saveToSharedState.*variableName|variableName.*saveToSharedState/
        )
      );

      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({
          responses: expect.objectContaining({
            "block-1": expect.any(Object),
          }),
        })
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("when saveToSharedState is undefined", () => {
    it("should store in default responses structure", () => {
      const block: StrategyBlock = {
        id: "block-1",
        type: BlockType.COLLECT_INPUT,
        order: 1,
        config: {
          question: "What is your idea?",
          inputType: "text",
          required: true,
          // saveToSharedState is undefined
        },
      };

      render(<BlockRenderer block={block} ctx={mockCtx} />);

      const input = screen.getByLabelText(/your response/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "My response" } });
      fireEvent.click(submitButton);

      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({
          responses: expect.objectContaining({
            "block-1": expect.any(Object),
          }),
        })
      );
    });
  });

  describe("custom event sending", () => {
    it("should send custom event regardless of storage method", () => {
      const block: StrategyBlock = {
        id: "block-1",
        type: BlockType.COLLECT_INPUT,
        order: 1,
        config: {
          question: "What is your idea?",
          inputType: "text",
          required: true,
          saveToSharedState: true,
          variableName: "studentIdeas",
        },
      };

      render(<BlockRenderer block={block} ctx={mockCtx} />);

      const input = screen.getByLabelText(/your response/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "My idea" } });
      fireEvent.click(submitButton);

      expect(mockCall.sendCustomEvent).toHaveBeenCalledWith({
        type: "test-activity:submit-block-1",
        userId: "user-123",
        response: "My idea",
      });
    });
  });
});
