/**
 * 存档管理器：处理游戏状态的序列化、存储和加载
 */
import type {
  GameState,
  SaveData,
  SaveMetadata,
  SaveListItem,
  LoadResult,
} from "../types/save";
import { SAVE_VERSION, SAVE_KEY_PREFIX } from "../types/save";
import type { InventoryManager } from "./InventoryManager";
import type { EquipmentManager } from "./EquipmentManager";
import { sys } from "cc";

export interface SaveManagerOptions {
  inventoryManager: InventoryManager;
  equipmentManager: EquipmentManager;
}

export class SaveManager {
  private inventoryManager: InventoryManager;
  private equipmentManager: EquipmentManager;
  private autoSaveSlot: number | null = null;
  private autoSaveTimer: number | null = null;
  private readonly debounceMs = 500;
  private boundInventoryHandler: (() => void) | null = null;
  private boundEquipmentHandler: (() => void) | null = null;

  constructor(options: SaveManagerOptions) {
    this.inventoryManager = options.inventoryManager;
    this.equipmentManager = options.equipmentManager;
  }

  /**
   * 获取当前存档版本
   */
  getCurrentVersion(): number {
    return SAVE_VERSION;
  }

  /**
   * 序列化当前游戏状态
   */
  serialize(): GameState {
    return {
      inventory: this.serializeInventory(),
      equipment: this.serializeEquipment(),
      character: this.serializeCharacter(),
    };
  }

  /**
   * 序列化背包状态
   */
  private serializeInventory(): GameState["inventory"] {
    return {
      slots: this.inventoryManager.getInventory(),
      maxSlots: 20, // 从配置或 getter 获取
    };
  }

  /**
   * 序列化装备状态
   */
  private serializeEquipment(): GameState["equipment"] {
    return {
      equipped: this.equipmentManager.getEquipped(),
    };
  }

  /**
   * 序列化角色状态
   */
  private serializeCharacter(): GameState["character"] {
    return {
      baseAttrs: {}, // 由外部设置，或在选项中添加 CharacterManager
    };
  }

  /**
   * 反序列化并恢复游戏状态
   */
  deserialize(data: GameState): boolean {
    try {
      this.deserializeInventory(data.inventory);
      this.deserializeEquipment(data.equipment);
      return true;
    } catch (error) {
      console.error("[SaveManager] Failed to deserialize:", error);
      return false;
    }
  }

  /**
   * 恢复背包状态
   */
  private deserializeInventory(state: GameState["inventory"]): void {
    this.inventoryManager.restoreState(state);
  }

  /**
   * 恢复装备状态
   */
  private deserializeEquipment(state: GameState["equipment"]): void {
    this.equipmentManager.restoreState(state);
  }

  /**
   * 保存到指定槽位
   */
  saveToSlot(slot: number): boolean {
    try {
      const state = this.serialize();
      const meta: SaveMetadata = {
        slot,
        version: SAVE_VERSION,
        timestamp: Date.now(),
      };
      const saveData: SaveData = { meta, state };
      const key = this.getSaveKey(slot);
      const json = JSON.stringify(saveData);
      sys.localStorage.setItem(key, json);
      console.log(`[SaveManager] Saved to slot ${slot}`);
      return true;
    } catch (error) {
      console.error(`[SaveManager] Failed to save to slot ${slot}:`, error);
      return false;
    }
  }

  /**
   * 从指定槽位加载
   */
  loadFromSlot(slot: number): LoadResult {
    try {
      const key = this.getSaveKey(slot);
      const json = sys.localStorage.getItem(key);
      if (!json) {
        return { success: false, error: "Save not found" };
      }
      const data: SaveData = JSON.parse(json);

      // 版本检查
      if (data.meta.version > SAVE_VERSION) {
        return {
          success: false,
          error: `Save version ${data.meta.version} is newer than game version ${SAVE_VERSION}`
        };
      }

      // 迁移旧版本
      if (data.meta.version < SAVE_VERSION) {
        const migrated = this.migrate(data, data.meta.version);
        if (!migrated) {
          return { success: false, error: "Migration failed" };
        }
        return { success: true, data: migrated };
      }

      return { success: true, data };
    } catch (error) {
      console.error(`[SaveManager] Failed to load from slot ${slot}:`, error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * 删除存档
   */
  deleteSlot(slot: number): void {
    const key = this.getSaveKey(slot);
    sys.localStorage.removeItem(key);
    console.log(`[SaveManager] Deleted slot ${slot}`);
  }

  /**
   * 列出所有存档
   */
  listSaves(): SaveListItem[] {
    const saves: SaveListItem[] = [];
    for (let slot = 1; slot <= 3; slot++) {
      const result = this.loadFromSlot(slot);
      if (result.success && result.data) {
        saves.push({
          ...result.data.meta,
          exists: true,
        });
      } else {
        saves.push({
          slot,
          version: SAVE_VERSION,
          timestamp: 0,
          exists: false,
        });
      }
    }
    return saves;
  }

  /**
   * 启用自动保存
   */
  enableAutoSave(slot: number): void {
    this.autoSaveSlot = slot;
    this.bindEvents();
    console.log(`[SaveManager] Auto-save enabled for slot ${slot}`);
  }

  /**
   * 禁用自动保存
   */
  disableAutoSave(): void {
    this.autoSaveSlot = null;
    this.unbindEvents();
    this.cancelPendingAutoSave();
    console.log("[SaveManager] Auto-save disabled");
  }

  /**
   * 是否启用了自动保存
   */
  isAutoSaveEnabled(): boolean {
    return this.autoSaveSlot !== null;
  }

  /**
   * 绑定事件监听
   */
  private bindEvents(): void {
    this.boundInventoryHandler = () => this.triggerAutoSave();
    this.boundEquipmentHandler = () => this.triggerAutoSave();
    this.inventoryManager.on("inventory-changed", this.boundInventoryHandler);
    this.equipmentManager.on("equipment-changed", this.boundEquipmentHandler);
  }

  /**
   * 解绑事件监听
   */
  private unbindEvents(): void {
    if (this.boundInventoryHandler) {
      this.inventoryManager.off("inventory-changed", this.boundInventoryHandler);
      this.boundInventoryHandler = null;
    }
    if (this.boundEquipmentHandler) {
      this.equipmentManager.off("equipment-changed", this.boundEquipmentHandler);
      this.boundEquipmentHandler = null;
    }
  }

  /**
   * 触发自动保存（带防抖）
   */
  private triggerAutoSave(): void {
    if (this.autoSaveSlot === null) return;

    // 取消之前的定时器
    this.cancelPendingAutoSave();

    // 设置新的定时器
    this.autoSaveTimer = setTimeout(() => {
      this.saveToSlot(this.autoSaveSlot!);
      this.autoSaveTimer = null;
    }, this.debounceMs);
  }

  /**
   * 取消待执行的自动保存
   */
  private cancelPendingAutoSave(): void {
    if (this.autoSaveTimer !== null) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * 立即执行自动保存（取消防抖）
   */
  forceAutoSave(): boolean {
    this.cancelPendingAutoSave();
    if (this.autoSaveSlot !== null) {
      return this.saveToSlot(this.autoSaveSlot);
    }
    return false;
  }

  /**
   * 存档数据迁移
   */
  migrate(data: SaveData, fromVersion: number): SaveData | null {
    if (fromVersion === SAVE_VERSION) {
      return data;
    }

    console.log(`[SaveManager] Migrating from version ${fromVersion} to ${SAVE_VERSION}`);

    // 创建副本
    let migrated: SaveData = JSON.parse(JSON.stringify(data));

    // 版本迁移逻辑
    if (fromVersion < 1) {
      // v0 -> v1 迁移示例
      // migrated.state.character.xxx = defaultValue;
    }

    // 更新版本号
    migrated.meta.version = SAVE_VERSION;

    return migrated;
  }

  /**
   * 导出存档为字符串（用于备份）
   */
  exportSave(slot: number): string | null {
    const result = this.loadFromSlot(slot);
    if (result.success && result.data) {
      return JSON.stringify(result.data, null, 2);
    }
    return null;
  }

  /**
   * 导入存档字符串
   */
  importSave(slot: number, json: string): boolean {
    try {
      const data: SaveData = JSON.parse(json);
      // 基本验证
      if (!data.meta || !data.state) {
        console.error("[SaveManager] Invalid save format");
        return false;
      }
      const key = this.getSaveKey(slot);
      sys.localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("[SaveManager] Failed to import save:", error);
      return false;
    }
  }

  /**
   * 获取存档键
   */
  private getSaveKey(slot: number): string {
    return `${SAVE_KEY_PREFIX}${slot}`;
  }
}
