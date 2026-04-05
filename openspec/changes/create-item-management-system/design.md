## Context

The project is a Cocos Creator 3.8.8 idle game with an existing AttributeManager that calculates character stats from base attributes, equipment, and buffs. The types.ts file already defines ItemTemplate, EquipmentTemplate, EquipmentSlot, and BuffInstance interfaces.

Current gaps:
- No runtime storage for inventory items
- No equipment/unequipment logic
- No item usage (consumables)
- No UI for inventory or equipment management

## Goals / Non-Goals

**Goals:**
- Provide runtime inventory storage with stack limits
- Enable equipping items to character slots and calculating derived stats
- Support item consumption for consumable items
- Prepare integration points for UI components

**Non-Goals:**
- Full UI implementation (only data layer and integration points)
- Save/load persistence (in-memory only for this change)
- Crafting or item upgrade systems
- Trading or multiplayer features

## Decisions

### Decision: InventoryManager owns the storage
**Rationale**: Centralized storage makes it easier to enforce stack limits and handle item uniqueness constraints. Alternative (distributed storage per item type) would add complexity without benefit.

### Decision: EquipmentManager handles equip/unequip
**Rationale**: Separating equipment logic from InventoryManager maintains single responsibility. EquipmentManager coordinates between InventoryManager (items) and AttributeManager (stats).

### Decision: Items reference templates by ID, not embedded data
**Rationale**: Matches existing equipment system pattern in AttributeManager. Reduces memory usage and allows live template updates.

### Decision: Event-driven updates for UI
**Rationale**: Cocos Creator uses component-based architecture. Events allow UI components to subscribe to inventory changes without direct coupling.

## Risks / Trade-offs

- **[Risk] Memory usage with large inventories** → Mitigation: Implement max inventory size limit, lazy-load item templates
- **[Risk] Events may be missed if UI not initialized** → Mitigation: UI components query current state on `start()` before subscribing
- **[Trade-off] In-memory only** → No persistence across game restarts; acceptable for initial implementation
