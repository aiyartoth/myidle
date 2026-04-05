## Context

The game now has InventoryManager, EquipmentManager, and AttributeManager with full runtime state. Players need persistence across sessions. Cocos Creator 3.8.8 supports LocalStorage for web targets and native storage APIs for mobile builds.

Current runtime state to persist:
- Inventory: item IDs and counts per slot
- Equipment: equipped items by slot
- Base attributes: character stats
- Meta: save timestamp, version

## Goals / Non-Goals

**Goals:**
- Serialize complete game state to JSON
- Store in LocalStorage with save slot keys
- Load and restore all manager states
- Version the save format for future migrations
- Auto-save on inventory/equipment changes

**Non-Goals:**
- Cloud sync (only local storage)
- Encryption (plaintext JSON)
- Save screenshots or thumbnails
- Multiple character slots per save

## Decisions

### Decision: LocalStorage with prefixed keys
**Rationale**: Simple, widely supported, no async complexity. Alternative (IndexedDB) adds complexity without benefit for small JSON data (~KB range).

### Decision: Versioned save format with migration
**Rationale**: Save format will evolve. Storing version number enables upgrade paths. Migrations run on load before hydrating managers.

### Decision: SaveManager owns serialization, managers own state restoration
**Rationale**: Single responsibility. SaveManager reads from all managers, but managers provide methods to restore their state from save data.

### Decision: Debounced auto-save (500ms)
**Rationale**: Prevents rapid successive saves during batch operations while still being responsive.

## Risks / Trade-offs

- **[Risk] LocalStorage ~5MB limit** → Mitigation: Save data is small (items + equipment + stats). Add size check with warning.
- **[Risk] Data corruption from manual edits** → Mitigation: Version check fails gracefully, offers to reset or ignore
- **[Trade-off] No encryption** → Save files can be edited; acceptable for single-player idle game
