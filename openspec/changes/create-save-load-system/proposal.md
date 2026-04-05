## Why

The game currently has inventory and equipment systems but no persistence. Player progress is lost on game restart. A save/load system is essential for an idle game to retain player investment and enable long-term progression.

## What Changes

- Create `SaveManager` class to handle serialization/deserialization of game state
- Implement `GameState` interface defining all persistable data (inventory, equipment, base stats)
- Support save slots (multiple save files)
- Auto-save on key events (item pickup, equip, level up)
- Manual save/load UI integration points
- Import/export save data for backup/cloud sync support

## Capabilities

### New Capabilities
- `save-serialization`: Convert runtime game state to/from JSON with version handling
- `save-storage`: LocalStorage-based persistence with save slot management
- `auto-save`: Trigger saves on inventory/equipment changes
- `save-migration`: Handle version upgrades when save format changes

### Modified Capabilities
<!-- No existing capabilities to modify -->

## Impact

- New file: `assets/Controller/SaveManager.ts`
- New file: `assets/types/save.ts` for save-related type definitions
- Integration points in InventoryManager and EquipmentManager for auto-save triggers
- No breaking changes to existing systems
