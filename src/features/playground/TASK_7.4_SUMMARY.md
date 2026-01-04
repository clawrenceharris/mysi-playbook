# Task 7.4: Functional Preview UI Implementation

## Overview

**Task Added**: Implement functional preview UI with actual block rendering  
**Current State**: Preview shows placeholder text  
**Goal**: Make preview fully interactive and functional

## What's Missing

The preview dialog currently shows:

```
"Participant view would render here"
"Host controls would render here"
```

Users cannot:

- See their blocks rendered
- Interact with blocks (submit responses, vote, etc.)
- Navigate through phases
- Test the activity flow

## What Needs to Be Done

### 1. Participant View

- Replace placeholder with `BlockRenderer` component
- Render all blocks from current phase
- Handle block responses (input submission, voting)
- Add phase navigation (Next/Previous buttons)
- Show current phase information

### 2. Host View

- Replace placeholder with `BlockHostControl` components
- Show response counts and participant data
- Add phase management controls
- Display current phase status

### 3. Enhanced Debug View

- Add phase navigation controls
- Keep existing state inspector
- Keep existing event log
- Show phase progression

### 4. Progress Indicator

- Add visual progress bar
- Show current phase number
- Display total phases

## Implementation Details

**File to Modify**: `src/features/playground/compiler/ActivityPreviewDialog.tsx`

**Components to Use**:

- `BlockRenderer` - Already exists, renders blocks
- `BlockHostControl` - Already exists, shows host controls
- `PreviewExecutionEngine` - Already exists, manages state

**Key Functions to Add**:

- `handleBlockResponse()` - Process block interactions
- `handleNextPhase()` - Navigate to next phase
- `handlePreviousPhase()` - Navigate to previous phase
- `canGoNext` / `canGoPrevious` - Navigation guards

## Benefits

1. **Testing**: SI leaders can test activities before deployment
2. **Confidence**: See exactly how activity will behave
3. **Error Detection**: Catch issues early
4. **Learning**: Understand block-to-playfield mapping
5. **Iteration**: Quick feedback loop for improvements

## Documentation

**Detailed Spec**: `src/features/playground/compiler/__tests__/FUNCTIONAL_PREVIEW_SPEC.md`

This spec includes:

- Complete code examples
- Step-by-step implementation guide
- Testing checklist
- Future enhancement ideas

## Task Location

**Spec File**: `.kiro/specs/playground-to-playfield-bridge/tasks.md`  
**Task Number**: 7.4  
**Status**: Not Started  
**Priority**: Immediate (blocks user testing)

## Next Steps

1. Review the detailed specification
2. Implement participant view rendering
3. Implement host view controls
4. Add phase navigation
5. Test with all block types
6. Update integration tests if needed

---

**Created**: 2025-01-23  
**Status**: Ready for Implementation  
**Estimated Effort**: 4-6 hours
