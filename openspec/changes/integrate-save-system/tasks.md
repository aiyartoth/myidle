## 1. Default Save Generator

- [x] 1.1 Create `DefaultSaveGenerator.ts` with demo item templates
- [x] 1.2 Create `DefaultSaveGenerator.ts` with demo equipment templates
- [x] 1.3 Implement `generateDefaultState(): GameState` returning starter inventory/equipment

## 2. Main.ts Integration

- [x] 2.1 Import all managers and types in Main.ts
- [x] 2.2 Initialize ItemManager with demo templates in `start()`
- [x] 2.3 Initialize InventoryManager with ItemManager's template table
- [x] 2.4 Initialize AttributeManager with equipment table
- [x] 2.5 Initialize EquipmentManager with dependencies
- [x] 2.6 Initialize SaveManager with managers
- [x] 2.7 Implement `loadOrCreateSave()` method
- [x] 2.8 Call `loadOrCreateSave()` in `start()` and enable auto-save
