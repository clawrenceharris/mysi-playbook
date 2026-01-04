# Custom Variables Fix

## Problem

The display variable block functionality was only partially working:

1. **Variable Name Issue**: When a collect input block had `saveToSharedState` enabled with a custom variable name (e.g., `write_a_question`), the activity preview showed `Error variable "write_a_question" not found`.
2. **Display Issue**: When using the default `responses` variable, it displayed `[object Object]` instead of readable content.

## Root Causes

### 1. Storage Location Mismatch

Collect input blocks with custom variable names were storing responses in the default `responses[blockId]` structure instead of directly under the custom variable name in state.

### 2. Variable Resolution

The variable resolver didn't properly handle:

- Custom variable names from collect input blocks
- Flattening nested response objects
- Filtering responses by current user

### 3. Display Formatting

The `interpolateVariable` function used `JSON.stringify` for objects, which:

- Produced `[object Object]` when converted to string in some contexts
- Wasn't human-readable for displaying lists of responses

## Solution

### 1. Updated Response Storage (BlockRenderer.tsx)

Modified `handleSubmit` to check if a block has a custom variable name:

- If `saveToSharedState` is enabled with a `variableName`, store responses under that custom variable name
- Otherwise, use the default `responses[blockId]` structure

```typescript
if (hasCustomVariable) {
  // Store in custom variable name
  ctx.setState({
    ...ctx.state,
    [blockConfig.variableName]: customVarResponses,
  });
} else {
  // Store in default responses structure
  ctx.setState({
    ...ctx.state,
    responses: newResponses,
  });
}
```

### 2. Enhanced Variable Resolution (variable-resolver.ts)

Updated the `responses` and `responses.current` accessors to properly flatten nested response objects:

```typescript
responses: (ctx) => {
  // Flatten nested response objects: responses[blockId][userId-uuid] = value
  const allResponses: any[] = [];
  Object.values(responses).forEach((blockResponses: any) => {
    if (typeof blockResponses === "object" && blockResponses !== null) {
      allResponses.push(...Object.values(blockResponses));
    }
  });
  return allResponses;
};
```

### 3. Improved Display Formatting (variable-resolver.ts)

Created a `formatValueForDisplay` function that:

- Formats arrays as bullet lists
- Detects response objects (with `userId-uuid` keys) and formats them as bullet lists
- Formats other objects as pretty-printed JSON
- Handles primitives as strings

```typescript
function formatValueForDisplay(value: any): string {
  if (Array.isArray(value)) {
    return value.map((item) => `• ${formatValueForDisplay(item)}`).join("\n");
  }

  if (typeof value === "object") {
    // Check if it's a response object
    const entries = Object.entries(value);
    if (entries.length > 0 && entries[0][0].includes("-")) {
      return entries
        .map(([, val]) => `• ${formatValueForDisplay(val)}`)
        .join("\n");
    }
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}
```

### 4. UI Enhancement (BlockRenderer.tsx)

Updated `VariableDisplayBlock` to use `whitespace-pre-wrap` to preserve line breaks from bullet list formatting.

## Testing

Created comprehensive test suites:

1. **shared-state-variables.test.ts**: Tests custom variable resolution and formatting
2. **custom-variable-integration.test.ts**: End-to-end integration tests
3. Updated **variable-resolver.test.ts**: Fixed existing tests to match new behavior

All tests pass successfully.

## Usage

### Collect Input Block with Custom Variable

1. Add a collect input block
2. Enable "Save to shared state"
3. Set a custom variable name (e.g., `student_questions`)
4. Responses will be stored under `state.student_questions`

### Display Variable Block

1. Add a display variable block
2. Reference the custom variable name (e.g., `student_questions`)
3. The block will display all responses as a formatted bullet list

### Predefined Variables

- `responses`: All responses from all blocks (flat array)
- `responses.current`: Current user's responses across all blocks
- `current_user`: Current user ID
- `assignments.current`: Current user's assignments
- `assignments.all`: All assignments (host only)

## Benefits

1. **Custom Variables Work**: Collect input blocks can now properly save to custom variable names
2. **Readable Display**: Responses are displayed as formatted bullet lists instead of `[object Object]`
3. **Flexible**: Supports both custom variables and default response structure
4. **Backward Compatible**: Existing blocks without custom variables continue to work
