# Design Document

## Overview

This design implements a slide-scoped state management system that organizes activity data by slide ID and provides an intuitive UI for cross-slide data references with built-in transformations. The system replaces custom variable names with standard accessors and introduces a unified data reference component.

## Architecture

### State Structure

The new state structure organizes data by slide ID at the root level:

```typescript
interface PlayfieldState {
  phase: string; // Current slide slug for navigation

  // Slide-scoped data
  [slideId: string]: {
    responses?: Record<string, any>; // userId-uuid -> response value
    assignments?: Record<string, string[]>; // userId -> assignmentIds[]
    assignmentResponses?: AssignmentResponse[]; // Array of responses to assignments
  };
}
```

**Example:**

```typescript
{
  phase: "write-questions",
  "slide-123": {
    responses: {
      "user1-abc": "What is 2+2?",
      "user2-def": "What is the capital?"
    }
  },
  "slide-456": {
    assignments: {
      "user1": ["assign-1", "assign-2"],
      "user2": ["assign-3"]
    },
    assignmentResponses: [
      { assignmentId: "assign-1", userId: "user1", response: "Good question!" }
    ]
  }
}
```

### Data Reference Model

A data reference specifies where to get data and how to transform it:

```typescript
interface DataReference {
  slideId: string; // Which slide to pull from
  accessor: StateAccessor; // Which data type (responses, assignments, etc)
  transformer: DataTransformer; // How to filter/transform the data
}

type StateAccessor = "responses" | "assignments" | "assignmentResponses";

type DataTransformer =
  | "all" // Return all items
  | "currentUser" // Filter to current user's items only
  | "count" // Return count of items
  | "excludeCurrentUser"; // Filter out current user's items
```

### Data Transformer Functions

Each transformer is a pure function that takes raw data and returns transformed data:

```typescript
type TransformerFunction = (
  data: any,
  context: { userId: string; isHost: boolean }
) => any;

const transformers: Record<DataTransformer, TransformerFunction> = {
  all: (data) => data,

  currentUser: (data, { userId }) => {
    if (Array.isArray(data)) {
      return data.filter((item) => item.authorId === userId);
    }
    if (typeof data === "object") {
      return Object.entries(data)
        .filter(([key]) => key.startsWith(userId))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    }
    return data;
  },

  count: (data) => {
    if (Array.isArray(data)) return data.length;
    if (typeof data === "object") return Object.keys(data).length;
    return 0;
  },

  excludeCurrentUser: (data, { userId }) => {
    if (Array.isArray(data)) {
      return data.filter((item) => item.authorId !== userId);
    }
    if (typeof data === "object") {
      return Object.entries(data)
        .filter(([key]) => !key.startsWith(userId))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    }
    return data;
  },
};
```

## Components and Interfaces

### 1. DataReferenceSelector Component

A new component that replaces the current VariableReferenceField with slide-aware selection using a three-step selection flow:

```typescript
interface DataReferenceSelectorProps {
  value: DataReference | null;
  onChange: (reference: DataReference | null) => void;
  availableSlides: SlideInfo[];
  placeholder?: string;
  disabled?: boolean;
  previewState?: ExtendedStrategyState; // For showing data indicators
}

interface SlideInfo {
  id: string;
  title: string;
  order: number;
}
```

**UI Design: Three-Select Progressive Disclosure**

The component uses three separate shadcn Select components that appear progressively:

1. **Slide Select** (always visible)

   - Label: "Slide"
   - Shows all available slides in chronological order
   - Displays data indicators (badges) showing available data types
   - Example: "Introduction [2 responses] [1 assignment]"

2. **Accessor Select** (appears after slide selection)

   - Label: "Data Type"
   - Options: "Responses", "Assignments", "Assignment Responses"
   - Only shows after a slide is selected
   - Defaults to "Responses" if not set

3. **Transformer Select** (appears after accessor selection)
   - Label: "Transform"
   - Options: "All", "Current User", "Count", "Exclude Current User"
   - Only shows after accessor is selected
   - Defaults to "All" if not set

**Progressive Disclosure Benefits:**

- Clear, explicit selection at each step
- Users can see and modify each part independently
- Natural left-to-right, top-to-bottom flow
- Each select can be changed without resetting others
- Familiar shadcn Select component UX

**Visual Layout:**

```
┌─────────────────────────────────────┐
│ Slide                               │
│ ┌─────────────────────────────────┐ │
│ │ Introduction [2 responses]    ▼ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Data Type                           │
│ ┌─────────────────────────────────┐ │
│ │ Responses                       ▼ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Transform                           │
│ ┌─────────────────────────────────┐ │
│ │ Current User                    ▼ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Interaction Flow:**

1. User opens form → Sees "Slide" select
2. User selects slide → "Data Type" select appears below
3. User selects data type → "Transform" select appears below
4. All three selections remain visible and editable
5. Changing slide preserves accessor/transformer if possible
6. onChange fires with complete DataReference when all three are selected

### 2. Updated Block Configurations

Remove `saveToSharedState` and `variableName` from block configs:

```typescript
// OLD HandoutConfig
interface HandoutConfig {
  dataSource: string;
  saveToSharedState?: boolean; // ❌ REMOVE
  variableName?: string; // ❌ REMOVE
  // ... other fields
}

// NEW HandoutConfig
interface HandoutConfig {
  dataSource: DataReference; // ✅ Use DataReference
  // ... other fields
}

// OLD CollectInputConfig
interface CollectInputConfig {
  saveToSharedState?: boolean; // ❌ REMOVE
  variableName?: string; // ❌ REMOVE
  // ... other fields
}

// NEW CollectInputConfig - no changes needed
// Data automatically saved to slide-scoped state
```

### 3. Variable Resolver Updates

Update the variable resolver to handle slide-scoped references:

```typescript
// Current: resolveVariable("customVarName", context)
// New: resolveVariable(dataReference, context)

function resolveVariable(
  reference: DataReference | string, // Support both for backward compat
  context: VariableContext
): any {
  // Handle legacy string references
  if (typeof reference === "string") {
    return resolveLegacyVariable(reference, context);
  }

  // Resolve slide-scoped reference
  const { slideId, accessor, transformer } = reference;

  // Get slide data
  const slideData = context.state[slideId];
  if (!slideData) return [];

  // Get accessor data
  const accessorData = slideData[accessor];
  if (!accessorData) return [];

  // Apply transformer
  const transformerFn = transformers[transformer];
  return transformerFn(accessorData, context);
}
```

### 4. SharedStateManager Updates

Update to work with slide-scoped structure:

```typescript
export const SharedStateManager = {
  // Get data from specific slide
  getSlideState(
    ctx: PlayfieldContext,
    slideId: string,
    accessor: StateAccessor
  ): any {
    return ctx.state[slideId]?.[accessor] || {};
  },

  // Set data for current slide
  setSlideState(
    ctx: PlayfieldContext,
    slideId: string,
    accessor: StateAccessor,
    value: any
  ): void {
    ctx.call.sendCustomEvent({
      type: `${ctx.slug}:slide-state-update`,
      slideId,
      accessor,
      value,
    });
  },

  // Merge data for current slide
  mergeSlideState(
    ctx: PlayfieldContext,
    slideId: string,
    accessor: StateAccessor,
    updates: Record<string, any>
  ): void {
    ctx.call.sendCustomEvent({
      type: `${ctx.slug}:slide-state-merge`,
      slideId,
      accessor,
      updates,
    });
  },
};
```

## Data Models

### DataReference Type

```typescript
interface DataReference {
  slideId: string;
  accessor: StateAccessor;
  transformer: DataTransformer;

  // Computed display string for UI
  displayString?: string; // e.g., "Write Questions → Responses → All"
}

type StateAccessor = "responses" | "assignments" | "assignmentResponses";

type DataTransformer = "all" | "currentUser" | "count" | "excludeCurrentUser";
```

### SlideStateInfo Type

```typescript
interface SlideStateInfo {
  slideId: string;
  slideTitle: string;
  slideOrder: number;
  hasResponses: boolean;
  hasAssignments: boolean;
  hasAssignmentResponses: boolean;
  responseCount?: number;
  assignmentCount?: number;
}
```

### Updated PlayfieldContext State

```typescript
interface ExtendedStrategyState {
  phase: string; // Current slide slug

  // Slide-scoped data (indexed by slide ID)
  [slideId: string]: {
    responses?: Record<string, any>;
    assignments?: Record<string, AssignmentMap>;
    assignmentResponses?: AssignmentResponse[];
  };
}
```

## Error Handling

### Invalid References

When a data reference cannot be resolved:

1. **Preview Mode**: Show warning badge on block with error message
2. **Live Mode**: Return empty array/object, log error to console
3. **Configuration**: Disable invalid slide/accessor combinations in UI

### Missing Data

When referenced slide has no data:

1. Return empty array for array-type accessors
2. Return empty object for object-type accessors
3. Return 0 for count transformer
4. Show "No data available" message in preview mode

### Backward Compatibility

When encountering legacy custom variable names:

1. Check root-level state first (legacy location)
2. If not found, check all slide namespaces
3. Log deprecation warning to console
4. Suggest migration to slide-scoped reference

## Testing Strategy

### Unit Tests

1. **Data Transformer Tests**

   - Test each transformer with various data types
   - Test edge cases (empty data, null, undefined)
   - Test user filtering logic

2. **Variable Resolver Tests**

   - Test slide-scoped resolution
   - Test legacy variable resolution
   - Test invalid references
   - Test transformer application

3. **Component Tests**
   - DataReferenceSelector rendering
   - Slide selection flow
   - Accessor selection flow
   - Transformer selection flow
   - Display string formatting

### Integration Tests

1. **Cross-Slide Data Flow**

   - Create activity with multiple slides
   - Collect data in slide 1
   - Reference data in slide 2
   - Verify correct data resolution

2. **Transformer Application**

   - Test "current user" filtering in multi-participant scenario
   - Test "count" transformer accuracy
   - Test "exclude current user" filtering

3. **Backward Compatibility**
   - Load activity with legacy custom variables
   - Verify data still resolves correctly
   - Verify deprecation warnings appear

### Preview Mode Tests

1. **Data Availability Indicators**

   - Verify slides with data show indicators
   - Verify slides without data are disabled
   - Verify real-time updates as data is collected

2. **Multi-Participant Preview**
   - Switch between participants
   - Verify "current user" transformer works correctly
   - Verify data isolation per participant

## Migration Strategy

### Phase 1: Add Slide-Scoped Storage (Non-Breaking)

1. Update state structure to support both root-level and slide-scoped data
2. Blocks write to slide-scoped locations
3. Variable resolver checks both locations
4. No UI changes yet

### Phase 2: Introduce DataReferenceSelector (Additive)

1. Create DataReferenceSelector component
2. Add to new block configurations
3. Existing blocks continue using string references
4. Both systems work in parallel

### Phase 3: Update Block Configurations (Breaking)

1. Remove `saveToSharedState` and `variableName` from UI
2. Update HandoutConfig to use DataReferenceSelector
3. Update CollectInputConfig (remove unused fields)
4. Update DisplayVariableConfig to use DataReferenceSelector

### Phase 4: Deprecate Legacy System

1. Add deprecation warnings for root-level custom variables
2. Provide migration tool to convert activities
3. Update documentation
4. Remove legacy code in future major version

## Performance Considerations

### State Access Optimization

- Cache slide state info to avoid repeated traversal
- Use memoization for transformer functions
- Lazy-load slide data only when needed

### UI Responsiveness

- Debounce data reference selector changes
- Use virtual scrolling for large slide lists
- Precompute available accessors per slide

### Memory Management

- Clear slide state when slides are deleted
- Implement state pruning for very long activities
- Use weak references for cached data

## Accessibility

### DataReferenceSelector

- Keyboard navigation through all dropdowns
- Screen reader announcements for selections
- Clear focus indicators
- ARIA labels for all interactive elements

### Error States

- Clear error messages for invalid references
- Visual and text indicators for missing data
- Helpful suggestions for fixing configuration

## Security Considerations

### Data Isolation

- Ensure "current user" transformer properly filters data
- Validate slide IDs to prevent unauthorized access
- Sanitize user input in responses

### State Validation

- Validate data reference structure before resolution
- Prevent injection attacks through slide IDs
- Validate transformer names against whitelist

## Future Enhancements

### Advanced Transformers

- **Filter by criteria**: Filter responses by content matching
- **Sort**: Sort items by timestamp, author, or content
- **Aggregate**: Sum, average, or other aggregations
- **Map**: Transform each item (e.g., extract specific field)

### Computed References

- **Formulas**: Combine multiple references with operations
- **Conditional**: Choose reference based on conditions
- **Chained**: Apply multiple transformers in sequence

### Visual Data Flow

- **Diagram view**: Show data flow between slides
- **Dependency graph**: Visualize which slides depend on others
- **Impact analysis**: Show what breaks if a slide is deleted
