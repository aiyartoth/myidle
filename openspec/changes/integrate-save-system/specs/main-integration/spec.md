## ADDED Requirements

### Requirement: Auto-load save on game start
Main.ts SHALL load save data when the game starts.

#### Scenario: Existing save loaded
- **WHEN** game starts and slot 0 has valid save
- **THEN** all managers SHALL restore to saved state

#### Scenario: New game created
- **WHEN** game starts and slot 0 is empty
- **THEN** default save SHALL be generated and loaded

### Requirement: Enable auto-save
Main.ts SHALL enable auto-save to slot 0 on initialization.

#### Scenario: Auto-save active
- **WHEN** game is running and state changes
- **THEN** auto-save SHALL persist changes to slot 0

### Requirement: Initialize all managers
Main.ts SHALL create and wire all managers at startup.

#### Scenario: Complete initialization
- **WHEN** game starts
- **THEN** ItemManager, InventoryManager, EquipmentManager, AttributeManager, and SaveManager SHALL be initialized
