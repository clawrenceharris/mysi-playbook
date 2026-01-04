# Implementation Plan

- [x] 1. Create Participant State Manager

  - Create `ParticipantStateManager` class with methods for managing mock participants
  - Implement `addParticipant()`, `removeParticipant()`, and `setCurrentParticipant()` methods
  - Implement `getParticipantState()` and `updateParticipantState()` methods
  - Implement `getSharedState()` and `updateSharedState()` methods
  - Add `rebuildSharedState()` method to aggregate participant states into shared state
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Create React Context for Participant Manager

  - Create `ParticipantManagerContext` with provider component
  - Create `useParticipantManager()` hook for accessing the manager
  - Initialize manager with 3 default mock participants
  - Ensure context is available in preview mode
  - _Requirements: 3.1, 3.2_

- [x] 3. Simplify BlockRenderer response storage logic

  - [x] 3.1 Update `handleSubmit` function in BlockRenderer

    - Remove unnecessary `hasCustomVariable` check
    - Use `saveToSharedState` flag to determine storage location
    - Store in custom variable when `saveToSharedState` is true and `variableName` exists
    - Store in default `responses[blockId]` structure when `saveToSharedState` is false
    - Add error logging when `saveToSharedState` is true but `variableName` is missing
    - _Requirements: 4.1, 4.2, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 3.2 Update `CollectInputBlock` to use simplified storage
    - Remove any custom variable checks from the component
    - Rely on parent `handleSubmit` for storage logic
    - Ensure existing response retrieval works with both storage methods
    - _Requirements: 4.1, 4.2_

- [x] 4. Update Variable Resolver for custom variables

  - [x] 4.1 Enhance `resolveVariable` function

    - Check root level of state for custom variables before dot notation
    - Convert userId-uuid object structures to arrays of AssignmentItem format
    - Extract authorId from userId-uuid keys
    - Return empty array for missing custom variables
    - _Requirements: 4.3, 4.4, 4.5, 6.1, 6.2, 10.1, 10.2_

  - [x] 4.2 Update `interpolateVariable` function
    - Ensure custom variables are formatted correctly for display
    - Handle both array and object formats
    - Show appropriate empty message when variable is undefined
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Create Avatar Selector Component

  - Create `AvatarSelector` component with participant buttons
  - Display circular avatar images for each participant
  - Highlight active participant with border and ring
  - Add "Add Participant" button with plus icon
  - Show current participant name
  - Handle participant selection clicks
  - _Requirements: 2.1, 2.2, 2.3, 9.2_

- [x] 6. Create Participant Preview View Component

  - [x] 6.1 Build `ParticipantPreviewView` component

    - Integrate `AvatarSelector` at the top
    - Render blocks using `BlockRenderer` with participant context
    - Create participant-specific context with correct userId and state
    - Handle participant switching and state updates
    - _Requirements: 2.3, 2.4, 2.5, 2.6_

  - [x] 6.2 Implement participant context creation
    - Set `userId` to current participant ID
    - Set `isHost` to false
    - Provide shared state from participant manager
    - Create mock call object for event handling
    - Include `mockParticipants` array in context
    - _Requirements: 2.4, 3.3, 8.1_

- [x] 7. Create Host Preview View Component

  - Create `HostPreviewView` component
  - Render blocks with host context
  - Display host-specific controls for Handout blocks
  - Show participant count badge
  - Create host context with `isHost: true`
  - _Requirements: 1.3, 9.3, 9.4_

- [x] 8. Create Preview Tabs Component

  - [x] 8.1 Build `PreviewTabs` wrapper component

    - Use shadcn Tabs component
    - Create "Participant View" and "Host View" tabs
    - Render `ParticipantPreviewView` in participant tab
    - Render `HostPreviewView` in host tab
    - Handle tab switching
    - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.5_

  - [x] 8.2 Integrate tabs into ActivityPreview
    - Replace existing preview content with `PreviewTabs`
    - Ensure participant manager context wraps the tabs
    - Maintain existing preview functionality
    - _Requirements: 1.1, 1.4, 1.5_

- [ ] 9. Implement Mock Call for Preview

  - Create `createMockCall` function
  - Handle `assignments-created` events
  - Handle `assignments-cleared` events
  - Update shared state when events are sent
  - Log events for debugging
  - _Requirements: 1.4, 8.1, 8.2, 8.3_

- [x] 10. Update Handout Block Renderer

  - Ensure Handout block resolves custom variables correctly
  - Verify assigned items are filtered per participant
  - Test with both custom variables and default responses
  - Ensure empty states display correctly
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 11. Update Variable Display Block Renderer

  - Ensure Variable Display resolves custom variables from root level
  - Verify responses update immediately when submitted
  - Test formatting of userId-uuid structures
  - Show appropriate empty message when no responses exist
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 12. Add state synchronization

  - Ensure participant state updates trigger shared state rebuild
  - Verify all blocks re-render when shared state changes
  - Test assignment creation updates both tab views
  - Ensure switching participants loads correct state
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]\* 13. Add comprehensive testing

  - [ ]\* 13.1 Write unit tests for ParticipantStateManager

    - Test adding and removing participants
    - Test switching current participant
    - Test updating participant state
    - Test rebuilding shared state
    - Test custom variable aggregation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]\* 13.2 Write unit tests for Variable Resolver updates

    - Test resolving custom variables from root level
    - Test converting userId-uuid objects to arrays
    - Test extracting authorId from keys
    - Test handling missing variables
    - _Requirements: 4.3, 4.4, 4.5, 10.1, 10.2_

  - [ ]\* 13.3 Write unit tests for BlockRenderer storage logic

    - Test storing in custom variable when configured
    - Test storing in default responses when not configured
    - Test error handling for missing variableName
    - _Requirements: 4.1, 4.2, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]\* 13.4 Write integration tests for preview flow
    - Test complete flow: Collect Input → Handout → Variable Display
    - Test submitting responses as different participants
    - Test creating assignments in host view
    - Test viewing assignments in participant view
    - Test switching between participants maintains state
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 14. Wire everything together
  - Verify tab switching works smoothly
  - Test participant creation and switching
  - Verify responses are stored and displayed correctly
  - Test assignment creation and distribution
  - Ensure both views update when state changes
  - Test complete handout workflow end-to-end
  - _Requirements: All requirements_
