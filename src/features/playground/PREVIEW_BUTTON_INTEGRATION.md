# Preview Button Integration

## Summary

Added the missing preview button to the Playground UI, allowing users to test their activities before deploying them to live sessions.

## Changes Made

### 1. Updated `PlaygroundPage.tsx`

**Added:**

- Preview button in top navigation bar
- State management for preview dialog (`isPreviewOpen`)
- Activity object construction from current slides
- Export configuration for preview
- Integration with `ActivityPreviewDialog`

**Key Features:**

- Button is disabled when no slides exist
- Activity metadata is calculated from slides (duration, etc.)
- Shared state is passed to preview
- Clean UI with Play icon

### 2. Updated `ActivityPreviewDialog.tsx`

**Added:**

- `open` and `onOpenChange` props for dialog control
- Dialog wrapper with proper header and description
- Conditional compilation (only when dialog is open)
- Proper Dialog component structure

**Before:**

```typescript
export interface ActivityPreviewDialogProps {
  activity: ImprovedStrategy;
  config: ActivityExportConfig;
}
```

**After:**

```typescript
export interface ActivityPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: ImprovedStrategy;
  config: ActivityExportConfig;
}
```

## UI Location

The preview button is located in the **top navigation bar** of the Playground page:

```
┌─────────────────────────────────────────────────────┐
│ Activity Builder          [Preview Activity Button] │
├─────────────────────────────────────────────────────┤
│ Sidebar │ Editor Area │ Toolbar                     │
│         │             │                             │
└─────────────────────────────────────────────────────┘
```

## User Flow

1. User builds activity with slides and blocks
2. User clicks "Preview Activity" button
3. Dialog opens showing:
   - Participant View (how students see it)
   - Host View (how SI leader controls it)
   - Debug Tools (state inspector, event log)
4. User can test interactions and see state changes
5. User can restart activity to test again
6. User closes dialog to continue editing

## Technical Details

### Activity Construction

The current activity is constructed from the slide builder state:

```typescript
const currentActivity: ImprovedStrategy = {
  id: "preview-activity",
  name: "Preview Activity",
  slides,
  settings: {
    allowParticipantNavigation: false,
    showProgress: true,
    autoSave: false,
  },
  sharedState,
  metadata: {
    estimatedDuration: slides.reduce(
      (total, slide) => total + (slide.timing?.estimatedDuration || 0),
      0
    ),
    participantCount: 30,
  },
};
```

### Export Configuration

Default configuration for preview:

```typescript
const exportConfig: ActivityExportConfig = {
  slug: "preview-activity",
  title: "Preview Activity",
  autoAdvancePhases: false,
  requireAllResponses: false,
  enableLateJoin: true,
  preserveStateOnRestart: false,
};
```

## Testing

All existing tests pass:

- ✅ ActivityPreviewDialog unit tests (4 tests)
- ✅ PreviewExecutionEngine unit tests (5 tests)
- ✅ Preview System integration tests (15 tests)

**Total: 24 tests passing**

## Benefits

1. **Immediate Feedback**: SI leaders can test activities before using them in sessions
2. **Error Detection**: Catch configuration issues early
3. **State Inspection**: Debug complex shared state scenarios
4. **Event Tracking**: See all events that would fire during execution
5. **Multi-View Testing**: Test both participant and host perspectives

## Future Enhancements

Potential improvements:

1. **Save Preview Sessions**: Allow saving preview sessions for later review
2. **Multi-Participant Simulation**: Simulate multiple participants at once
3. **Breakout Room Testing**: Test breakout room functionality
4. **Performance Metrics**: Show timing and performance data
5. **Export Preview Report**: Generate a report of the preview session
6. **Comparison Mode**: Compare different versions of an activity

## Related Files

- `src/app/(app)/playground/PlaygroundPage.tsx` - Main playground page
- `src/features/playground/compiler/ActivityPreviewDialog.tsx` - Preview dialog component
- `src/features/playground/compiler/PreviewExecutionEngine.ts` - Preview engine
- `src/features/playground/compiler/ActivityCompiler.tsx` - Activity compiler
- `COMPONENT_AUDIT.md` - Component classification document
- `TYPE_SYSTEM_CLARIFICATION.md` - Type system documentation

## Screenshots

### Preview Button Location

The button appears in the top-right of the playground, next to the "Activity Builder" title.

### Preview Dialog

The dialog shows three tabs:

1. **Participant View** - How students see the activity
2. **Host View** - How SI leaders control the activity
3. **Debug Tools** - State inspector and event log

---

**Status**: ✅ Complete  
**Date**: 2025-01-23  
**Impact**: High - Enables testing before deployment
