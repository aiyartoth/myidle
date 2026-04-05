## ADDED Requirements

### Requirement: Inventory UI displays item slots
The inventory UI SHALL render all inventory slots with item icons and counts.

#### Scenario: Rendering populated inventory
- **WHEN** inventory UI opens with items in slots
- **THEN** all slots SHALL display item icons and stack counts

#### Scenario: Rendering empty slot
- **WHEN** inventory UI renders an empty slot
- **THEN** slot SHALL appear empty or with placeholder

### Requirement: Equipment panel displays equipped items
The equipment UI SHALL show current equipment in each slot (weapon, armor, helmet, accessory).

#### Scenario: Rendering equipment panel
- **WHEN** equipment panel opens
- **THEN** all equipped items SHALL display in their respective slots

### Requirement: Item tooltip on hover
The item UI SHALL display tooltips showing item details on hover/long-press.

#### Scenario: Hovering over item
- **WHEN** user hovers over an inventory item
- **THEN** tooltip SHALL show name, type, and stat bonuses (if any)

### Requirement: Drag-drop for equipping
The item UI SHALL support drag-and-drop to equip items.

#### Scenario: Dragging equipment to slot
- **WHEN** dragging weapon to weapon slot
- **THEN** item SHALL be equipped and UI SHALL update

### Requirement: UI updates on inventory changes
The item UI SHALL refresh when inventory changes via code.

#### Scenario: Inventory event triggers UI update
- **WHEN** inventory-changed event fires
- **THEN** UI SHALL refresh affected slots
