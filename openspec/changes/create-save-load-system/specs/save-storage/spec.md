## ADDED Requirements

### Requirement: Store saves in LocalStorage
The storage system SHALL persist save data to LocalStorage with prefixed keys.

#### Scenario: Save to slot
- **WHEN** player saves to slot 1
- **THEN** data SHALL be stored with key "idle-save-1"

#### Scenario: Load from slot
- **WHEN** player loads from slot 2
- **THEN** system SHALL read from key "idle-save-2"

### Requirement: Support multiple save slots
The storage system SHALL support at least 3 save slots.

#### Scenario: List available saves
- **WHEN** requesting save slot list
- **THEN** system SHALL return metadata for all existing saves

#### Scenario: Delete save slot
- **WHEN** player deletes slot 1
- **THEN** LocalStorage key "idle-save-1" SHALL be removed

### Requirement: Save metadata tracking
The storage system SHALL track save timestamp and play time.

#### Scenario: Save includes timestamp
- **WHEN** game is saved
- **THEN** timestamp SHALL be stored with save data
