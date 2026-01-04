# Requirements Document

## Introduction

The Assignment Distribution Block feature enables SI leaders to dynamically assign items from arrays (such as student responses, questions, or tasks) to individual participants during live Playfield sessions. This system supports collaborative learning patterns like Snowball (peer review), Jigsaw (distributed expertise), and Think-Pair-Share by providing a flexible, host-controlled mechanism for distributing content to participants. The feature extends the Playfield Strategy Builder with a new block type that handles variable interpolation, assignment distribution, and participant-specific content display.

## Glossary

- **Playfield**: The feature that enables online session interactivity where SI strategies are executed
- **Playfield Strategy**: A custom or pre-existing SI strategy that can be run in the Playfield, composed of building blocks
- **Strategy Builder**: The visual interface for creating and configuring Playfield Strategies using drag-and-drop blocks
- **Assignment Block**: A specialized block type that distributes array items to participants
- **Distribution Mode**: The algorithm used to assign items to participants (one-per-participant, round-robin, random, exclude-own)
- **Host Controls**: The interface available only to the SI leader for controlling strategy execution
- **Participant View**: The interface shown to students participating in the Playfield session
- **Variable Interpolation**: The process of replacing template variables (e.g., `{{student_responses}}`) with actual runtime data
- **Strategy State**: The runtime data structure containing all strategy execution information including participant responses and assignments

## Requirements

### Requirement 1

**User Story:** As an SI leader, I want to insert dynamic variables into strategy blocks that reference runtime data, so that I can display collected responses and other state information to participants.

#### Acceptance Criteria

1. WHEN THE SI leader types `{{variable_name}}` in a block's content THEN THE Playfield SHALL recognize it as a variable placeholder
2. WHEN THE Playfield renders a block with variables THEN THE Playfield SHALL replace variable placeholders with actual runtime data
3. WHEN a variable references an array THEN THE Playfield SHALL display all items in the array by default
4. WHEN a variable path uses dot notation (e.g., `{{state.responses.current_user}}`) THEN THE Playfield SHALL resolve nested data paths
5. IF a variable reference is invalid or data is unavailable THEN THE Playfield SHALL display a helpful error message instead of the raw template syntax

### Requirement 2

**User Story:** As an SI leader, I want to add an Assignment Display block to my Playfield Strategy, so that I can distribute items from an array to individual participants for review or response.

#### Acceptance Criteria

1. WHEN THE SI leader drags an Assignment Display block onto the canvas THEN THE Strategy Builder SHALL add the block to the strategy flow
2. WHEN THE SI leader configures the Assignment Display block THEN THE Strategy Builder SHALL provide options for data source, distribution mode, and display settings
3. WHEN THE SI leader sets the data source to `{{student_responses}}` THEN THE Strategy Builder SHALL validate that the variable exists in the strategy state
4. WHEN THE SI leader selects a distribution mode THEN THE Strategy Builder SHALL show a preview of how items will be distributed
5. WHEN THE SI leader saves the block configuration THEN THE Strategy Builder SHALL store all settings in the block definition

### Requirement 3

**User Story:** As an SI leader, I want to trigger assignment distribution during a live Playfield session, so that I can control when participants receive their assigned items.

#### Acceptance Criteria

1. WHEN THE strategy reaches an Assignment Display block THEN THE Playfield SHALL display an "Assign" button in the host controls
2. WHEN THE SI leader clicks the "Assign" button THEN THE Playfield SHALL execute the configured distribution algorithm
3. WHEN assignments are created THEN THE Playfield SHALL store the assignment mapping in the strategy state
4. WHEN assignments are complete THEN THE Playfield SHALL update all participant views to show their assigned items
5. IF THE SI leader clicks "Assign" again THEN THE Playfield SHALL prompt for confirmation before reassigning

### Requirement 4

**User Story:** As an SI leader, I want to choose how items are distributed to participants, so that I can support different pedagogical patterns like peer review and jigsaw activities.

#### Acceptance Criteria

1. WHEN THE SI leader selects "one-per-participant" mode THEN THE Playfield SHALL assign each participant exactly one item if available
2. WHEN THE SI leader selects "round-robin" mode THEN THE Playfield SHALL distribute items evenly, cycling through participants
3. WHEN THE SI leader selects "random" mode THEN THE Playfield SHALL shuffle items before distributing them evenly
4. WHEN THE SI leader selects "exclude-own" mode THEN THE Playfield SHALL ensure each participant receives items they did not create
5. WHEN THE SI leader configures the block THEN THE Strategy Builder SHALL provide options for handling item-participant mismatches (allow multiple items per participant, allow some participants to have no items, or require manual adjustment)
6. WHEN there are more items than participants and "allow multiple" is enabled THEN THE Playfield SHALL distribute extra items evenly across participants
7. WHEN there are fewer items than participants and "allow empty" is enabled THEN THE Playfield SHALL leave some participants without assignments
8. WHEN there is a mismatch at runtime and manual adjustment is required THEN THE Playfield SHALL display a warning to the host with distribution options before assigning

### Requirement 5

**User Story:** As a student, I want to see only the items assigned to me, so that I can focus on reviewing or responding to my specific assignment without distraction.

#### Acceptance Criteria

1. WHEN THE Assignment Display block is active and assignments exist THEN THE Playfield SHALL display only my assigned items
2. WHEN I have multiple assigned items THEN THE Playfield SHALL display them in a clear, organized list
3. WHEN assignments have not been created yet THEN THE Playfield SHALL display a waiting message
4. WHEN I view my assigned item THEN THE Playfield SHALL show the full content without revealing the author's identity (if configured)
5. IF I have no assigned items THEN THE Playfield SHALL display an appropriate empty state message

### Requirement 6

**User Story:** As an SI leader, I want to see an overview of all assignments, so that I can verify the distribution and monitor which participants have which items.

#### Acceptance Criteria

1. WHEN assignments are created THEN THE Playfield SHALL display an assignment overview in the host view
2. WHEN viewing the assignment overview THEN THE Playfield SHALL show each participant's name with their assigned items
3. WHEN viewing assigned items THEN THE Playfield SHALL display a preview or summary of each item
4. WHEN a participant has no assignment THEN THE Playfield SHALL indicate this clearly in the overview
5. IF THE SI leader needs to reassign THEN THE Playfield SHALL provide a "Clear & Reassign" button

### Requirement 7

**User Story:** As an SI leader, I want to configure whether participants can see who created the items they're reviewing, so that I can support both anonymous and attributed peer review.

#### Acceptance Criteria

1. WHEN THE SI leader configures the Assignment Display block THEN THE Strategy Builder SHALL provide a "Show Author" toggle option
2. WHEN "Show Author" is enabled THEN THE Playfield SHALL display the creator's name with each assigned item
3. WHEN "Show Author" is disabled THEN THE Playfield SHALL hide all author information from participants
4. WHEN viewing the host overview THEN THE Playfield SHALL always show author information regardless of the participant setting
5. IF author information is unavailable THEN THE Playfield SHALL display "Anonymous" or similar placeholder

### Requirement 8

**User Story:** As an SI leader, I want participants to be able to respond to their assigned items, so that I can facilitate activities like building on peer responses or providing feedback.

#### Acceptance Criteria

1. WHEN THE SI leader enables "Allow Participant Response" in block configuration THEN THE Playfield SHALL display a response input below each assigned item
2. WHEN a participant submits a response to an assigned item THEN THE Playfield SHALL store the response with a reference to the original item
3. WHEN THE SI leader views participant responses THEN THE Playfield SHALL show which assigned item each response relates to
4. WHEN a participant has multiple assigned items THEN THE Playfield SHALL allow separate responses for each item
5. IF a participant has not responded THEN THE Playfield SHALL indicate incomplete responses in the host view

### Requirement 9

**User Story:** As a developer, I want the assignment system to integrate seamlessly with the existing strategy state management, so that assignments persist correctly and synchronize across all participants.

#### Acceptance Criteria

1. WHEN assignments are created THEN THE Playfield SHALL store assignment data in the strategy state structure
2. WHEN the strategy state updates THEN THE Playfield SHALL synchronize assignment data to all participants via Stream.io
3. WHEN a participant joins mid-strategy THEN THE Playfield SHALL load existing assignments from the strategy state
4. WHEN the strategy completes THEN THE Playfield SHALL persist assignment data to the database
5. IF synchronization fails THEN THE Playfield SHALL retry and display an error to the host if unsuccessful

### Requirement 10

**User Story:** As an SI leader, I want to preview how the Assignment Display block will work before using it in a live session, so that I can verify my configuration is correct.

#### Acceptance Criteria

1. WHEN THE SI leader previews a strategy with an Assignment Display block THEN THE Playfield SHALL simulate the assignment process
2. WHEN previewing THEN THE Playfield SHALL use mock participant data to demonstrate distribution
3. WHEN THE SI leader changes distribution mode in preview THEN THE Playfield SHALL update the preview immediately
4. WHEN previewing with insufficient data THEN THE Playfield SHALL display a warning about missing items or participants
5. IF the data source variable is invalid THEN THE Playfield SHALL show an error in the preview
