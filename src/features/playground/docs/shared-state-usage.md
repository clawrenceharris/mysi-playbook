# Cross-Slide Shared State Usage Guide

## Overview

The slide builder now supports cross-slide state management, allowing data to be passed between slides. This is essential for interactive activities like Snowball where student inputs from one slide need to be displayed in subsequent slides.

## Basic Usage

### Setting State

Store data that needs to be accessed across slides:

```typescript
const { setSharedState } = useSlideBuilder();

// Store student questions
setSharedState("snowball-questions", [
  { id: "1", text: "What is React?", userId: "user1" },
  { id: "2", text: "How does state work?", userId: "user2" },
]);
```

### Getting State

Retrieve stored data in any slide:

```typescript
const { getSharedState } = useSlideBuilder();

// Retrieve student questions
const questions = getSharedState("snowball-questions");
```

### Clearing State

Remove specific keys or all shared state:

```typescript
const { clearSharedState } = useSlideBuilder();

// Clear specific key
clearSharedState("snowball-questions");

// Clear all shared state
clearSharedState();
```

## Snowball Activity Example

### Slide 1: Collect Student Questions

```typescript
// In a collect-input block handler
const handleStudentSubmit = (question: string, userId: string) => {
  const existingQuestions = getSharedState("snowball-questions") || [];

  setSharedState("snowball-questions", [
    ...existingQuestions,
    {
      id: crypto.randomUUID(),
      text: question,
      userId,
      timestamp: Date.now(),
    },
  ]);
};
```

### Slide 2: Display Questions for Selection

```typescript
// In a display block component
const SnowballPickSlide = () => {
  const { getSharedState } = useSlideBuilder();
  const questions = getSharedState("snowball-questions") || [];

  return (
    <div className="grid grid-cols-3 gap-3">
      {questions.map((q) => (
        <SnowballCard key={q.id} onClick={() => handleQuestionPick(q.id)} />
      ))}
    </div>
  );
};
```

### Slide 3: Show Selected Questions

```typescript
// Track which questions were selected
const handleQuestionPick = (questionId: string, userId: string) => {
  const selections = getSharedState("snowball-selections") || {};

  setSharedState("snowball-selections", {
    ...selections,
    [userId]: questionId,
  });
};

// Display selected questions
const SnowballDiscussSlide = () => {
  const { getSharedState } = useSlideBuilder();
  const questions = getSharedState("snowball-questions") || [];
  const selections = getSharedState("snowball-selections") || {};

  return (
    <div>
      {Object.entries(selections).map(([userId, questionId]) => {
        const question = questions.find((q) => q.id === questionId);
        return (
          <div key={userId}>
            <p>Student {userId} is discussing:</p>
            <p>{question?.text}</p>
          </div>
        );
      })}
    </div>
  );
};
```

## Block Configuration Pattern

You can reference shared state in block configs:

```typescript
const displaySlide: StrategySlide = {
  id: "display-slide",
  title: "Student Questions",
  type: SlideType.CONTENT,
  blocks: [
    {
      id: "display-block",
      type: "display-prompt",
      order: 0,
      config: {
        title: "Questions from students",
        // Reference shared state key
        dataSource: "snowball-questions",
        // Template for rendering
        template: "question-grid",
      },
    },
  ],
  // ...
};
```

## State Persistence

Shared state is:

- ✅ Preserved when adding/deleting slides
- ✅ Preserved when navigating between slides
- ✅ Included when saving/loading strategies
- ✅ Cleared when resetting the builder
- ❌ Not persisted to database automatically (must be saved with strategy)

## Best Practices

1. **Use descriptive keys**: `"snowball-questions"` instead of `"data"`
2. **Initialize with defaults**: Always check for undefined when getting state
3. **Namespace by activity**: Prefix keys with activity name to avoid conflicts
4. **Clean up**: Clear state when activity completes or resets
5. **Type safety**: Define interfaces for your state structure

```typescript
interface SnowballQuestion {
  id: string;
  text: string;
  userId: string;
  timestamp: number;
}

// Type-safe getter
const questions = (getSharedState("snowball-questions") ||
  []) as SnowballQuestion[];
```

## Advanced: State Transformations

Transform state between slides:

```typescript
// Slide 1: Collect raw inputs
setSharedState("raw-responses", responses);

// Slide 2: Transform and store processed data
const rawResponses = getSharedState("raw-responses");
const processedData = rawResponses.map((r) => ({
  ...r,
  category: categorize(r.text),
  sentiment: analyzeSentiment(r.text),
}));
setSharedState("processed-responses", processedData);
```

## Debugging

Access the entire shared state object:

```typescript
const { sharedState } = useSlideBuilder();
console.log("Current shared state:", sharedState);
```
