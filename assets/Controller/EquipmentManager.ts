/**
 * 装备管理器：处理装备穿戴/脱下，与 AttributeManager 集成
 */
import type {
  EquipmentSlot,
  EquippedMap,
  CharacterRuntime,
  AttrId,
} from "../types/types";
import type { EquipmentState } from "../types/save";
import { InventoryManager } from "./InventoryManager";
import { ItemManager } from "./ItemManager";
import { AttributeManager } from "./AttributeManager";
import { EventTarget } from "cc";

export interface EquipmentChangeEvent {
  slot: EquipmentSlot;
  previousItemId: string | null;
  newItemId: string | null;
}

export interface EquipmentManagerOptions {
  inventoryManager: InventoryManager;
  itemManager: ItemManager;
  attributeManager: AttributeManager;
}

export class EquipmentManager {
  private inventoryManager: InventoryManager;
  private itemManager: ItemManager;
  private attributeManager: AttributeManager;
  private equipped: EquippedMap;
  private eventTarget: EventTarget;

  constructor(options: EquipmentManagerOptions) {
    this.inventoryManager = options.inventoryManager;
    this.itemManager = options.itemManager;
    this.attributeManager = options.attributeManager;
    this.equipped = {};
    this.eventTarget = new EventTarget();
  }

  /**
   * 装备物品
   * @param itemId 物品 ID
   * @param fromSlot 从背包指定格子装备（可选，默认自动查找）
   * @returns 是否装备成功
   */
  equip(itemId: string, fromSlot?: number): boolean {
    // 验证是否为装备
    const slot = this.itemManager.getEquipmentSlot(itemId);
    if (!slot) {
      console.warn(`[EquipmentManager] ${itemId} is not equipment or has no slot`);
      return false;
    }

    // 验证背包中是否有该物品
    let slotIndex: number;
    if (fromSlot !== undefined) {
      const inventory = this.inventoryManager.getInventory();
      const inventorySlot = inventory[fromSlot];
      if (!inventorySlot || inventorySlot.itemId !== itemId) {
        console.warn(`[EquipmentManager] Item ${itemId} not found at slot ${fromSlot}`);
        return false;
      }
      slotIndex = fromSlot;
    } else {
      slotIndex = this.inventoryManager.findItemSlot(itemId);
      if (slotIndex === -1) {
        console.warn(`[EquipmentManager] Item ${itemId} not found in inventory`);
        return false;
      }
    }

    const previousItem = this.equipped[slot];

    // 如果该槽位已有装备，先卸下
    if (previousItem) {
      // 检查背包是否有空位
      if (!this.inventoryManager.hasEmptySlot()) {
        // 尝试卸下旧装备到背包
        if (!this.unequip(slot)) {
          console.warn("[EquipmentManager] Cannot swap: inventory full");
          return false;
        }
      } else {
        // 有空位，直接卸下
        if (!this.unequip(slot)) {
          return false;
        }
      }
    }

    // 从背包移除物品
    const removed = this.inventoryManager.removeFromSlot(slotIndex, 1);
    if (!removed || removed.count !== 1) {
      console.error(`[EquipmentManager] Failed to remove ${itemId} from inventory`);
      return false;
    }

    // 装备到新槽位
    this.equipped[slot] = itemId;

    // 触发事件
    this.emitChange({
      slot,
      previousItemId: previousItem ?? null,
      newItemId: itemId,
    });

    return true;
  }

  /**
   * 脱下装备
   * @param slot 装备槽位
   * @returns 是否脱下成功
   */
  unequip(slot: EquipmentSlot): boolean {
    const itemId = this.equipped[slot];
    if (!itemId) {
      console.warn(`[EquipmentManager] No item equipped at ${slot}`);
      return false;
    }

    // 检查背包是否有空位
    if (!this.inventoryManager.hasEmptySlot()) {
      console.warn("[EquipmentManager] Cannot unequip: inventory full");
      return false;
    }

    // 添加到背包
    const added = this.inventoryManager.addItem(itemId, 1);
    if (!added) {
      console.error(`[EquipmentManager] Failed to add ${itemId} back to inventory`);
      return false;
    }

    // 清除装备
    delete this.equipped[slot];

    // 触发事件
    this.emitChange({
      slot,
      previousItemId: itemId,
      newItemId: null,
    });

    return true;
  }

  /**
   * 获取当前装备状态
   */
  getEquipped(): EquippedMap {
    return { ...this.equipped };
  }

  /**
   * 获取指定槽位的装备
   */
  getItemAtSlot(slot: EquipmentSlot): string | undefined {
    return this.equipped[slot];
  }

  /**
   * 检查槽位是否有装备
   */
  hasItemAtSlot(slot: EquipmentSlot): boolean {
    return !!this.equipped[slot];
  }

  /**
   * 获取所有已装备物品的 ID 列表
   */
  getAllEquippedItemIds(): string[] {
    return Object.keys(this.equipped)
      .map((key) => this.equipped[key as EquipmentSlot])
      .filter((id): id is string => !!id);
  }

  /**
   * 创建包含装备信息的 CharacterRuntime
   * 用于传递给 AttributeManager 计算属性
   */
  createCharacterRuntime(
    baseAttrs: Partial<Record<AttrId, number>>,
    buffs: CharacterRuntime["buffs"] = []
  ): CharacterRuntime {
    return {
      baseAttrs,
      equipped: this.getEquipped(),
      buffs,
    };
  }

  /**
   * 订阅装备变更事件
   */
  on(event: "equipment-changed", callback: (event: EquipmentChangeEvent) => void): void {
    this.eventTarget.on(event, callback);
  }

  /**
   * 取消订阅
   */
  off(event: "equipment-changed", callback: (event: EquipmentChangeEvent) => void): void {
    this.eventTarget.off(event, callback);
  }

  /**
   * 恢复装备状态（用于存档加载）
   */
  restoreState(state: EquipmentState): void {
    const previousEquipped = { ...this.equipped };
    this.equipped = { ...state.equipped };

    // 为每个变更的槽位触发事件
    const allSlots: EquipmentSlot[] = ["weapon", "armor", "helmet", "accessory"];
    for (const slot of allSlots) {
      const prevItem = previousEquipped[slot] ?? null;
      const newItem = this.equipped[slot] ?? null;
      if (prevItem !== newItem) {
        this.emitChange({
          slot,
          previousItemId: prevItem,
          newItemId: newItem,
        });
      }
    }
    console.log("[EquipmentManager] State restored");
  }

  /**
   * 清空所有装备
   */
  clear(): void {
    const allSlots: EquipmentSlot[] = ["weapon", "armor", "helmet", "accessory"];
    for (const slot of allSlots) {
      if (this.equipped[slot]) {
        delete this.equipped[slot];
        this.emitChange({
          slot,
          previousItemId: this.equipped[slot] ?? null,
          newItemId: null,
        });
      }
    }
  }

  /**
   * 触发变更事件
   */
  private emitChange(event: EquipmentChangeEvent): void {
    this.eventTarget.emit("equipment-changed", event);
  }
}
