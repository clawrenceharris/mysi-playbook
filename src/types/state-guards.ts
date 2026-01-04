/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StrategyState } from "./playbook";

/**
 * Reserved keys that should not be treated as slide IDs
 */
const RESERVED_KEYS = new Set([
  "phase",
  "responses",
  "assignments",
  "assignmentResponses",
  "sharedState",
]);

/**
 * Check if a key is a valid slide ID (not a reserved key and follows slide ID pattern)
 * Slide IDs typically contain hyphens (e.g., "slide-123", "abc-def-ghi")
 */
export function isSlideId(key: string): boolean {
  if (RESERVED_KEYS.has(key)) return false;
  // Slide IDs should contain at least one hyphen
  return key.includes("-");
}

/**
 * Check if a value is slide data (has responses, assignments, or assignmentResponses)
 */
export function isSlideData(value: any): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "responses" in value ||
    "assignments" in value ||
    "assignmentResponses" in value
  );
}

/**
 * Check if state uses slide-scoped structure
 */
export function isSlideScopedState(state: StrategyState): boolean {
  const keys = Object.keys(state).filter((k) => k !== "phase");

  return keys.some((key) => {
    if (!isSlideId(key)) return false;
    return isSlideData(state[key]);
  });
}

/**
 * Check if state uses legacy root-level structure
 */
export function isLegacyState(state: StrategyState): boolean {
  return (
    "responses" in state ||
    "assignments" in state ||
    "assignmentResponses" in state
  );
}

/**
 * Extract all slide IDs from state
 */
export function getSlideIds(state: StrategyState): string[] {
  return Object.keys(state).filter((key) => {
    if (!isSlideId(key)) return false;
    return isSlideData(state[key]);
  });
}
