## 1. Type Definitions

- [x] 1.1 Create `assets/types/save.ts` with `GameState` interface
- [x] 1.2 Add `SaveMetadata` interface (timestamp, version, slot)
- [x] 1.3 Define `SaveData` interface combining state and metadata

## 2. Save Manager Core

- [x] 2.1 Create `SaveManager.ts` with constructor accepting all managers
- [x] 2.2 Implement `serialize(): GameState` to extract state from managers
- [x] 2.3 Implement `deserialize(data: GameState): boolean` to restore state
- [x] 2.4 Add `getCurrentVersion(): number` for version tracking

## 3. LocalStorage Integration

- [x] 3.1 Implement `saveToSlot(slot: number): boolean` with LocalStorage.setItem
- [x] 3.2 Implement `loadFromSlot(slot: number): GameState | null` with LocalStorage.getItem
- [x] 3.3 Implement `deleteSlot(slot: number): void`
- [x] 3.4 Implement `listSaves(): SaveMetadata[]` to enumerate existing saves

## 4. Auto-Save Feature

- [x] 4.1 Add debounced auto-save method (500ms delay)
- [x] 4.2 Subscribe to InventoryManager "inventory-changed" events
- [x] 4.3 Subscribe to EquipmentManager "equipment-changed" events
- [x] 4.4 Implement `enableAutoSave(slot: number)` and `disableAutoSave()`

## 5. Migration System

- [x] 5.1 Create `migration/v1-to-v2.ts` placeholder
- [x] 5.2 Implement `migrate(data: any, fromVersion: number): GameState`
- [x] 5.3 Add version validation on load (reject newer versions)

## 6. Manager State Restoration

- [x] 6.1 Add `restoreState(state: InventoryState)` method to InventoryManager
- [x] 6.2 Add `restoreState(state: EquipmentState)` method to EquipmentManager
- [x] 6.3 Add `setBaseAttrs(attrs: Partial<Record<AttrId, number>>)` to support for character stats

## 7. Integration Test

- [x] 7.1 Create test verifying save → clear → load restores identical state
- [x] 7.2 Test auto-save triggers on inventory changes
- [x] 7.3 Test save slot isolation (slot 1 doesn't affect slot 2)
