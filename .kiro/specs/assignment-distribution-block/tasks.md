# Implementation Plan

- [x] 1. Create variable interpolation system

  - Implement variable parser to extract `{{variable}}` syntax from content
  - Create variable resolver with dot notation path support
  - Add predefined variable accessors (current_user, assignments.current, student_responses, etc.)
  - Implement error handling for invalid variable references
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Implement distribution engine core

  - [x] 2.1 Create distribution engine interface and types

    - Define DistributionEngine interface with distribute, validate, and preview methods
    - Create DistributionConfig, AssignmentMap, and related type definitions
    - Define DistributionMode and MismatchHandling enums
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x] 2.2 Implement distribution algorithms

    - Code one-per-participant distribution algorithm
    - Code round-robin distribution algorithm
    - Code random distribution algorithm
    - Code exclude-own (Snowball) distribution algorithm
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 2.3 Add distribution validation logic
    - Implement validation for empty items/participants
    - Add mismatch detection (more/fewer items than participants)
    - Create validation for exclude-own mode edge cases
    - Generate helpful warnings and error messages
    - _Requirements: 4.5, 4.6, 4.7, 4.8_

- [x] 3. Extend strategy state management

  - Add assignments field to PreviewState and ExtendedStrategyState types
  - Add assignmentResponses field for tracking participant responses to assigned items
  - Update PreviewExecutionEngine to handle assignment state updates
  - Ensure assignment state syncs via Stream.io custom events
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 4. Create Assignment Display block type

  - [x] 4.1 Add block type and configuration

    - Add "assignment-display" to BlockType enum
    - Create AssignmentDisplayConfig interface with all configuration options
    - Add "assignment" to BlockCategory enum
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 4.2 Implement Assignment Display block renderer

    - Create AssignmentDisplayBlock component in BlockRenderer
    - Implement variable resolution for data source
    - Filter items to show only assigned items for current participant
    - Add waiting state component for before assignments are created
    - Add empty state component for participants with no assignments
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [x] 4.3 Add assigned item display components
    - Create AssignedItemCard component
    - Implement author visibility toggle based on configuration
    - Add response input when allowParticipantResponse is enabled
    - Handle response submission to assigned items
    - _Requirements: 5.4, 7.2, 7.3, 8.1, 8.2, 8.4_

- [x] 5. Implement host controls for assignments

  - [x] 5.1 Create assignment host control component

    - Add AssignmentHostControl component in BlockHostControl
    - Display "Assign" button when assignments don't exist
    - Add distribution mode selector dropdown
    - Implement assignment trigger logic
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 5.2 Build assignment overview display

    - Create AssignmentOverview component showing all assignments
    - Display participant names with their assigned items
    - Show item previews/summaries in overview
    - Indicate participants with no assignments
    - Add "Clear & Reassign" button when allowReassignment is enabled
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 5.3 Add mismatch handling UI
    - Create modal for manual mismatch resolution
    - Display validation warnings and errors to host
    - Provide options for handling mismatches at runtime
    - Show distribution preview before committing
    - _Requirements: 4.8, 10.4_

- [x] 7. Integrate with Strategy Builder

  - Add Assignment Display block to block palette
  - Create configuration panel for Assignment Display block
  - Add variable editor/selector for data source field
  - Implement distribution mode configuration UI
  - Add mismatch handling and display options to config panel
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 7.1_

- [x] 8. Add preview functionality

  - Extend ActivityPreview to support assignment blocks
  - Generate mock participants for preview mode
  - Simulate assignment distribution in preview
  - Show both participant and host views in preview
  - Display validation warnings for invalid configurations
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 9. Update ActivityCompiler

  - Add compilation logic for assignment-display blocks
  - Validate variable references during compilation
  - Generate proper PlayfieldDefinition with assignment support
  - Ensure assignment state is included in compiled output
  - _Requirements: 1.5, 2.3, 9.1_

- [ ]\* 10. Add comprehensive testing

  - [ ]\* 10.1 Write unit tests for variable resolver

    - Test variable parsing from content
    - Test dot notation path resolution
    - Test predefined accessors
    - Test error handling for invalid variables
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]\* 10.2 Write unit tests for distribution engine

    - Test each distribution algorithm
    - Test validation logic
    - Test mismatch handling scenarios
    - Test edge cases (empty items, single participant, etc.)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]\* 10.3 Write integration tests for assignment flow

    - Test end-to-end assignment creation and display
    - Test participant response submission
    - Test reassignment functionality
    - Test state synchronization
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 8.2, 9.2_

  - [ ]\* 10.4 Write preview tests
    - Test preview with various item/participant ratios
    - Test preview with different distribution modes
    - Test preview with invalid configurations
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 11. Wire everything together
  - Connect variable resolver to BlockRenderer for all block types
  - Integrate distribution engine with host controls
  - Connect assignment state to Stream.io event handlers
  - Update strategy execution flow to handle assignment events
  - Ensure all components work together in live preview
  - _Requirements: All requirements_
