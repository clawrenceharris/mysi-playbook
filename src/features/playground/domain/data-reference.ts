/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * State accessor types for slide-scoped data
 */
export type StateAccessor = "responses" | "assignments" | "assignmentResponses";

/**
 * Data transformer types for filtering/transforming referenced data
 */
export type DataTransformer =
  | "all"
  | "currentUser"
  | "count"
  | "excludeCurrentUser";

/**
 * Data reference configuration specifying which slide data to access and how to transform it
 */
export interface DataReference {
  accessor: StateAccessor;
  slideId: string;
  transformer: DataTransformer;
  displayString?: string;
}

/**
 * Context for data transformation
 */
export interface TransformerContext {
  userId: string;
  isHost: boolean;
}

/**
 * Transform data based on the specified transformer
 */
export function transformData(
  data: any,
  transformer: DataTransformer,
  context: TransformerContext
): any {
  // Handle null/undefined for non-'all' transformers
  if (data === null || data === undefined) {
    if (transformer === "all") {
      return data;
    }
    if (transformer === "count") {
      return 0;
    }
    return [];
  }

  switch (transformer) {
    case "all":
      return data;

    case "currentUser":
      return filterCurrentUser(data, context.userId);

    case "count":
      return countItems(data);

    case "excludeCurrentUser":
      return excludeCurrentUser(data, context.userId);

    default:
      return data;
  }
}

/**
 * Filter data based on a predicate function
 */
function filterData(
  data: any,
  arrayPredicate: (item: any) => boolean,
  objectKeyPredicate: (key: string) => boolean
): any {
  if (Array.isArray(data)) {
    return data.filter(arrayPredicate);
  }

  if (typeof data === "object" && data !== null) {
    return Object.entries(data)
      .filter(([key]) => objectKeyPredicate(key))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  }

  return [];
}

/**
 * Filter data to only include current user's items
 */
function filterCurrentUser(data: any, userId: string): any {
  return filterData(
    data,
    (item) => item.authorId === userId,
    (key) => key.startsWith(userId)
  );
}

/**
 * Exclude current user's items from data
 */
function excludeCurrentUser(data: any, userId: string): any {
  return filterData(
    data,
    (item) => item.authorId !== userId,
    (key) => !key.startsWith(userId)
  );
}

/**
 * Count items in data
 */
function countItems(data: any): number {
  if (Array.isArray(data)) {
    return data.length;
  }

  if (typeof data === "object" && data !== null) {
    return Object.keys(data).length;
  }

  return 0;
}

/**
 * Format a data reference for display
 */
export function formatDataReferenceDisplay(
  reference: DataReference,
  slideTitle: string
): string {
  const title = slideTitle || "Untitled Slide";
  const accessor = formatAccessor(reference.accessor);
  const transformer = formatTransformer(reference.transformer);

  return `${title} → ${accessor} → ${transformer}`;
}

/**
 * Format accessor name for display
 */
function formatAccessor(accessor: StateAccessor): string {
  switch (accessor) {
    case "responses":
      return "Responses";
    case "assignments":
      return "Assignments";
    case "assignmentResponses":
      return "Assignment Responses";
    default:
      return accessor;
  }
}

/**
 * Format transformer name for display
 */
function formatTransformer(transformer: DataTransformer): string {
  switch (transformer) {
    case "all":
      return "All";
    case "currentUser":
      return "Current User";
    case "count":
      return "Count";
    case "excludeCurrentUser":
      return "Exclude Current User";
    default:
      return transformer;
  }
}
