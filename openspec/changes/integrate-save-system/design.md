## Context

SaveManager exists with full functionality (save/load, auto-save, migration). Main.ts currently only has basic boilerplate. The game needs a proper initialization flow.

Current managers to wire up:
- ItemManager - item templates
- InventoryManager - item storage
- EquipmentManager - equipping
- AttributeManager - stat calculations
- SaveManager - persistence

## Goals / Non-Goals

**Goals:**
- Auto-load slot 0 on game start
- Generate starter save if none exists
- Enable auto-save on slot 0
- Provide demo items/equipment for testing

**Non-Goals:**
- No UI implementation (only data layer)
- No character selection screen
- No multiple save slot UI

## Decisions

### Decision: Slot 0 as auto-save slot
**Rationale**: Slot 0 reserved for current playthroughs. Slots 1-3 available for manual saves.

### Decision: Demo items in starter save
**Rationale**: Provides immediate testing capability without gameplay loop.

### Decision: Main.ts as orchestrator
**Rationale**: Cocos Creator entry point pattern. Keeps manager wiring in one place.

## Risks / Trade-offs

- **[Risk] Corrupted slot 0 blocks startup** → Mitigation: Detect and regenerate if corrupted
