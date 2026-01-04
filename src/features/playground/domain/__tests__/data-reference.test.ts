import { describe, it, expect } from "vitest";
import {
  DataReference,
  StateAccessor,
  DataTransformer,
  transformData,
  formatDataReferenceDisplay,
} from "../data-reference";

describe("DataReference Types", () => {
  it("should create a valid DataReference object", () => {
    const reference: DataReference = {
      slideId: "slide-123",
      accessor: "responses",
      transformer: "all",
    };

    expect(reference.slideId).toBe("slide-123");
    expect(reference.accessor).toBe("responses");
    expect(reference.transformer).toBe("all");
  });

  it("should support all StateAccessor types", () => {
    const accessors: StateAccessor[] = [
      "responses",
      "assignments",
      "assignmentResponses",
    ];

    accessors.forEach((accessor) => {
      const reference: DataReference = {
        slideId: "slide-1",
        accessor,
        transformer: "all",
      };
      expect(reference.accessor).toBe(accessor);
    });
  });

  it("should support all DataTransformer types", () => {
    const transformers: DataTransformer[] = [
      "all",
      "currentUser",
      "count",
      "excludeCurrentUser",
    ];

    transformers.forEach((transformer) => {
      const reference: DataReference = {
        slideId: "slide-1",
        accessor: "responses",
        transformer,
      };
      expect(reference.transformer).toBe(transformer);
    });
  });
});

describe("transformData - 'all' transformer", () => {
  it("should return all data unchanged for arrays", () => {
    const data = [
      { id: "1", content: "Item 1", authorId: "user1" },
      { id: "2", content: "Item 2", authorId: "user2" },
    ];
    const context = { userId: "user1", isHost: false };

    const result = transformData(data, "all", context);

    expect(result).toEqual(data);
  });

  it("should return all data unchanged for objects", () => {
    const data = {
      "user1-abc": "Response 1",
      "user2-def": "Response 2",
    };
    const context = { userId: "user1", isHost: false };

    const result = transformData(data, "all", context);

    expect(result).toEqual(data);
  });
});

describe("transformData - 'currentUser' transformer", () => {
  it("should filter array items to current user only", () => {
    const data = [
      { id: "1", content: "Item 1", authorId: "user1" },
      { id: "2", content: "Item 2", authorId: "user2" },
      { id: "3", content: "Item 3", authorId: "user1" },
    ];
    const context = { userId: "user1", isHost: false };

    const result = transformData(data, "currentUser", context);

    expect(result).toEqual([
      { id: "1", content: "Item 1", authorId: "user1" },
      { id: "3", content: "Item 3", authorId: "user1" },
    ]);
  });

  it("should filter object entries to current user only", () => {
    const data = {
      "user1-abc": "Response 1",
      "user2-def": "Response 2",
      "user1-ghi": "Response 3",
    };
    const context = { userId: "user1", isHost: false };

    const result = transformData(data, "currentUser", context);

    expect(result).toEqual({
      "user1-abc": "Response 1",
      "user1-ghi": "Response 3",
    });
  });

  it("should return empty array when no items match current user", () => {
    const data = [
      { id: "1", content: "Item 1", authorId: "user2" },
      { id: "2", content: "Item 2", authorId: "user3" },
    ];
    const context = { userId: "user1", isHost: false };

    const result = transformData(data, "currentUser", context);

    expect(result).toEqual([]);
  });
});

describe("transformData - 'count' transformer", () => {
  it("should return count for arrays", () => {
    const data = [
      { id: "1", content: "Item 1" },
      { id: "2", content: "Item 2" },
      { id: "3", content: "Item 3" },
    ];
    const context = { userId: "user1", isHost: false };

    const result = transformData(data, "count", context);

    expect(result).toBe(3);
  });

  it("should return count for objects", () => {
    const data = {
      "user1-abc": "Response 1",
      "user2-def": "Response 2",
    };
    const context = { userId: "user1", isHost: false };

    const result = transformData(data, "count", context);

    expect(result).toBe(2);
  });

  it("should return 0 for empty arrays", () => {
    const data: unknown[] = [];
    const context = { userId: "user1", isHost: false };

    const result = transformData(data, "count", context);

    expect(result).toBe(0);
  });

  it("should return 0 for empty objects", () => {
    const data = {};
    const context = { userId: "user1", isHost: false };

    const result = transformData(data, "count", context);

    expect(result).toBe(0);
  });
});

describe("transformData - 'excludeCurrentUser' transformer", () => {
  it("should exclude current user items from arrays", () => {
    const data = [
      { id: "1", content: "Item 1", authorId: "user1" },
      { id: "2", content: "Item 2", authorId: "user2" },
      { id: "3", content: "Item 3", authorId: "user3" },
    ];
    const context = { userId: "user1", isHost: false };

    const result = transformData(data, "excludeCurrentUser", context);

    expect(result).toEqual([
      { id: "2", content: "Item 2", authorId: "user2" },
      { id: "3", content: "Item 3", authorId: "user3" },
    ]);
  });

  it("should exclude current user entries from objects", () => {
    const data = {
      "user1-abc": "Response 1",
      "user2-def": "Response 2",
      "user3-ghi": "Response 3",
    };
    const context = { userId: "user1", isHost: false };

    const result = transformData(data, "excludeCurrentUser", context);

    expect(result).toEqual({
      "user2-def": "Response 2",
      "user3-ghi": "Response 3",
    });
  });

  it("should return empty array when all items are from current user", () => {
    const data = [
      { id: "1", content: "Item 1", authorId: "user1" },
      { id: "2", content: "Item 2", authorId: "user1" },
    ];
    const context = { userId: "user1", isHost: false };

    const result = transformData(data, "excludeCurrentUser", context);

    expect(result).toEqual([]);
  });
});

describe("transformData - edge cases", () => {
  it("should handle null data", () => {
    const context = { userId: "user1", isHost: false };

    expect(transformData(null, "all", context)).toBeNull();
    expect(transformData(null, "currentUser", context)).toEqual([]);
    expect(transformData(null, "count", context)).toBe(0);
    expect(transformData(null, "excludeCurrentUser", context)).toEqual([]);
  });

  it("should handle undefined data", () => {
    const context = { userId: "user1", isHost: false };

    expect(transformData(undefined, "all", context)).toBeUndefined();
    expect(transformData(undefined, "currentUser", context)).toEqual([]);
    expect(transformData(undefined, "count", context)).toBe(0);
    expect(transformData(undefined, "excludeCurrentUser", context)).toEqual([]);
  });
});

describe("formatDataReferenceDisplay", () => {
  it("should format data reference with slide title", () => {
    const reference: DataReference = {
      slideId: "slide-123",
      accessor: "responses",
      transformer: "all",
    };
    const slideTitle = "Write Questions";

    const result = formatDataReferenceDisplay(reference, slideTitle);

    expect(result).toBe("Write Questions → Responses → All");
  });

  it("should format with different accessors", () => {
    const reference: DataReference = {
      slideId: "slide-123",
      accessor: "assignments",
      transformer: "currentUser",
    };
    const slideTitle = "Review Answers";

    const result = formatDataReferenceDisplay(reference, slideTitle);

    expect(result).toBe("Review Answers → Assignments → Current User");
  });

  it("should format with different transformers", () => {
    const reference: DataReference = {
      slideId: "slide-123",
      accessor: "assignmentResponses",
      transformer: "count",
    };
    const slideTitle = "Feedback Round";

    const result = formatDataReferenceDisplay(reference, slideTitle);

    expect(result).toBe("Feedback Round → Assignment Responses → Count");
  });

  it("should format excludeCurrentUser transformer", () => {
    const reference: DataReference = {
      slideId: "slide-123",
      accessor: "responses",
      transformer: "excludeCurrentUser",
    };
    const slideTitle = "Peer Review";

    const result = formatDataReferenceDisplay(reference, slideTitle);

    expect(result).toBe("Peer Review → Responses → Exclude Current User");
  });

  it("should handle empty slide title", () => {
    const reference: DataReference = {
      slideId: "slide-123",
      accessor: "responses",
      transformer: "all",
    };

    const result = formatDataReferenceDisplay(reference, "");

    expect(result).toBe("Untitled Slide → Responses → All");
  });
});
