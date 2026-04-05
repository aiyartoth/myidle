## ADDED Requirements

### Requirement: Equip items to valid slots
The equipment system SHALL allow equipping items only to their designated equipment slots.

#### Scenario: Equipping weapon to weapon slot
- **WHEN** a weapon item is equipped
- **THEN** it SHALL occupy the weapon slot and be removed from inventory

#### Scenario: Equipping armor to wrong slot fails
- **WHEN** attempting to equip armor to weapon slot
- **THEN** the operation SHALL fail and item SHALL remain in inventory

### Requirement: Unequip items returns to inventory
The equipment system SHALL return unequipped items to inventory when possible.

#### Scenario: Unequipping with inventory space
- **WHEN** unequipping an item and inventory has space
- **THEN** item SHALL be added to inventory and slot becomes empty

#### Scenario: Unequipping with full inventory fails
- **WHEN** unequipping an item but inventory is full
- **THEN** the operation SHALL fail and item SHALL remain equipped

### Requirement: Swap equipment in slot
The equipment system SHALL support swapping equipped items with inventory items.

#### Scenario: Swapping weapons
- **WHEN** equipping a new weapon with one already equipped
- **THEN** old weapon SHALL return to inventory and new weapon SHALL be equipped

### Requirement: Integrate with AttributeManager
The equipment system SHALL notify AttributeManager of equipment changes.

#### Scenario: Stats update on equip
- **WHEN** equipping an item with stat modifiers
- **THEN** AttributeManager SHALL recalculate final attributes

#### Scenario: Stats update on unequip
- **WHEN** unequipping an item
- **THEN** AttributeManager SHALL recalculate final attributes without that item's modifiers
