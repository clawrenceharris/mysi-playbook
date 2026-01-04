Use this file to help debug code without actually modifying the code. Title each section with the name of the bug, and then describe the issue in detail and list possible causes and solutions

---

## CurrentSlideId Changes to Wrong ID After Creating New Slide

### Issue Description

When creating a new slide, the `currentSlideId` is correctly set to the new slide's ID initially, but then quickly changes to a different, persistent ID (`ca569f44-e416-4212-9c8a-5ca4eb15c46f`). This ID remains the same even after page refresh, suggesting it's not randomly generated but stored somewhere.

### Observed Behavior

1. User creates a new slide
2. `currentSlideId` briefly shows the correct new slide ID
3. `currentSlideId` quickly changes to `ca569f44-e416-4212-9c8a-5ca4eb15c46f`
4. The same incorrect ID persists across page refreshes
5. The incorrect ID doesn't appear to be in the slides array

### Root Cause Analysis

Based on code review, the issue is caused by **URL synchronization race conditions** in `PlaygroundPage.tsx`:

#### The Problem Flow:

1. **New slide created** → `addSlide()` sets `currentSlideId` to new slide ID
2. **First useEffect (lines 42-47)** reads URL param `?slide=ca569f44...` from previous session
3. **URL param doesn't match new currentSlideId** → calls `selectSlide(slideParam)`
4. **This overwrites the new slide ID** with the old one from the URL

#### Key Evidence:

```typescript
// Effect 1: Syncs FROM URL TO state (lines 42-47)
useEffect(() => {
  const slideParam = searchParams.get("slide");
  if (slideParam && slideParam !== currentSlideId) {
    selectSlide(slideParam); // ⚠️ This overwrites the new slide ID
  }
}, [searchParams, currentSlideId, selectSlide]);

// Effect 2: Syncs FROM state TO URL (lines 50-57)
useEffect(() => {
  if (currentSlideId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("slide", currentSlideId);
    router.replace(`${pathname}?${params.toString()}`);
  }
}, [currentSlideId, pathname, router, searchParams]);
```

### Why the ID Persists Across Refreshes

The URL parameter `?slide=ca569f44-e416-4212-9c8a-5ca4eb15c46f` is in the browser's address bar. When you refresh:

1. Next.js loads with the URL param intact
2. Effect 1 reads this param and sets it as `currentSlideId`
3. Even though the slide doesn't exist in the slides array, the ID is set

### Possible Causes

1. **Race condition between two useEffects**: URL-to-state sync runs after state-to-URL sync
2. **Stale URL parameter**: Old slide ID in URL from previous session
3. **Missing validation**: No check if the slide ID from URL actually exists in slides array
4. **Effect dependency issues**: Both effects depend on `currentSlideId` and `searchParams`, creating circular updates

### Solutions

#### Solution 1: Validate Slide ID from URL (Recommended)

Add validation to ensure the slide ID from URL actually exists:

```typescript
useEffect(() => {
  const slideParam = searchParams.get("slide");
  if (slideParam && slideParam !== currentSlideId) {
    // ✅ Only select if slide exists
    const slideExists = slides.some((s) => s.id === slideParam);
    if (slideExists) {
      selectSlide(slideParam);
    } else {
      // Clear invalid URL param
      const params = new URLSearchParams(searchParams.toString());
      params.delete("slide");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }
}, [searchParams, currentSlideId, selectSlide, slides, pathname, router]);
```

#### Solution 2: Debounce URL Updates

Prevent rapid URL updates by debouncing:

```typescript
useEffect(() => {
  if (currentSlideId) {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("slide", currentSlideId);
      router.replace(`${pathname}?${params.toString()}`);
    }, 100); // Small delay to let state settle

    return () => clearTimeout(timeoutId);
  }
}, [currentSlideId, pathname, router, searchParams]);
```

#### Solution 3: Use URL as Single Source of Truth

Remove the URL-to-state sync and make URL the primary source:

```typescript
// Remove Effect 1 entirely
// Modify Effect 2 to only update URL when explicitly changed
useEffect(() => {
  if (currentSlideId) {
    const currentParam = searchParams.get("slide");
    if (currentParam !== currentSlideId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("slide", currentSlideId);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }
}, [currentSlideId, pathname, router, searchParams]);
```

#### Solution 4: Add Priority Flag

Give programmatic slide changes priority over URL sync:

```typescript
const [isNavigating, setIsNavigating] = useState(false);

// In addSlide, duplicateSlide, etc:
const addSlide = useCallback(
  (title: string, type: SlideType, afterSlideId?: string) => {
    setIsNavigating(true);
    // ... existing logic
    setTimeout(() => setIsNavigating(false), 0);
  },
  []
);

// In URL sync effect:
useEffect(() => {
  if (isNavigating) return; // Skip URL sync during programmatic navigation
  // ... existing logic
}, [searchParams, currentSlideId, selectSlide, isNavigating]);
```

### Recommended Fix

**Solution 1** is the safest and most straightforward:

- Validates that URL params reference real slides
- Cleans up invalid URL params automatically
- Prevents the race condition by adding a guard condition
- Minimal changes to existing architecture

### Testing the Fix

After implementing Solution 1:

1. Create a new slide → should stay on new slide
2. Refresh page → should stay on current slide (if it exists)
3. Manually edit URL to invalid ID → should clear the param
4. Use browser back/forward → should navigate correctly
5. Delete current slide → should select first available slide

### Additional Notes

- The `ca569f44-e416-4212-9c8a-5ca4eb15c46f` ID likely came from a previous test/development session
- No localStorage is involved in slide ID persistence (only used for templates and profiles)
- The issue is purely URL-based state management
- Consider adding error boundaries for invalid slide states

---

## useSearch Hook Causes Browser Freeze and Memory Exhaustion

### Issue Description

When users type in the search bar on the Playbooks or Sessions pages, the browser freezes and becomes unresponsive. Test execution also runs out of memory with "JavaScript heap out of memory" errors.

### Observed Behavior

1. User types in search bar on `/playbooks` or `/sessions`
2. Browser freezes immediately
3. Page becomes completely unresponsive
4. Memory usage spikes dramatically
5. Test suite crashes with heap out of memory error

### Root Cause Analysis

The issue is caused by **infinite re-render loops** in the `useSearch` hook due to unstable dependencies:

#### The Problem Flow:

1. **Parent component renders** → passes `Object.values(playbooks)` as `data` prop
2. **useSearch creates `getData` callback** → depends on `data` array
3. **useSearch creates `performSearch` callback** → depends on `getData` and `filter`
4. **useEffect runs** → depends on `performSearch`
5. **Parent re-renders** → `Object.values(playbooks)` creates NEW array reference
6. **`getData` recreates** → because `data` reference changed
7. **`performSearch` recreates** → because `getData` changed
8. **useEffect runs again** → because `performSearch` changed
9. **Loop continues infinitely** → memory exhaustion

#### Key Evidence from Code:

**In `useSearch.ts`:**

```typescript
const getData = useCallback(async (): Promise<T[]> => {
  if (typeof data === "function") {
    const fn = data as () => Promise<T[]>;
    return fn();
  }
  return data as T[];
}, [data]); // ⚠️ data array reference changes every render

const performSearch = useCallback(
  async (q: string) => {
    // ... search logic
    const list = await getData();
    const filtered = list.filter((item) => filter(item, q));
    // ...
  },
  [filter, getData, minQueryLength] // ⚠️ filter and getData recreate constantly
);

useEffect(() => {
  performSearch(debouncedQuery);
}, [debouncedQuery, performSearch]); // ⚠️ performSearch recreates constantly
```

**In `usePlaybookSearch.ts`:**

```typescript
export function usePlaybookSearch(playbooks: Playbooks[]) {
  const search = useSearch<Playbooks>({
    data: playbooks, // ⚠️ New array reference every render
    filter: (
      p,
      q // ⚠️ New function reference every render
    ) =>
      (!!p.topic && p.topic.toLowerCase().includes(q.toLowerCase())) ||
      (!!p.course_name &&
        p.course_name.toLowerCase().includes(q.toLowerCase())),
  });
  return search;
}
```

**In `PlaybooksPage.tsx`:**

```typescript
const { playbooks } = usePlaybooks(user.id); // Returns Record<string, Playbooks>
const playbooksSearch = usePlaybookSearch(Object.values(playbooks)); // ⚠️ New array every render
```

### Why This Causes Infinite Loops

1. **Unstable data prop**: `Object.values(playbooks)` creates a new array reference on every render
2. **Unstable filter prop**: Inline arrow function creates new function reference on every render
3. **Cascading dependency updates**: Each callback depends on the previous unstable value
4. **useEffect triggers re-render**: The effect runs `performSearch`, which may trigger state updates
5. **Parent re-renders**: State updates cause parent to re-render, creating new array/function references
6. **Cycle repeats infinitely**: Steps 1-5 repeat until memory is exhausted

### Possible Causes

1. **Missing memoization**: `data` array and `filter` function not memoized in calling code
2. **Unstable dependencies**: `useCallback` dependencies include values that change every render
3. **Deep dependency chain**: Multiple nested callbacks depending on each other
4. **No reference equality checks**: Hook doesn't check if data content actually changed

### Solutions

#### Solution 1: Memoize Dependencies in Calling Code (Quick Fix)

Memoize the data array and filter function before passing to `useSearch`:

```typescript
export function usePlaybookSearch(playbooks: Playbooks[]) {
  const memoizedPlaybooks = useMemo(() => playbooks, [playbooks]);

  const filterFn = useCallback(
    (p: Playbooks, q: string) =>
      (!!p.topic && p.topic.toLowerCase().includes(q.toLowerCase())) ||
      (!!p.course_name &&
        p.course_name.toLowerCase().includes(q.toLowerCase())),
    []
  );

  return useSearch<Playbooks>({
    data: memoizedPlaybooks,
    filter: filterFn,
    minQueryLength: 3,
    debounceMs: 200,
  });
}
```

**Pros**: Minimal changes, fixes immediate issue
**Cons**: Requires changes in every usage, easy to forget

#### Solution 2: Fix useSearch Hook Internally (Recommended)

Make the hook resilient to unstable dependencies:

```typescript
export function useSearch<T>(opts: UseSearchOptions<T>): UseSearchResult<T> {
  const { data, filter, minQueryLength = 1, debounceMs = 250 } = opts;

  // Store data in ref to avoid dependency issues
  const dataRef = useRef(data);
  const filterRef = useRef(filter);

  useEffect(() => {
    dataRef.current = data;
    filterRef.current = filter;
  });

  const getData = useCallback(async (): Promise<T[]> => {
    if (typeof dataRef.current === "function") {
      const fn = dataRef.current as () => Promise<T[]>;
      return fn();
    }
    return dataRef.current as T[];
  }, []); // ✅ No dependencies

  const performSearch = useCallback(
    async (q: string) => {
      if (!q || q.length < minQueryLength) {
        setResults([]);
        setError(null);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const list = await getData();
        const filtered = list.filter((item) => filterRef.current(item, q));
        setResults(filtered);
        setHasSearched(true);
        setLastDataError(null);
      } catch (err: any) {
        setLastDataError(err);
        setError(err?.message ?? "An error occurred");
        setResults([]);
        setHasSearched(true);
      } finally {
        setIsLoading(false);
      }
    },
    [getData, minQueryLength] // ✅ Stable dependencies
  );

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]); // ✅ performSearch is now stable

  // ... rest of hook
}
```

**Pros**: Fixes root cause, works with any usage pattern, no changes needed in calling code
**Cons**: Slightly more complex implementation

#### Solution 3: Use Reducer Pattern

Replace multiple useState calls with useReducer for more predictable state updates:

```typescript
type SearchState<T> = {
  results: T[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  query: string;
  debouncedQuery: string;
};

type SearchAction<T> =
  | { type: "SET_QUERY"; payload: string }
  | { type: "SET_DEBOUNCED_QUERY"; payload: string }
  | { type: "SEARCH_START" }
  | { type: "SEARCH_SUCCESS"; payload: T[] }
  | { type: "SEARCH_ERROR"; payload: string }
  | { type: "CLEAR" };

// Use reducer to batch state updates and prevent cascading re-renders
```

**Pros**: More predictable state management, better performance
**Cons**: More code changes, higher complexity

### Recommended Fix

**Solution 2** is the best approach because:

- Fixes the root cause in the hook itself
- No changes needed in calling code (backward compatible)
- Prevents future issues with new usages
- Uses refs to maintain stable callback references
- Minimal performance overhead

### Testing the Fix

After implementing Solution 2:

1. Type in search bar → should not freeze
2. Search results should appear after debounce
3. Clear search → should reset results
4. Apply filters while searching → should work correctly
5. Test suite should pass without memory errors
6. Multiple rapid searches → should handle gracefully

### Additional Notes

- This is a common React pitfall with custom hooks that accept functions/arrays as props
- The debounce mechanism was working correctly but couldn't prevent the infinite loop
- The issue affects both PlaybooksPage and SessionsPage identically
- Memory exhaustion happens within seconds due to exponential re-render growth
- Similar issues could exist in other hooks that accept unstable dependencies
