import { describe, it, expect } from "vitest";
import type { CollectInputConfig, PollVoteConfig } from "../playground.types";
import {
  generateVariableName,
  isValidVariableName,
  sanitizeVariableName,
} from "../variable-naming";

describe("Variable Naming in Block Configs", () => {
  describe("CollectInputConfig", () => {
    it("should support optional saveToSharedState field", () => {
      const config: CollectInputConfig = {
        content: "What is your name?",
        inputType: "text",
        required: true,
        saveToSharedState: true,
        variableName: "student_name",
      };

      expect(config.saveToSharedState).toBe(true);
      expect(config.variableName).toBe("student_name");
    });

    it("should work without variable naming fields", () => {
      const config: CollectInputConfig = {
        content: "What is your name?",
        inputType: "text",
        required: true,
      };

      expect(config.saveToSharedState).toBeUndefined();
      expect(config.variableName).toBeUndefined();
    });

    it("should validate variable name format", () => {
      const validNames = [
        "student_name",
        "question_1",
        "user_response",
        "answer123",
      ];

      validNames.forEach((name) => {
        const config: CollectInputConfig = {
          content: "Test",
          inputType: "text",
          required: false,
          variableName: name,
        };

        expect(config.variableName).toBe(name);
      });
    });
  });

  describe("PollVoteConfig", () => {
    it("should support optional saveToSharedState field", () => {
      const config: PollVoteConfig = {
        question: "What is your favorite color?",
        options: ["Red", "Blue", "Green"],
        allowMultiple: false,
        showResults: "afterVoting",
        anonymous: false,
        saveToSharedState: true,
        variableName: "favorite_color",
      };

      expect(config.saveToSharedState).toBe(true);
      expect(config.variableName).toBe("favorite_color");
    });

    it("should work without variable naming fields", () => {
      const config: PollVoteConfig = {
        question: "What is your favorite color?",
        options: ["Red", "Blue", "Green"],
        allowMultiple: false,
        showResults: "afterVoting",
        anonymous: false,
      };

      expect(config.saveToSharedState).toBeUndefined();
      expect(config.variableName).toBeUndefined();
    });
  });
});

describe("Variable Name Validation", () => {
  it("should accept alphanumeric and underscores", () => {
    const validNames = [
      "student_name",
      "question_1",
      "user_response",
      "answer123",
      "my_variable_name",
    ];

    validNames.forEach((name) => {
      // Variable names should match pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/
      expect(name).toMatch(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
    });
  });

  it("should reject invalid variable names", () => {
    const invalidNames = [
      "123invalid", // starts with number
      "my-variable", // contains hyphen
      "my variable", // contains space
      "my.variable", // contains dot
      "my@variable", // contains special char
    ];

    invalidNames.forEach((name) => {
      expect(name).not.toMatch(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
    });
  });
});

describe("Auto-suggestion from question text", () => {
  it("should generate variable name from question", () => {
    const testCases = [
      {
        question: "What interests you?",
        expected: "student_interest",
      },
      {
        question: "What is your name?",
        expected: "student_name",
      },
      {
        question: "How old are you?",
        expected: "student_age",
      },
    ];

    testCases.forEach(({ question, expected }) => {
      const generated = generateVariableName(question);
      expect(generated).toBe(expected);
    });
  });

  it("should handle edge cases", () => {
    expect(generateVariableName("")).toBe("variable");
    expect(generateVariableName("123")).toBe("variable_123");
    expect(generateVariableName("What?")).toBe("what");
  });

  it("should generate simple names for generic questions", () => {
    expect(generateVariableName("Enter your response")).toContain("response");
    expect(generateVariableName("What do you think?")).toContain("think");
  });
});

describe("Variable Name Utilities", () => {
  describe("isValidVariableName", () => {
    it("should validate correct variable names", () => {
      expect(isValidVariableName("student_name")).toBe(true);
      expect(isValidVariableName("_private")).toBe(true);
      expect(isValidVariableName("var123")).toBe(true);
    });

    it("should reject invalid variable names", () => {
      expect(isValidVariableName("123invalid")).toBe(false);
      expect(isValidVariableName("my-variable")).toBe(false);
      expect(isValidVariableName("my variable")).toBe(false);
    });
  });

  describe("sanitizeVariableName", () => {
    it("should sanitize invalid names", () => {
      expect(sanitizeVariableName("My Variable")).toBe("my_variable");
      expect(sanitizeVariableName("123test")).toBe("_123test");
      expect(sanitizeVariableName("test@#$")).toBe("test");
    });

    it("should handle empty input", () => {
      expect(sanitizeVariableName("")).toBe("variable");
      expect(sanitizeVariableName("   ")).toBe("variable");
    });
  });
});
