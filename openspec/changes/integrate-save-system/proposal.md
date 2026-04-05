## Why

The save system is implemented but not integrated into the game flow. Players need automatic save loading on game start, default data for new games, and demonstration of the complete item/save system.

## What Changes

- Modify `Main.ts` to initialize and auto-load save slot 0 on start
- Create default game data generator for new saves
- Add demo data with sample items and equipment
- Enable auto-save for seamless experience

## Capabilities

### New Capabilities
- `default-save-generator`: Generate initial game data with starter items
- `main-integration`: Main.ts orchestrates manager initialization and save loading

### Modified Capabilities
<!-- No existing capabilities to modify -->

## Impact

- Modified: `assets/Main.ts` - adds initialization logic
- New: `assets/Controller/DefaultSaveGenerator.ts` - creates demo data
