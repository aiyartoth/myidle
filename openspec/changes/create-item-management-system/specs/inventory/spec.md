## ADDED Requirements

### Requirement: Inventory stores items with stack limits
The inventory system SHALL store items in slots, each with an item ID and count, respecting per-item stack limits.

#### Scenario: Adding items within stack limit
- **WHEN** 5 potions are added to inventory and potion stack limit is 10
- **THEN** inventory contains one slot with 5 potions

#### Scenario: Adding items beyond stack limit creates new stack
- **WHEN** 15 potions are added to inventory and potion stack limit is 10
- **THEN** inventory contains two slots: one with 10 potions, one with 5 potions

### Requirement: Inventory has maximum capacity
The inventory system SHALL enforce a maximum number of slots (default 20).

#### Scenario: Adding items when inventory full
- **WHEN** an item is added and inventory has no empty slots and no stackable space
- **THEN** the add operation SHALL return false and item SHALL NOT be added

### Requirement: Removing items from inventory
The inventory system SHALL support removing items by ID and count.

#### Scenario: Removing existing items
- **WHEN** removing 3 potions from a slot containing 5
- **THEN** slot now contains 2 potions

#### Scenario: Removing all items from slot clears it
- **WHEN** removing all remaining potions from a slot
- **THEN** slot becomes empty and available for new items

### Requirement: Inventory emits change events
The inventory system SHALL emit events on add, remove, and slot changes.

#### Scenario: Event on item add
- **WHEN** items are successfully added
- **THEN** an "inventory-changed" event SHALL fire with change details
