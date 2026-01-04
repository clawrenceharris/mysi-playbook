# Cross-Slide Shared State Implementation

## Summary

Successfully implemented cross-slide state management for the Activity Builder, enabling data to be passed between slides (e.g., student inputs from Slide 1 displayed on Slide 2).

## Changes Made

### 1. Type Definitions (`slide-types.ts`)

Added `sharedState` property to `ImprovedStrategy`:

```typescript
export interface ImprovedStrategy {
  // ... existing properties
  sharedState?: Record<string, any>; // Cross-slide state storage
}
```

### 2. Hook State (`useSlideBuilder.ts`)

Extended `UseSlideBuilderState` with shared state:

```typescript
export interface UseSlideBuilderState {
  slides: StrategySlide[];
  currentSlideId: string | null;
  isDirty: boolean;
  sharedState: Record<string, any>; // New property
}
```

### 3. New Actions

Added three new actions to `UseSlideBuilderActions`:

- `setSharedState(key: string, value: any)` - Store data
- `getSharedState(key: string)` - Retrieve data
- `clearSharedState(key?: string)` - Clear data (specific key or all)

### 4. Implementation Details

**setSharedState**: Stores value and marks builder as dirty

```typescript
const setSharedState = useCallback((key: string, value: any) => {
  setState((prev) => ({
    ...prev,
    sharedState: { ...prev.sharedState, [key]: value },
    isDirty: true,
  }));
}, []);
```

**getSharedState**: Returns value or undefined

```typescript
const getSharedState = useCallback(
  (key: string) => state.sharedState?.[key],
  [state.sharedState]
);
```

**clearSharedState**: Removes specific key or all keys

```typescript
const clearSharedState = useCallback((key?: string) => {
  setState((prev) => {
    if (key) {
      const newSharedState = { ...prev.sharedState };
      delete newSharedState[key];
      return { ...prev, sharedState: newSharedState, isDirty: true };
    }
    return { ...prev, sharedState: {}, isDirty: true };
  });
}, []);
```

### 5. Integration with Existing Features

- **resetBuilder**: Clears shared state
- **loadStrategy**: Loads shared state from strategy
- **Slide operations**: Preserve shared state during add/delete/reorder

## Test Coverage

Created comprehensive test suite (`useSlideBuilder.sharedState.test.ts`):

- ✅ Setting single and multiple values
- ✅ Updating existing values
- ✅ Marking builder as dirty
- ✅ Handling complex objects
- ✅ Getting non-existent keys
- ✅ Clearing specific keys
- ✅ Clearing all state
- ✅ Exposing entire state object
- ✅ Preserving state during slide operations
- ✅ Clearing state on reset
- ✅ Loading state from strategy

**All 15 tests passing** ✅

## Usage Example

### Snowball Activity Pattern

**Slide 1: Collect Input**

```typescript
const handleSubmit = (question: string, userId: string) => {
  const questions = getSharedState("snowball-questions") || [];
  setSharedState("snowball-questions", [
    ...questions,
    { id: crypto.randomUUID(), text: question, userId },
  ]);
};
```

**Slide 2: Display Results**

```typescript
const questions = getSharedState("snowball-questions") || [];
return (
  <div>
    {questions.map((q) => (
      <QuestionCard key={q.id} {...q} />
    ))}
  </div>
);
```

## Documentation

Created two documentation files:

1. **shared-state-usage.md** - Comprehensive usage guide with examples
2. **snowball-example.tsx** - Practical implementation example

## Benefits

1. **Data Persistence**: Student inputs persist across slide navigation
2. **Activity Patterns**: Enables complex multi-slide activities like Snowball
3. **Type Safety**: Fully typed with TypeScript
4. **Test Coverage**: Comprehensive test suite ensures reliability
5. **Clean API**: Simple, intuitive methods for state management
6. **Integration**: Works seamlessly with existing slide builder features

## Next Steps

To use this in the playground:

1. Import `useSlideBuilder` hook
2. Use `setSharedState` to store data in input blocks
3. Use `getSharedState` to retrieve data in display blocks
4. Navigate between slides - data persists automatically

## Performance Considerations

- State updates trigger re-renders only for components using the hook
- Shared state is stored in memory (not persisted until strategy is saved)
- Use specific keys to avoid unnecessary data retrieval
- Clear state when no longer needed to prevent memory bloat
