## Why

The game currently has character attributes and equipment defined in types, but no system to manage items in inventory, handle item usage, or equip/unequip items. An item management system is needed to support core idle game loops like looting, inventory management, and equipment progression.

## What Changes

- Create `InventoryManager` class to manage item storage and operations
- Create `ItemManager` class to handle item templates and item spawning
- Create `EquipmentManager` class to handle equip/unequip operations (integrates with existing `AttributeManager`)
- Add inventory UI support with item slots, tooltips, and equipment panel
- Support item stacking, consumption, and equipment slot validation

## Capabilities

### New Capabilities
- `inventory`: Core inventory storage, add/remove items, stack management
- `item-templates`: Item definition loading and template management
- `equipment-slots`: Equip/unequip items, slot validation, equipment bonuses integration
- `item-ui`: Inventory UI components and interactions

### Modified Capabilities
<!-- No existing capabilities to modify -->

## Impact

- New files in `assets/Controller/`: `InventoryManager.ts`, `ItemManager.ts`, `EquipmentManager.ts`
- New types in `assets/types/types.ts` for inventory-related interfaces
- New UI scene/prefab files for inventory interface
- Integrates with existing `AttributeManager` for equipment stat calculations
