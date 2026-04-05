## ADDED Requirements

### Requirement: Generate starter save data
The generator SHALL create default game state with demo items.

#### Scenario: New game initialization
- **WHEN** no save exists in slot 0
- **THEN** generator SHALL create starter inventory and equipment

#### Scenario: Starter items provided
- **WHEN** default save is generated
- **THEN** it SHALL include demo weapons, armor, and consumables
