/**
 * Variable Reference Detection Utilities
 * Handles {{ trigger detection, variable extraction, and validation
 */

/**
 * Detects {{ trigger in text at cursor position
 * Returns the position where {{ was detected, or -1 if not found
 */
export function detectVariableTrigger(
  text: string,
  cursorPosition: number
): number {
  // Look for {{ before cursor position
  const beforeCursor = text.substring(0, cursorPosition);
  const lastOpenBrace = beforeCursor.lastIndexOf("{{");

  // Check if we have an unclosed {{
  if (lastOpenBrace !== -1) {
    const afterBrace = text.substring(lastOpenBrace + 2, cursorPosition);
    // If there's no closing }} between {{ and cursor, trigger is active
    if (!afterBrace.includes("}}")) {
      return lastOpenBrace;
    }
  }

  return -1;
}

/**
 * Extracts variable references from text
 * Returns array of variable names found in {{variable}} syntax
 */
export function extractVariableReferences(text: string): string[] {
  const regex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

/**
 * Inserts a variable reference at cursor position
 * Handles the case where {{ is already typed
 */
export function insertVariableReference(
  text: string,
  cursorPosition: number,
  variableName: string
): { newText: string; newCursorPosition: number } {
  const triggerPos = detectVariableTrigger(text, cursorPosition);

  if (triggerPos !== -1) {
    // Replace {{ with {{variableName}}
    const before = text.substring(0, triggerPos);
    const after = text.substring(cursorPosition);
    const newText = `${before}{{${variableName}}}${after}`;
    const newCursorPosition = triggerPos + variableName.length + 4; // {{var}}

    return { newText, newCursorPosition };
  } else {
    // Insert {{variableName}} at cursor
    const before = text.substring(0, cursorPosition);
    const after = text.substring(cursorPosition);
    const newText = `${before}{{${variableName}}}${after}`;
    const newCursorPosition = cursorPosition + variableName.length + 4;

    return { newText, newCursorPosition };
  }
}

/**
 * Variable reference warning types
 */
export interface VariableReferenceWarning {
  variableName: string;
  position: number;
  type: "undefined" | "forward_reference";
  message: string;
}

/**
 * Validates variable references in text against available variables
 * Returns warnings for undefined or forward references
 */
export function validateVariableReferences(
  text: string,
  availableVariables: string[],
  currentSlideIndex: number,
  variableSlideIndices: Map<string, number>
): VariableReferenceWarning[] {
  const warnings: VariableReferenceWarning[] = [];
  const regex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const variableName = match[1];
    const position = match.index;

    // Check if variable is defined
    if (!availableVariables.includes(variableName)) {
      warnings.push({
        variableName,
        position,
        type: "undefined",
        message: `Variable "${variableName}" is not defined in any previous slide`,
      });
      continue;
    }

    // Check if variable is defined in a later slide (forward reference)
    const variableSlideIndex = variableSlideIndices.get(variableName);
    if (
      variableSlideIndex !== undefined &&
      variableSlideIndex >= currentSlideIndex
    ) {
      warnings.push({
        variableName,
        position,
        type: "forward_reference",
        message: `Variable "${variableName}" is defined in a later slide (slide ${
          variableSlideIndex + 1
        }). Variables can only reference data from previous slides.`,
      });
    }
  }

  return warnings;
}
