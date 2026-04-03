import { _decorator, Component, log } from "cc";
import type { AttrId } from "./types/types";
import type { GameState } from "./types/save";
import { ItemManager } from "./Controller/ItemManager";
import { InventoryManager } from "./Controller/InventoryManager";
import { EquipmentManager } from "./Controller/EquipmentManager";
import { AttributeManager } from "./Controller/AttributeManager";
import { SaveManager } from "./Controller/SaveManager";
import {
  getItemTemplateMap,
  getEquipmentTemplateMap,
  generateDefaultState,
} from "./Controller/DefaultSaveGenerator";

const { ccclass } = _decorator;

/**
 * 游戏主组件
 * 负责管理器初始化和存档加载
 */
@ccclass("Main")
export class Main extends Component {
  // 管理器实例
  private itemManager!: ItemManager;
  private inventoryManager!: InventoryManager;
  private equipmentManager!: EquipmentManager;
  private attributeManager!: AttributeManager;
  private saveManager!: SaveManager;

  // 当前游戏状态
  private currentBaseAttrs: Partial<Record<AttrId, number>> = {};

  /** 自动存档槽位 */
  private readonly AUTO_SAVE_SLOT = 0;

    start(): void {
      console.log("Main start");
    log("[Main] 游戏初始化开始...");

    this.initializeManagers();
    this.loadOrCreateSave();
    this.logGameState();

    log("[Main] 游戏初始化完成！");
  }

  /**
   * 初始化所有管理器
   */
  private initializeManagers(): void {
    log("[Main] 初始化管理器...");

    // 1. 物品管理器
    this.itemManager = new ItemManager();
    this.itemManager.loadTemplates(Array.from(getItemTemplateMap().values()));
    log("[Main] ✓ ItemManager 初始化完成");

    // 2. 属性管理器
    this.attributeManager = new AttributeManager({
      equipmentTable: getEquipmentTemplateMap(),
    });
    log("[Main] ✓ AttributeManager 初始化完成");

    // 3. 背包管理器
    this.inventoryManager = new InventoryManager({
      maxSlots: 20,
      itemTemplateTable: getItemTemplateMap(),
    });
    log("[Main] ✓ InventoryManager 初始化完成");

    // 4. 装备管理器
    this.equipmentManager = new EquipmentManager({
      inventoryManager: this.inventoryManager,
      itemManager: this.itemManager,
      attributeManager: this.attributeManager,
    });
    log("[Main] ✓ EquipmentManager 初始化完成");

    // 5. 存档管理器
    this.saveManager = new SaveManager({
      inventoryManager: this.inventoryManager,
      equipmentManager: this.equipmentManager,
    });
    log("[Main] ✓ SaveManager 初始化完成");
  }

  /**
   * 加载存档或创建新游戏
   */
  private loadOrCreateSave(): void {
    log(`[Main] 尝试加载存档槽位 ${this.AUTO_SAVE_SLOT}...`);

    const result = this.saveManager.loadFromSlot(this.AUTO_SAVE_SLOT);

    if (result.success && result.data) {
      // 成功加载存档
      log(`[Main] 找到存档，版本: ${result.data.meta.version}`);
      this.applyGameState(result.data.state);
      log("[Main] ✓ 存档加载成功");
    } else {
      // 没有存档，创建默认存档
      log(`[Main] 未找到存档（${result.error}），创建新游戏...`);
      this.createNewGame();
    }

    // 启用自动保存
    this.saveManager.enableAutoSave(this.AUTO_SAVE_SLOT);
    log(`[Main] ✓ 自动保存已启用（槽位 ${this.AUTO_SAVE_SLOT}）`);
  }

  /**
   * 应用游戏状态到管理器
   */
  private applyGameState(state: GameState): void {
    // 恢复背包
    this.inventoryManager.restoreState(state.inventory);

    // 恢复装备
    this.equipmentManager.restoreState(state.equipment);

    // 记录基础属性
    this.currentBaseAttrs = { ...state.character.baseAttrs };
  }

  /**
   * 创建新游戏（使用默认数据）
   */
  private createNewGame(): void {
    const defaultState = generateDefaultState();
    this.applyGameState(defaultState);

    // 首次保存
    const saved = this.saveManager.saveToSlot(this.AUTO_SAVE_SLOT);
    if (saved) {
      log("[Main] ✓ 默认存档已创建并保存");
    } else {
      log("[Main] ✗ 默认存档保存失败");
    }
  }

  /**
   * 记录当前游戏状态（调试用）
   */
  private logGameState(): void {
    const equipped = this.equipmentManager.getEquipped();
    const logEntries: string[] = [];

    logEntries.push("[Main] ========== 当前游戏状态 ==========");

    // 基础属性
    logEntries.push("[Main] 【基础属性】");
    for (const key in this.currentBaseAttrs) {
      const value = this.currentBaseAttrs[key as AttrId];
      if (value !== undefined) {
        logEntries.push(`  ${key}: ${value}`);
      }
    }

    // 装备
    logEntries.push("[Main] 【已装备】");
    if (equipped.weapon) logEntries.push(`  武器: ${this.itemManager.getItemName(equipped.weapon)}`);
    if (equipped.armor) logEntries.push(`  护甲: ${this.itemManager.getItemName(equipped.armor)}`);
    if (equipped.helmet) logEntries.push(`  头盔: ${this.itemManager.getItemName(equipped.helmet)}`);
    if (equipped.accessory) logEntries.push(`  饰品: ${this.itemManager.getItemName(equipped.accessory)}`);

    // 计算最终属性
    const runtime = this.equipmentManager.createCharacterRuntime(this.currentBaseAttrs, []);
    const finalAttrs = this.attributeManager.getFinalAttrs(runtime);
    logEntries.push("[Main] 【最终属性】");
    for (const key in finalAttrs) {
      const value = finalAttrs[key as AttrId];
      const baseValue = this.currentBaseAttrs[key as AttrId] ?? 0;
      const diff = value !== baseValue ? ` (基础: ${baseValue})` : "";
      logEntries.push(`  ${key}: ${value}${diff}`);
    }

    // 背包物品
    const inventory = this.inventoryManager.getInventory();
    const items = inventory.filter((slot) => slot !== null);
    logEntries.push(`[Main] 【背包】(${items.length}/20 格)`);
    for (const slot of items.slice(0, 5)) {
      if (slot) {
        const name = this.itemManager.getItemName(slot.itemId);
        logEntries.push(`  ${name} x${slot.count}`);
      }
    }
    if (items.length > 5) {
      logEntries.push(`  ... 还有 ${items.length - 5} 个物品`);
    }

    logEntries.push("[Main] ==================================");

    // 输出日志
    for (const entry of logEntries) {
      log(entry);
    }
  }

  /**
   * 更新基础属性（用于升级等）
   */
  setBaseAttr(attrId: AttrId, value: number): void {
    this.currentBaseAttrs[attrId] = value;
  }

  /**
   * 获取当前基础属性
   */
  getBaseAttrs(): Partial<Record<AttrId, number>> {
    return { ...this.currentBaseAttrs };
  }

  /**
   * 手动保存游戏
   */
  manualSave(): boolean {
    log("[Main] 手动保存游戏...");
    return this.saveManager.saveToSlot(this.AUTO_SAVE_SLOT);
  }

  /**
   * 导出当前存档（用于备份）
   */
  exportSave(): string | null {
    return this.saveManager.exportSave(this.AUTO_SAVE_SLOT);
  }

  /**
   * 导入存档
   */
  importSave(json: string): boolean {
    log("[Main] 导入存档...");
    const success = this.saveManager.importSave(this.AUTO_SAVE_SLOT, json);
    if (success) {
      // 重新加载
      const result = this.saveManager.loadFromSlot(this.AUTO_SAVE_SLOT);
      if (result.success && result.data) {
        this.applyGameState(result.data.state);
        log("[Main] ✓ 存档导入成功");
        return true;
      }
    }
    log("[Main] ✗ 存档导入失败");
    return false;
  }

  // 公共访问器（供其他组件使用）
  getInventoryManager(): InventoryManager { return this.inventoryManager; }
  getEquipmentManager(): EquipmentManager { return this.equipmentManager; }
  getItemManager(): ItemManager { return this.itemManager; }
  getAttributeManager(): AttributeManager { return this.attributeManager; }
  getSaveManager(): SaveManager { return this.saveManager; }
}
