---
inclusion: always
---

# Testing Standards

## Testing Architecture

### Unit Tests

- **Location**: `src/**/__tests__/*.test.{ts,tsx}`
- **Environment**: jsdom
- **Purpose**: Test component logic, hooks, and utilities
- **Tools**: Vitest + Testing Library

### Integration Tests

- **Location**: `src/**/*.integration.test.{ts,tsx}`
- **Environment**: jsdom or browser
- **Purpose**: Test feature workflows and API integration

## Best Practices

### Unit Test Structure

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ComponentName } from "../ComponentName";

describe("ComponentName", () => {
  it("should render with default props", () => {
    render(<ComponentName />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
```

### Test File Organization

```
src/
├── components/
│   ├── states/
│   │   ├── __tests__/
│   │   │   ├── LoadingState.test.tsx
│   │   │   ├── ErrorState.test.tsx
│   │   │   └── EmptyState.test.tsx
│   │   ├── LoadingState.tsx
│   │   ├── LoadingState.stories.tsx
│   │   └── index.ts
```

## Testing Practices

### Important!! Test-Driven Development (TDD) - MANDATORY

**Requirement:** All code must be developed using strict Test-Driven Development practices.

#### TDD Cycle (Red-Green-Refactor)

1. **Red:** Write a failing test that describes the desired behavior. Failing tests do not include errors related to import it must be related to the desired behavior.
2. **Green:** Write the minimal code to make the test pass
3. **Refactor:** Improve code quality while keeping tests green

#### TDD Implementation Rules

- **No Production Code:** Write no production code without a failing test
- **Minimal Test Code:** Write only enough test code to demonstrate a failure
- **Minimal Production Code:** Write only enough production code to pass the failing test
- **Test First:** Always write tests before implementation code
- **Full Test Suite:** The complete test suite MUST be passing before marking any task as complete

### TDD Phase Validation Rules (Strict Enforcement)

**Red Phase Completion Criteria**

- The test suite must **compile successfully** (no missing imports, syntax errors, or undefined identifiers).
- The failure must result from a **behavioral mismatch** (e.g., incorrect output, missing element, failing assertion).
- If the test fails because the module, component, or function does not exist, **remain in the Red phase** and only create a stub or placeholder — do _not_ implement real behavior yet.
- The phrase "doesn't exist yet" or similar must **not** trigger movement to Green.

**Green Phase Entry Rule**

- Only proceed to the Green phase once the test **runs** and fails due to logic, not missing references.
- Before moving to Green, explicitly confirm:
  > "The test compiles and fails due to unmet behavioral expectations. Proceeding to Green."

**Audit Check**

- If the test output includes any of the following:  
  `"Module not found"`, `"Cannot find module"`, `"is not defined"`, `"SyntaxError"`, or `"ImportError"`,  
  then the system must **stay in Red phase**.
