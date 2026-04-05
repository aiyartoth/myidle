## ADDED Requirements

### Requirement: Load item templates from configuration
The item template system SHALL load item definitions including ID, name, type, stack limit, and effects.

#### Scenario: Loading item database
- **WHEN** the game initializes with item configuration
- **THEN** all item templates SHALL be accessible by ID

### Requirement: Validate item existence
The item template system SHALL provide lookup with validation.

#### Scenario: Getting valid item template
- **WHEN** requesting template for existing item ID
- **THEN** template data SHALL be returned

#### Scenario: Invalid item ID returns null
- **WHEN** requesting template for non-existent item ID
- **THEN** null SHALL be returned

### Requirement: Support equipment and consumable types
The item template system SHALL distinguish item types for different behaviors.

#### Scenario: Equipment template lookup
- **WHEN** checking if item is equipment
- **THEN** template SHALL indicate type and equipment slot (if applicable)

#### Scenario: Consumable template lookup
- **WHEN** checking if item is consumable
- **THEN** template SHALL indicate type and usage effects (if applicable)
