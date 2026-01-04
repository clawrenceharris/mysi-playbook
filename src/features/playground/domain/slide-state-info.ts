/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StrategyState } from "@/types/playbook";

/**
 * Information about data availability in a slide
 */
export interface SlideStateInfo {
  slideId: string;
  hasResponses: boolean;
  hasAssignments: boolean;
  hasAssignmentResponses: boolean;
  responseCount: number;
  assignmentCount: number;
  assignmentResponseCount: number;
}

/**
 * Analyze slide state to determine which accessors have data and count items
 */
export function analyzeSlideState(
  state: StrategyState,
  slideId: string
): SlideStateInfo {
  const slideData = state[slideId];

  if (!slideData || typeof slideData !== "object") {
    return {
      slideId,
      hasResponses: false,
      hasAssignments: false,
      hasAssignmentResponses: false,
      responseCount: 0,
      assignmentCount: 0,
      assignmentResponseCount: 0,
    };
  }

  const responses = slideData.responses;
  const assignments = slideData.assignments;
  const assignmentResponses = slideData.assignmentResponses;

  const responseCount = countItems(responses);
  const assignmentCount = countItems(assignments);
  const assignmentResponseCount = Array.isArray(assignmentResponses)
    ? assignmentResponses.length
    : 0;

  return {
    slideId,
    hasResponses: responseCount > 0,
    hasAssignments: assignmentCount > 0,
    hasAssignmentResponses: assignmentResponseCount > 0,
    responseCount,
    assignmentCount,
    assignmentResponseCount,
  };
}

/**
 * Count items in data (handles objects and arrays)
 */
function countItems(data: any): number {
  if (!data) return 0;

  if (Array.isArray(data)) {
    return data.length;
  }

  if (typeof data === "object") {
    return Object.keys(data).length;
  }

  return 0;
}
