# Requirements Document

## Introduction

The Handout Preview Improvements feature enhances the preview functionality for the Assignment Display (Handout) block in the Playground. Currently, the preview has limitations in displaying both participant and host views, and there are issues with how responses are stored and displayed when using custom variables for shared state. This feature addresses these gaps by providing a tab-based dual-view preview mode with participant state management, and fixing the variable resolution logic to ensure responses are correctly stored and displayed regardless of whether they use custom variables or the default responses structure.

## Glossary

- **Handout Block**: Previously called "Assignment Display Block", a block type that distributes array items to participants
- **Preview Mode**: The simulation environment where SI leaders can test their activity before running it live
- **Participant View**: The interface shown to students participating in the activity
- **Host View**: The interface shown to the SI leader controlling the activity
- **Mock Participant**: A simulated participant created for testing in preview mode
- **Participant State**: Individual state data for each mock participant including their responses and assignments
- **Custom Variable**: A user-defined variable name for storing responses in shared state (e.g., `student_ideas` instead of `responses`)
- **Shared State**: The runtime data structure containing all activity execution information
- **Variable Resolution**: The process of retrieving data from shared state using variable names
- **Block Renderer**: The component responsible for rendering different block types in the Playfield
- **Collect Input Block**: A block type that collects text responses from participants

## Requirements

### Requirement 1

**User Story:** As an SI leader, I want to switch between participant view and host view using tabs in preview mode, so that I can understand how the handout block will appear to both roles during a live session.

#### Acceptance Criteria

1. WHEN THE SI leader previews an activity with a Handout block THEN THE Preview SHALL display tabs for "Participant View" and "Host View"
2. WHEN THE SI leader clicks the "Participant View" tab THEN THE Preview SHALL display the participant perspective
3. WHEN THE SI leader clicks the "Host View" tab THEN THE Preview SHALL display the host controls and overview
4. WHEN assignments are created in preview THEN THE Preview SHALL update both tab views to reflect the assignment state
5. IF THE activity has not reached the Handout block THEN THE Preview SHALL show appropriate waiting states in the active tab

### Requirement 2

**User Story:** As an SI leader, I want to create and switch between different mock participants in preview mode, so that I can verify that each participant sees only their assigned items.

#### Acceptance Criteria

1. WHEN THE SI leader opens the Participant View tab THEN THE Preview SHALL display a row of avatar buttons representing mock participants
2. WHEN THE SI leader clicks the "Add Participant" button THEN THE Preview SHALL create a new mock participant and add an avatar button
3. WHEN THE SI leader clicks a participant avatar button THEN THE participant view SHALL update to show that participant's perspective
4. WHEN viewing as a specific participant THEN THE Preview SHALL display only items assigned to that participant
5. WHEN THE SI leader switches participants THEN THE Preview SHALL maintain each participant's individual state
6. IF a participant has no assigned items THEN THE Preview SHALL display the appropriate empty state

### Requirement 3

**User Story:** As a developer, I want to implement participant state management in preview mode, so that each mock participant maintains their own responses and view state independently.

#### Acceptance Criteria

1. WHEN a mock participant is created THEN THE Preview SHALL initialize a separate state object for that participant
2. WHEN a participant submits a response THEN THE Preview SHALL store the response in that participant's state
3. WHEN THE SI leader switches between participants THEN THE Preview SHALL load the appropriate participant state
4. WHEN assignments are created THEN THE Preview SHALL update all participant states with their assigned items
5. IF a participant is removed THEN THE Preview SHALL clean up that participant's state

### Requirement 4

**User Story:** As a developer, I want the BlockRenderer to correctly store responses using custom variables when configured, so that responses are accessible for handout distribution and variable display.

#### Acceptance Criteria

1. WHEN a Collect Input block has `saveToSharedState` enabled THEN THE BlockRenderer SHALL store responses using the custom variable name
2. WHEN a Collect Input block does not have `saveToSharedState` enabled THEN THE BlockRenderer SHALL store responses in the default `responses` structure
3. WHEN responses are stored in a custom variable THEN THE Variable Resolver SHALL retrieve them using the custom variable name
4. WHEN a Handout block references a custom variable as its data source THEN THE BlockRenderer SHALL resolve the variable correctly
5. IF a custom variable is configured but empty THEN THE Variable Resolver SHALL return an empty array

### Requirement 5

**User Story:** As an SI leader, I want responses from Collect Input blocks to display correctly in Variable Display blocks, so that I can show collected responses to participants when using custom variable names.

#### Acceptance Criteria

1. WHEN a Variable Display block references a custom variable THEN THE BlockRenderer SHALL display all responses stored in that variable
2. WHEN responses are submitted in preview mode THEN THE Variable Display block SHALL update immediately to show the new responses
3. WHEN responses are stored with user IDs as keys THEN THE Variable Display SHALL format them as a readable list
4. WHEN multiple participants submit responses to the same custom variable THEN THE Variable Display SHALL show all responses
5. IF no responses exist for a variable THEN THE Variable Display SHALL show an appropriate empty message

### Requirement 6

**User Story:** As an SI leader, I want the Handout block to correctly resolve custom variables as data sources, so that I can distribute responses collected with custom variable names.

#### Acceptance Criteria

1. WHEN a Handout block's data source is set to a custom variable THEN THE BlockRenderer SHALL resolve the variable from shared state
2. WHEN responses are stored in a custom variable THEN THE Handout block SHALL access them for distribution
3. WHEN assignments are created THEN THE Handout block SHALL use the resolved items from the custom variable
4. WHEN a participant views their assignment THEN THE BlockRenderer SHALL display items from the custom variable
5. IF the custom variable does not exist or is empty THEN THE Handout block SHALL display a validation warning

### Requirement 7

**User Story:** As a developer, I want to remove unnecessary conditional checks for custom variables in the BlockRenderer, so that the code is simpler and responses are always stored correctly.

#### Acceptance Criteria

1. WHEN a Collect Input block is configured THEN THE BlockRenderer SHALL determine storage location based solely on the `saveToSharedState` flag
2. WHEN `saveToSharedState` is true THEN THE BlockRenderer SHALL use the `variableName` property for storage
3. WHEN `saveToSharedState` is false THEN THE BlockRenderer SHALL use the default `responses[blockId]` structure
4. WHEN storing responses THEN THE BlockRenderer SHALL not perform redundant checks for custom variable existence
5. IF `saveToSharedState` is true but `variableName` is missing THEN THE BlockRenderer SHALL log an error and fall back to default storage

### Requirement 8

**User Story:** As an SI leader, I want clear visual distinction between participant and host views in preview mode, so that I can easily understand which perspective I'm viewing.

#### Acceptance Criteria

1. WHEN THE preview displays tabs THEN THE Preview SHALL label each tab clearly as "Participant View" or "Host View"
2. WHEN viewing the Participant View tab THEN THE Preview SHALL show the participant avatar selector and the selected participant's name
3. WHEN viewing the Host View tab THEN THE Preview SHALL show host-specific controls and assignment overview
4. WHEN THE SI leader interacts with host controls THEN THE Preview SHALL visually indicate the action is from the host
5. IF the active tab changes THEN THE Preview SHALL update the content to match the selected view

### Requirement 9

**User Story:** As a developer, I want the Variable Resolver to handle both custom variables and default response structures consistently, so that variable references work regardless of storage method.

#### Acceptance Criteria

1. WHEN resolving a custom variable name THEN THE Variable Resolver SHALL check the root level of shared state
2. WHEN resolving the `responses` accessor THEN THE Variable Resolver SHALL aggregate responses from the responses structure
3. WHEN a variable path uses dot notation THEN THE Variable Resolver SHALL traverse the state object correctly
4. WHEN a variable does not exist THEN THE Variable Resolver SHALL return undefined or an empty array as appropriate
5. IF a variable contains nested objects THEN THE Variable Resolver SHALL flatten them for display

### Requirement 10

**User Story:** As an SI leader, I want to test the complete handout workflow in preview mode, so that I can verify responses are collected, distributed, and displayed correctly before running a live session.

#### Acceptance Criteria

1. WHEN THE SI leader previews an activity with Collect Input → Handout → Display Variable blocks THEN THE Preview SHALL execute the complete flow
2. WHEN responses are submitted by different mock participants THEN THE Preview SHALL make them available for handout distribution
3. WHEN assignments are created THEN THE Preview SHALL distribute responses to mock participants
4. WHEN viewing assigned items as different participants THEN THE Preview SHALL display the correct response content for each
5. IF responses are stored in custom variables THEN THE Preview SHALL handle the entire flow without errors
