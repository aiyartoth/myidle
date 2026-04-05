## ADDED Requirements

### Requirement: Auto-save on state changes
The auto-save system SHALL trigger saves when inventory or equipment changes.

#### Scenario: Item pickup triggers auto-save
- **WHEN** item is added to inventory
- **THEN** debounced auto-save SHALL trigger within 500ms

#### Scenario: Equipment change triggers auto-save
- **WHEN** item is equipped or unequipped
- **THEN** auto-save SHALL trigger

### Requirement: Debounced auto-save
The auto-save system SHALL debounce rapid successive changes.

#### Scenario: Multiple rapid changes
- **WHEN** 5 items are added in rapid succession
- **THEN** only one auto-save SHALL occur after debounce period

### Requirement: Manual save override
The auto-save system SHALL allow manual save at any time.

#### Scenario: Manual save during debounce
- **WHEN** player manually saves during debounce window
- **THEN** immediate save SHALL occur and pending auto-save SHALL be cancelled
