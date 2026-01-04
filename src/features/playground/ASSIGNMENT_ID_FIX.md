# Assignment Distribution ID Stability Fix

## Problem

When using the handout/assignment distribution block in preview mode, assignments were not being displayed correctly to participants even though they were created successfully. The issue manifested as:

1. First click on "Assign" button showed warning: "0 items, 3 participants"
2. Second click showed correct count: "3 items → 3 participants"
3. But participants saw "No assignment" even though assignments were created

## Root Cause

The issue was in the `variable-resolver.ts` file's `convertToAssignmentItems` function. This function converts userId-uuid keyed objects (like `{"user1-abc123": "Question 1"}`) into arrays of `AssignmentItem` objects.

The problem: **Every time `resolveVariable` was called, it generated NEW random UUIDs for the item IDs using `crypto.randomUUID()`**.

This caused a critical mismatch:

1. When host clicks "Assign", `resolveVariable` is called to get items → generates IDs like `abc-123`
2. Distribution algorithm creates assignment map using these IDs
3. When displaying assignments, `resolveVariable` is called again → generates NEW IDs like `def-456`
4. The assignment map references `abc-123`, but the items now have IDs `def-456`
5. Result: No matching items found, participants see "No assignment"

## Solution

Changed the ID generation from random to **deterministic** based on the userId-uuid key:

```typescript
// Before (WRONG):
function convertToAssignmentItems(obj: Record<string, any>): any[] {
  return Object.entries(obj).map(([key, value]) => {
    const authorId = key.split("-")[0];
    return {
      id: crypto.randomUUID(), // ❌ Different ID every time!
      content: value,
      authorId,
      createdAt: Date.now(),
    };
  });
}

// After (CORRECT):
function deterministicUUID(input: string): string {
  // Hash the input to create a consistent UUID
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-${hex.slice(0, 4)}-${hex.slice(
    0,
    4
  )}-${hex.slice(0, 8)}${hex.slice(0, 4)}`;
}

function convertToAssignmentItems(obj: Record<string, any>): any[] {
  return Object.entries(obj).map(([key, value]) => {
    const authorId = key.split("-")[0];
    return {
      id: deterministicUUID(key), // ✅ Same ID every time for same key!
      content: value,
      authorId,
      createdAt: Date.now(),
    };
  });
}
```

## Impact

- **Fixed**: Assignment distribution now works correctly in preview mode
- **Fixed**: Participants now see their assigned items
- **Fixed**: Multiple calls to `resolveVariable` return consistent IDs
- **No Breaking Changes**: All existing tests pass
- **Performance**: No performance impact (deterministic hashing is fast)

## Tests Added

1. `assignment-id-stability.test.ts` - Verifies IDs are stable across multiple resolutions
2. `assignment-flow-integration.test.ts` - Tests the complete assignment flow from collection to display

## Files Changed

- `src/features/playground/domain/variable-resolver.ts` - Added deterministic UUID generation
- `src/features/playground/compiler/AssignmentHostControl.tsx` - Removed debug console.log
