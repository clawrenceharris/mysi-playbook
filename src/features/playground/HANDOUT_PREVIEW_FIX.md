# Handout Preview Fix

## Problem

The handout playground feature had multiple issues preventing it from working correctly in preview mode:

1. **Configuration Error**: Even after configuring a data source (e.g., `Collect Responses Slide -> Responses -> All`), the handout block showed "Configuration Error - No items available for distribution"
2. **Assignment Button Not Working**: Clicking the "Assign" button did nothing
3. **State Structure Mismatch**: The preview engine and components were using inconsistent state structures

## Root Causes

### 1. Preview Engine State Initialization

The `PreviewExecutionEngine` was initializing state with a flat structure:

```typescript
this.state = {
  phase: firstPhase,
  responses: {},
  assignments: {},
  assignmentResponses: {},
};
```

But the components expected a slide-scoped structure:

```typescript
{
  phase: "current-phase",
  "slide-1": {
    responses: {},
    assignments: {},
    assignmentResponses: []
  },
  "slide-2": { ... }
}
```

### 2. Variable Resolution

The `resolveDataReference` function was looking for data in the wrong structure:

- **Old**: `context.state[accessor][slideId]` (accessor first, then slide)
- **New**: `context.state[slideId][accessor]` (slide first, then accessor)

### 3. Response Storage

The `BlockRenderer.handleSubmit` was storing responses in a flat structure:

```typescript
ctx.state.responses[slide.id] = { ... }
```

Instead of slide-scoped:

```typescript
ctx.state[slide.id].responses = { ... }
```

### 4. Assignment Access

The `HandoutBlock` was looking for assignments at:

```typescript
ctx.state.assignments[block.id];
```

Instead of:

```typescript
ctx.state[slide.id].assignments[block.id];
```

## Solutions

### 1. Fixed Preview Engine Initialization

Updated `PreviewExecutionEngine.start()` to initialize slide-scoped state:

```typescript
start() {
  const firstPhase = this.strategy.slides.length > 0
    ? slugify(this.strategy.slides[0].title)
    : "";

  // Initialize slide-scoped state structure
  const slideStates: Record<string, any> = {};
  this.strategy.slides.forEach((slide) => {
    slideStates[slide.id] = {
      responses: {},
      assignments: {},
      assignmentResponses: [],
    };
  });

  this.state = {
    phase: firstPhase,
    ...slideStates,
    ...this.strategy.sharedState,
  };
}
```

### 2. Fixed Variable Resolution

Updated `resolveDataReference` to use slide-scoped structure:

```typescript
function resolveDataReference(
  reference: DataReference,
  slideId: string,
  context: VariableContext
): any {
  const { accessor, transformer } = reference;

  // Get slide data from slide-scoped structure: state[slideId][accessor]
  const slideData = context.state[slideId];
  if (!slideData || typeof slideData !== "object") {
    return {};
  }

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
```

### 3. Fixed Response Storage

Updated `BlockRenderer.handleSubmit` to use slide-scoped structure:

```typescript
const handleSubmit = (response: any) => {
  if (!ctx.call || !ctx.state || !ctx.setState || !ctx.userId) return;

  // Store in slide-scoped structure
  const slideData = ctx.state[slide.id] || {};
  const existingResponses = slideData.responses || {};
  const responseKey = `${ctx.userId}-${crypto.randomUUID()}`;

  ctx.setState({
    ...ctx.state,
    [slide.id]: {
      ...slideData,
      responses: {
        ...existingResponses,
        [responseKey]: { [block.id]: response },
      },
    },
  });
};
```

### 4. Fixed Assignment Access

Updated `HandoutBlock` to access assignments from slide-scoped state:

```typescript
function HandoutBlock({ block, ctx }: { ... }) {
  const config = block.config as HandoutConfig;

  // Get slide ID from data source (DataReference object)
  const sourceSlideId = config.dataSource.slideId;

  // Access assignments from slide-scoped state
  const currentSlideData = ctx.state?.[sourceSlideId] || {};
  const assignments = currentSlideData.assignments?.[block.id];

  if (!assignments) {
    return <WaitingForAssignment />;
  }

  // ... rest of component
}
```

## Testing

Created comprehensive tests to verify the fixes:

1. **handout-preview-integration.test.ts**: Tests the complete flow of state initialization, response collection, and assignment creation
2. **handout-data-resolution.test.ts**: Tests data resolution from slide-scoped structure

All tests pass successfully.

## Impact

- ✅ Handout blocks now correctly display "Waiting for Assignments" when no assignments exist
- ✅ Data sources resolve correctly from slide-scoped responses
- ✅ Assignment button creates assignments properly
- ✅ Participants see their assigned items correctly
- ✅ Preview mode state structure is consistent across all components

## Migration Notes

This fix maintains backward compatibility with the existing slide-scoped state structure. No changes are needed to existing strategies or playbooks.
