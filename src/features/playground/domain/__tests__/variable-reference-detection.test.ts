import { describe, it, expect } from "vitest";
import {
  detectVariableTrigger,
  extractVariableReferences,
  insertVariableReference,
  validateVariableReferences,
  type VariableReferenceWarning,
} from "../variable-reference-detection";

describe("Variable Reference Detection - {{ Trigger", () => {
  describe("detectVariableTrigger", () => {
    it("should detect {{ at cursor position", () => {
      const text = "Hello {{";
      const cursorPosition = 8; // After {{
      const result = detectVariableTrigger(text, cursorPosition);
      expect(result).toBe(6); // Position of {{
    });

    it("should detect {{ with partial variable name", () => {
      const text = "Hello {{stud";
      const cursorPosition = 12; // After 'stud'
      const result = detectVariableTrigger(text, cursorPosition);
      expect(result).toBe(6); // Position of {{
    });

    it("should not detect {{ if }} is already closed", () => {
      const text = "Hello {{student_name}}";
      const cursorPosition = 22; // After }}
      const result = detectVariableTrigger(text, cursorPosition);
      expect(result).toBe(-1);
    });

    it("should not detect {{ if cursor is before it", () => {
      const text = "Hello {{student";
      const cursorPosition = 3; // In 'Hello'
      const result = detectVariableTrigger(text, cursorPosition);
      expect(result).toBe(-1);
    });

    it("should detect most recent {{ if multiple exist", () => {
      const text = "{{name}} and {{";
      const cursorPosition = 15; // After second {{
      const result = detectVariableTrigger(text, cursorPosition);
      expect(result).toBe(13); // Position of second {{
    });

    it("should handle empty text", () => {
      const text = "";
      const cursorPosition = 0;
      const result = detectVariableTrigger(text, cursorPosition);
      expect(result).toBe(-1);
    });
  });

  describe("extractVariableReferences", () => {
    it("should extract single variable reference", () => {
      const text = "Hello {{student_name}}!";
      const result = extractVariableReferences(text);
      expect(result).toEqual(["student_name"]);
    });

    it("should extract multiple variable references", () => {
      const text = "{{name}} is {{age}} years old and likes {{color}}";
      const result = extractVariableReferences(text);
      expect(result).toEqual(["name", "age", "color"]);
    });

    it("should return empty array if no variables", () => {
      const text = "Hello world!";
      const result = extractVariableReferences(text);
      expect(result).toEqual([]);
    });

    it("should not extract invalid variable names", () => {
      const text = "{{123invalid}} {{my-var}} {{valid_var}}";
      const result = extractVariableReferences(text);
      expect(result).toEqual(["valid_var"]);
    });

    it("should handle incomplete variable syntax", () => {
      const text = "{{incomplete";
      const result = extractVariableReferences(text);
      expect(result).toEqual([]);
    });

    it("should handle nested braces", () => {
      const text = "{{var1}} and {{var2}}";
      const result = extractVariableReferences(text);
      expect(result).toEqual(["var1", "var2"]);
    });
  });

  describe("insertVariableReference", () => {
    it("should insert variable when {{ is already typed", () => {
      const text = "Hello {{";
      const cursorPosition = 8;
      const result = insertVariableReference(
        text,
        cursorPosition,
        "student_name"
      );

      expect(result.newText).toBe("Hello {{student_name}}");
      expect(result.newCursorPosition).toBe(22); // After }}
    });

    it("should insert variable with partial name typed", () => {
      const text = "Hello {{stud";
      const cursorPosition = 12;
      const result = insertVariableReference(
        text,
        cursorPosition,
        "student_name"
      );

      expect(result.newText).toBe("Hello {{student_name}}");
      expect(result.newCursorPosition).toBe(22);
    });

    it("should insert variable without {{ trigger", () => {
      const text = "Hello ";
      const cursorPosition = 6;
      const result = insertVariableReference(
        text,
        cursorPosition,
        "student_name"
      );

      expect(result.newText).toBe("Hello {{student_name}}");
      expect(result.newCursorPosition).toBe(22); // 6 + 12 (student_name) + 4 ({{ }})
    });

    it("should insert variable in middle of text", () => {
      const text = "Hello  world";
      const cursorPosition = 6;
      const result = insertVariableReference(text, cursorPosition, "name");

      expect(result.newText).toBe("Hello {{name}} world");
      expect(result.newCursorPosition).toBe(14);
    });

    it("should handle insertion at start of text", () => {
      const text = "";
      const cursorPosition = 0;
      const result = insertVariableReference(text, cursorPosition, "var");

      expect(result.newText).toBe("{{var}}");
      expect(result.newCursorPosition).toBe(7);
    });
  });

  describe("validateVariableReferences", () => {
    it("should warn about undefined variables", () => {
      const text = "Hello {{undefined_var}}!";
      const availableVariables = ["student_name", "age"];
      const warnings = validateVariableReferences(
        text,
        availableVariables,
        2,
        new Map()
      );

      expect(warnings).toHaveLength(1);
      expect(warnings[0].variableName).toBe("undefined_var");
      expect(warnings[0].type).toBe("undefined");
      expect(warnings[0].message).toContain("not defined");
    });

    it("should warn about forward references", () => {
      const text = "Hello {{future_var}}!";
      const availableVariables = ["future_var"];
      const variableSlideIndices = new Map([["future_var", 3]]);
      const warnings = validateVariableReferences(
        text,
        availableVariables,
        2, // Current slide is 2, variable is in slide 3
        variableSlideIndices
      );

      expect(warnings).toHaveLength(1);
      expect(warnings[0].variableName).toBe("future_var");
      expect(warnings[0].type).toBe("forward_reference");
      expect(warnings[0].message).toContain("later slide");
    });

    it("should not warn about valid references", () => {
      const text = "Hello {{student_name}} and {{age}}!";
      const availableVariables = ["student_name", "age"];
      const variableSlideIndices = new Map([
        ["student_name", 0],
        ["age", 1],
      ]);
      const warnings = validateVariableReferences(
        text,
        availableVariables,
        2, // Current slide is 2, both variables are from earlier slides
        variableSlideIndices
      );

      expect(warnings).toHaveLength(0);
    });

    it("should handle multiple warnings", () => {
      const text = "{{undefined}} and {{future}} and {{valid}}";
      const availableVariables = ["future", "valid"];
      const variableSlideIndices = new Map([
        ["future", 5],
        ["valid", 1],
      ]);
      const warnings = validateVariableReferences(
        text,
        availableVariables,
        2,
        variableSlideIndices
      );

      expect(warnings).toHaveLength(2);
      expect(warnings[0].variableName).toBe("undefined");
      expect(warnings[0].type).toBe("undefined");
      expect(warnings[1].variableName).toBe("future");
      expect(warnings[1].type).toBe("forward_reference");
    });

    it("should handle text with no variable references", () => {
      const text = "Hello world!";
      const warnings = validateVariableReferences(text, [], 0, new Map());

      expect(warnings).toHaveLength(0);
    });
  });
});
