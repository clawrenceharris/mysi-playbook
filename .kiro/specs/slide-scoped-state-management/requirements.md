# Requirements Document

## Introduction

This feature introduces a slide-scoped state management system for the Playground Strategy builder. Each slide will maintain its own isolated data namespace (responses, assignments, assignmentResponses), and blocks can reference data from any slide through an intuitive UI with built-in data transformation capabilities.

## Glossary

- **Playground**: The activity builder interface where SI leaders create interactive learning activities
- **Slide**: A single phase/screen in an activity containing one or more blocks
- **Block**: An interactive component within a slide (e.g., collect-input, handout, display-variable)
- **Slide-Scoped State**: Data storage organized by slide ID, where each slide has its own namespace
- **State Accessor**: A standardized key for accessing slide data (responses, assignments, assignmentResponses)
- **Data Reference**: A configuration that specifies which slide and accessor to pull data from
- **Data Transformer**: A function that filters or transforms referenced data (e.g., "current user only", "all items", "count")
- **Variable Reference Field**: A UI component that allows users to select and configure data references
- **Collect Input Block**: A block type that gathers text, multiple choice, or other input from participants
- **Handout Block**: A block type that distributes items to participants
- **Display Variable Block**: A block type that shows data from state to participants

## Requirements

### Requirement 1: Slide-Scoped State Structure

**User Story:** As an SI leader, I want each slide to maintain its own data namespace so that I can clearly understand where data is stored and avoid naming conflicts.

#### Acceptance Criteria

1. WHEN THE System stores participant responses, THE System SHALL organize data by slide ID at the root level
2. WHEN THE System stores assignment data, THE System SHALL organize data by slide ID at the root level
3. WHEN THE System stores assignment responses, THE System SHALL organize data by slide ID at the root level
4. WHEN A Slide transitions to a different slide, THE System SHALL preserve all slide-scoped state data
5. WHEN THE System accesses slide-scoped data, THE System SHALL use the slide ID as the primary key

### Requirement 2: Standard State Accessors

**User Story:** As an SI leader, I want to use consistent, predictable names to access slide data instead of creating custom variable names.

#### Acceptance Criteria

1. THE System SHALL provide a "responses" accessor for accessing participant text and input responses from a slide
2. THE System SHALL provide an "assignments" accessor for accessing items assigned to participants in a slide
3. THE System SHALL provide an "assignmentResponses" accessor for accessing participant responses to assigned items in a slide
4. WHEN A Block references a state accessor, THE System SHALL resolve the data from the appropriate slide namespace
5. THE System SHALL NOT require users to create custom variable names for storing block data

### Requirement 3: Remove Custom Variable Configuration

**User Story:** As an SI leader, I want a simpler configuration interface without confusing checkboxes for saving to shared state.

#### Acceptance Criteria

1. THE Handout Block configuration panel SHALL NOT display a "Save to shared state" checkbox
2. THE Handout Block configuration panel SHALL NOT display a "Variable Name" input field
3. THE Collect Input Block configuration panel SHALL NOT display a "Save to shared state" checkbox
4. THE Collect Input Block configuration panel SHALL NOT display a "Variable Name" input field
5. WHEN A Block stores data, THE System SHALL automatically save it to the appropriate slide-scoped accessor

### Requirement 4: Cross-Slide Data Reference UI

**User Story:** As an SI leader, I want to select which slide's data to reference when configuring a block that displays or uses data from previous slides.

#### Acceptance Criteria

1. WHEN A User configures a data reference field, THE System SHALL display a dropdown of available slides
2. WHEN A User selects a slide, THE System SHALL display available state accessors for that slide
3. WHEN A User selects a state accessor, THE System SHALL display available data transformers
4. THE System SHALL show slide titles in the dropdown, not slide IDs
5. THE System SHALL disable slides that have no data available for the selected accessor
6. WHEN A Slide has not been executed yet, THE System SHALL indicate this in the dropdown with visual styling
7. THE System SHALL order slides chronologically in the dropdown based on slide order

### Requirement 5: Data Transformer Selection

**User Story:** As an SI leader, I want to transform referenced data to show only what's relevant (e.g., current user's response, all responses, count of responses).

#### Acceptance Criteria

1. THE System SHALL provide a "current user" transformer that filters data to the current participant's items
2. THE System SHALL provide an "all items" transformer that returns all data without filtering
3. THE System SHALL provide a "count" transformer that returns the number of items
4. THE System SHALL provide an "exclude current user" transformer that filters out the current participant's items
5. WHEN A User selects a transformer, THE System SHALL apply it during data resolution
6. THE System SHALL display transformer options based on the selected state accessor type
7. WHEN THE State accessor is "responses", THE System SHALL show transformers: "current user", "all items", "count", "exclude current user"
8. WHEN THE State accessor is "assignments", THE System SHALL show transformers: "current user", "all items", "count"
9. WHEN THE State accessor is "assignmentResponses", THE System SHALL show transformers: "current user", "all items", "count", "exclude current user"

### Requirement 6: Variable Reference Field Component

**User Story:** As an SI leader, I want a unified UI component for selecting data references across all block configuration panels.

#### Acceptance Criteria

1. THE System SHALL provide a reusable VariableReferenceField component for data reference configuration
2. WHEN A User interacts with the VariableReferenceField, THE Component SHALL display slide selection, accessor selection, and transformer selection in a logical flow
3. THE VariableReferenceField SHALL accept a value prop containing the complete data reference configuration
4. THE VariableReferenceField SHALL emit an onChange event with the updated data reference configuration
5. THE VariableReferenceField SHALL display the current selection in a human-readable format
6. WHEN NO Data reference is configured, THE VariableReferenceField SHALL display a placeholder prompt

### Requirement 7: Data Reference Resolution

**User Story:** As an SI leader, I want the system to automatically resolve data references when blocks are rendered so that participants see the correct data.

#### Acceptance Criteria

1. WHEN A Block renders with a data reference, THE System SHALL resolve the slide ID from the reference
2. WHEN THE System resolves a data reference, THE System SHALL access the specified state accessor for that slide
3. WHEN THE System retrieves slide data, THE System SHALL apply the specified transformer
4. WHEN THE Referenced slide has no data, THE System SHALL return an empty array
5. WHEN THE Data reference is invalid, THE System SHALL display an error message to the SI leader in preview mode
6. THE System SHALL resolve data references in real-time as state updates during activity execution

### Requirement 8: Backward Compatibility

**User Story:** As an SI leader with existing activities, I want my current activities to continue working after the system update.

#### Acceptance Criteria

1. WHEN THE System encounters a custom variable name in an existing activity, THE System SHALL attempt to resolve it from root-level state
2. WHEN THE System cannot resolve a custom variable, THE System SHALL check for slide-scoped data with matching keys
3. THE System SHALL log a deprecation warning when custom variable names are used
4. THE System SHALL provide a migration path for converting custom variables to slide-scoped references
5. WHEN AN Existing activity uses the old "saveToSharedState" configuration, THE System SHALL ignore this setting and use slide-scoped storage

### Requirement 9: Preview Mode Data Visualization

**User Story:** As an SI leader, I want to see which slides have data available when configuring data references in preview mode.

#### Acceptance Criteria

1. WHEN A User is in preview mode, THE System SHALL indicate which slides have collected data
2. WHEN A Slide has responses data, THE System SHALL display a badge or indicator on that slide in the reference dropdown
3. WHEN A Slide has assignments data, THE System SHALL display a badge or indicator on that slide in the reference dropdown
4. WHEN A Slide has no data, THE System SHALL display it as disabled or grayed out in the reference dropdown
5. THE System SHALL update data availability indicators in real-time as the preview progresses through slides

### Requirement 10: State Structure Migration

**User Story:** As a developer, I want the state structure to be organized by slide ID so that data access is predictable and scalable.

#### Acceptance Criteria

1. THE System SHALL structure state as: `state[slideId].responses[userId-uuid]`
2. THE System SHALL structure state as: `state[slideId].assignments[userId]`
3. THE System SHALL structure state as: `state[slideId].assignmentResponses[assignmentId]`
4. WHEN A Block saves data, THE System SHALL determine the current slide ID from context
5. WHEN A Block reads data, THE System SHALL access the appropriate slide namespace
6. THE System SHALL maintain the phase property at the root level for slide navigation
7. THE System SHALL NOT store slide-scoped data at the root level except for backward compatibility
