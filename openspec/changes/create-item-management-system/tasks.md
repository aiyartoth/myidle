## 1. Inventory Manager Core

- [x] 1.1 Create `InventoryManager.ts` with private slots array and max capacity
- [x] 1.2 Implement `addItem(itemId: string, count: number): boolean` with stack limit handling
- [x] 1.3 Implement `removeItem(itemId: string, count: number): boolean`
- [x] 1.4 Implement `getInventory(): InventorySlot[]` for UI access
- [x] 1.5 Add `EventTarget` and emit "inventory-changed" events

## 2. Item Manager

- [x] 2.1 Create `ItemManager.ts` with item template loading
- [x] 2.2 Implement `loadTemplates(templates: ItemTemplate[])`
- [x] 2.3 Implement `getTemplate(itemId: string): ItemTemplate | null`
- [x] 2.4 Add helper `isEquipment(itemId): boolean` and `getEquipmentSlot(itemId): EquipmentSlot | null`

## 3. Equipment Manager

- [x] 3.1 Create `EquipmentManager.ts` constructor accepting InventoryManager and AttributeManager
- [x] 3.2 Implement `equip(itemId: string, fromSlot?: number): boolean` with slot validation
- [x] 3.3 Implement `unequip(slot: EquipmentSlot): boolean` with inventory space check
- [x] 3.4 Implement `getEquipped(): EquippedMap` for current equipment state
- [x] 3.5 Integrate with AttributeManager on equip/unequip to recalculate stats

## 4. Type Extensions

- [x] 4.1 Add `InventorySlot` interface to `assets/types/types.ts` (if not already present)
- [x] 4.2 Ensure `ItemTemplate` includes `stackLimit: number` field
- [x] 4.3 Add any missing type definitions for manager methods

## 5. Integration Test

- [x] 5.1 Create test script verifying: add item → equip → stats updated → unequip → stats reverted
- [x] 5.2 Verify stack splitting works correctly
- [x] 5.3 Verify inventory full rejection works
