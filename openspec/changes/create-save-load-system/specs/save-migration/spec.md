## ADDED Requirements

### Requirement: Version saves for migration
The migration system SHALL include version in all save data.

#### Scenario: New save gets current version
- **WHEN** new game is saved
- **THEN** save SHALL have current schema version

#### Scenario: Load detects version mismatch
- **WHEN** loading older version save
- **THEN** system SHALL detect version difference

### Requirement: Migrate old saves to new format
The migration system SHALL upgrade save data from older versions.

#### Scenario: Successful migration
- **WHEN** loading version 1 save into version 2 game
- **THEN** data SHALL be migrated before restoration

#### Scenario: Unsupported version handling
- **WHEN** loading save from newer version than game supports
- **THEN** system SHALL reject with appropriate error

### Requirement: Migration is non-destructive
The migration system SHALL preserve original save during migration.

#### Scenario: Migration failure recovery
- **WHEN** migration fails
- **THEN** original save data SHALL remain intact
