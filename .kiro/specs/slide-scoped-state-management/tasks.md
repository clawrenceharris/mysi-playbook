# Implementation Plan

- [x] 1. Create core data reference types and utilities

  - Create TypeScript interfaces for DataReference, StateAccessor, and DataTransformer
  - Implement transformer functions (all, currentUser, count, excludeCurrentUser)
  - Create utility functions for formatting display strings
  - _Requirements: 2.1, 2.2, 2.3, 5.1, 5.2, 5.3, 5.4_

- [x] 2. Update state structure and types

  - [x] 2.1 Update ExtendedStrategyState interface to support slide-scoped data

    - Modify PlayfieldContext state type to include slide ID indexing
    - Maintain phase property at root level
    - Add type guards for slide-scoped vs legacy state
    - _Requirements: 1.1, 1.2, 1.3, 10.1, 10.2, 10.3, 10.6_

  - [x] 2.2 Update SharedStateManager for slide-scoped operations
    - Implement getSlideState method
    - Implement setSlideState method
    - Implement mergeSlideState method
    - Update existing methods to work with slide-scoped structure
    - _Requirements: 1.4, 1.5, 10.4, 10.5_

- [x] 3. Implement data transformer functions

  - [x] 3.1 Create transformer function implementations

    - Implement 'all' transformer (pass-through)
    - Implement 'currentUser' transformer with userId filtering
    - Implement 'count' transformer for arrays and objects
    - Implement 'excludeCurrentUser' transformer
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]\* 3.2 Write unit tests for transformers
    - Test each transformer with various data types
    - Test edge cases (empty data, null, undefined)
    - Test userId filtering logic
    - Test count accuracy
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 4. Update variable resolver for slide-scoped references

  - [x] 4.1 Extend resolveVariable to handle DataReference objects

    - Add type guard to detect DataReference vs string
    - Implement slide-scoped data resolution
    - Apply transformer to resolved data
    - Maintain backward compatibility with string references
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.2_

  - [x] 4.2 Implement legacy variable resolution fallback

    - Check root-level state for custom variable names
    - Check all slide namespaces if not found at root
    - Log deprecation warnings for legacy usage
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 4.3 Write unit tests for variable resolver
    - Test slide-scoped resolution
    - Test legacy variable resolution
    - Test invalid references
    - Test transformer application
    - Test backward compatibility
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2_

- [x] 5. Create DataReferenceSelector component

  - [x] 5.1 Implement base component structure

    - Create component with slide, accessor, and transformer selection
    - Implement value prop and onChange handler
    - Add placeholder support
    - Add disabled state support
    - _Requirements: 6.1, 6.3, 6.4, 6.6_

  - [x] 5.2 Implement slide selection dropdown

    - Display available slides with titles
    - Order slides chronologically
    - Show data availability indicators
    - Disable slides with no data for selected accessor
    - _Requirements: 4.1, 4.4, 4.5, 4.6, 4.7, 9.1, 9.2, 9.3, 9.4_

  - [x] 5.3 Implement accessor selection dropdown

    - Show available accessors (responses, assignments, assignmentResponses)
    - Filter based on slide data availability
    - Update when slide selection changes
    - _Requirements: 4.2, 5.6, 5.7, 5.8, 5.9_

  - [x] 5.4 Implement transformer selection dropdown

    - Show transformer options based on accessor type
    - Display human-readable transformer names
    - Update when accessor selection changes
    - _Requirements: 4.3, 5.5_

  - [x] 5.5 Implement display string formatting

    - Format selection as "Slide → Accessor → Transformer"
    - Show in human-readable format
    - Update in real-time as selections change
    - _Requirements: 6.2, 6.5_

  - [x] 5.6 Write component tests for DataReferenceSelector
    - Test rendering with various props
    - Test slide selection flow
    - Test accessor selection flow
    - Test transformer selection flow
    - Test display string formatting
    - Test disabled states
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 6. Update HandoutConfig component

  - [x] 6.1 Remove saveToSharedState checkbox and variableName input

    - Remove checkbox UI element
    - Remove input field UI element
    - Remove related state management
    - Remove related event handlers
    - _Requirements: 3.1, 3.2_

  - [x] 6.2 Replace dataSource field with DataReferenceSelector

    - Replace VariableReferenceField with DataReferenceSelector
    - Update onChange handler to work with DataReference
    - Update value prop to pass DataReference
    - _Requirements: 4.1, 4.2, 4.3, 6.1_

  - [ ]\* 6.3 Write component tests for updated HandoutConfig
    - Test rendering without saveToSharedState checkbox
    - Test DataReferenceSelector integration
    - Test onChange behavior
    - _Requirements: 3.1, 3.2_

- [x] 7. Update CollectInputConfig component

  - [x] 7.1 Remove saveToSharedState checkbox and variableName input

    - Remove checkbox UI element
    - Remove input field UI element
    - Remove related state management
    - Remove related event handlers
    - _Requirements: 3.3, 3.4_

  - [x] 7.2 Write component tests for updated CollectInputConfig
    - Test rendering without saveToSharedState fields
    - Verify automatic slide-scoped storage
    - _Requirements: 3.3, 3.4, 3.5_

- [x] 8. Update DisplayVariableConfig component

  - [x] 8.1 Replace variableName input with DataReferenceSelector

    - Replace VariableReferenceField with DataReferenceSelector
    - Update onChange handler to work with DataReference
    - Update value prop to pass DataReference
    - Support both DataReference and string for backward compatibility
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 8.2 Write component tests for updated DisplayVariableConfig
    - Test DataReferenceSelector integration
    - Test onChange behavior
    - Test display of selected reference
    - Test backward compatibility with string references
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 9. Update block renderers to use slide-scoped state

  - [x] 9.1 Update CollectInput block to save to slide-scoped state

    - Determine current slide ID from context
    - Save responses to state[slideId].responses
    - Use userId-uuid format for keys
    - _Requirements: 1.1, 3.5, 10.4_

  - [x] 9.2 Update Handout block to save to slide-scoped state

    - Determine current slide ID from context
    - Save assignments to state[slideId].assignments
    - Save assignment responses to state[slideId].assignmentResponses
    - Update to use SharedStateManager methods
    - _Requirements: 1.2, 1.3, 10.4_

  - [x] 9.3 Update DisplayVariable block to resolve slide-scoped references

    - Use updated resolveVariable with DataReference
    - Handle both legacy string and new DataReference formats
    - Display resolved data
    - _Requirements: 7.1, 7.2, 7.3, 7.6_

  - [ ]\* 9.4 Write integration tests for block state management
    - Test CollectInput saving to slide-scoped state
    - Test Handout saving to slide-scoped state
    - Test DisplayVariable resolving slide-scoped references
    - Test cross-slide data flow
    - _Requirements: 1.1, 1.2, 1.3, 7.1, 7.2, 7.3_

- [x] 10. Implement preview mode data availability indicators

  - [x] 10.1 Create SlideStateInfo utility

    - Implement function to analyze slide state
    - Determine which accessors have data
    - Count items per accessor
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 10.2 Update DataReferenceSelector to show data indicators

    - Display badges for slides with data
    - Show different indicators per accessor type
    - Update in real-time as preview progresses
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 10.3 Write tests for preview mode indicators
    - Test data availability detection
    - Test real-time updates
    - Test indicator display
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 11. Update ParticipantStateManager for preview mode

  - [x] 11.1 Update state structure to use slide-scoped format

    - Modify rebuildSharedState to organize by slide ID
    - Update aggregateStateField to work with slide namespaces
    - Maintain phase at root level
    - _Requirements: 1.1, 1.2, 1.3, 10.6_

  - [x] 11.2 Add methods for slide-scoped state access

    - Implement getSlideState method
    - Implement updateSlideState method
    - Update existing methods to work with new structure
    - _Requirements: 1.4, 1.5_

  - [ ]\* 11.3 Write tests for ParticipantStateManager updates
    - Test slide-scoped state organization
    - Test state aggregation
    - Test multi-participant scenarios
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 12. Update compiler to generate slide-scoped state handlers

  - [x] 12.1 Update StartFunctionGenerator event listeners

    - Add event listeners for slide-state-update events
    - Add event listeners for slide-state-merge events
    - Handle slide-scoped state updates in event handlers
    - _Requirements: 1.1, 1.2, 1.3, 10.4, 10.5_

  - [x] 12.2 Update UIComponentGenerator to pass slide context

    - Pass current slide object to BlockRenderer
    - Ensure blocks have access to slide context
    - BlockRenderer already uses slide.id for state operations
    - _Requirements: 7.1, 10.4_

  - [ ]\* 12.3 Write integration tests for compiled activities
    - Test state updates with slide IDs
    - Test event handling
    - Test cross-slide data flow in compiled activities
    - _Requirements: 1.1, 1.2, 1.3, 7.1, 7.2, 7.3_

- [ ] 13. Create migration documentation

  - [ ] 13.1 Document migration process

    - Create guide for converting custom variables to slide-scoped references
    - Document new DataReferenceSelector usage
    - Provide examples of before/after configurations
    - Document backward compatibility approach
    - _Requirements: 8.4_

- [ ]\* 14. End-to-end integration testing
  - Create multi-slide activity with data flow
  - Test data collection in slide 1
  - Test data reference in slide 2 with various transformers
  - Test preview mode with multiple participants
  - Test backward compatibility with legacy activities
  - Verify all transformers work correctly
  - Test error handling for invalid references
  - _Requirements: All requirements_
