/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DataReference } from "./data-reference";
import { transformData } from "./data-reference";

/**
 * Context for variable resolution
 */
export interface VariableContext {
  state: any;
  userId: string;
  isHost: boolean;
}

/**
 * Resolve a DataReference to actual data from slide-scoped state
 */
function resolveDataReference(
  reference: DataReference,
  context: VariableContext
): any {
  const { slideId, accessor, transformer } = reference;
  console.log({ slideId, accessor, context });

  // Get slide data from slide-scoped structure: state[slideId][accessor]
  const slideData = context.state[slideId];
  if (!slideData || typeof slideData !== "object") {
    return {};
  }
  console.log({ slideData });

  // Get accessor data from slide
  const accessorData = slideData[accessor];
  if (!accessorData) {
    return {};
  }

  // Apply transformer
  return transformData(accessorData, transformer, {
    userId: context.userId,
    isHost: context.isHost,
  });
}

/**
 * Replace all variables in content with resolved values
 */
export function interpolateVariable(
  reference: DataReference,
  context: VariableContext
): string {
  const value = resolveDataReference(reference, context);
  if (value === undefined || value === null) {
    return `[Error: Unable to resolve value`;
  }

  // Handle empty arrays and empty objects
  if (Array.isArray(value) && value.length === 0) {
    return `[Error: Unable to resolve value]`;
  }

  // Handle empty objects (returned when slide data doesn't exist)
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  ) {
    return `[Error: Unable to resolve value]`;
  }
  return value;
}
