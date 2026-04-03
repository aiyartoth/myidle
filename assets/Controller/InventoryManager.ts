/**
 * 背包管理器：处理物品存储、堆叠和格子管理
 */
import type { InventorySlot, InventoryChangeEvent, ItemTemplate } from "../types/types";
import type { InventoryState } from "../types/save";
import { EventTarget } from "cc";

export interface InventoryManagerOptions {
  /** 最大格子数，默认 20 */
  maxSlots?: number;
  /** 物品模板表，用于查询堆叠上限 */
  itemTemplateTable: Map<string, ItemTemplate>;
}

export class InventoryManager {
  private slots: (InventorySlot | null)[];
  private maxSlots: number;
  private itemTemplateTable: Map<string, ItemTemplate>;
  private eventTarget: EventTarget;

  constructor(options: InventoryManagerOptions) {
    this.maxSlots = options.maxSlots ?? 20;
    this.itemTemplateTable = options.itemTemplateTable;
    this.slots = new Array(this.maxSlots).fill(null);
    this.eventTarget = new EventTarget();
  }

  /**
   * 获取默认堆叠上限
   */
  private getDefaultStackLimit(itemType: string): number {
    return itemType === "equipment" ? 1 : 99;
  }

  /**
   * 获取物品堆叠上限
   */
  private getStackLimit(itemId: string): number {
    const template = this.itemTemplateTable.get(itemId);
    if (template?.stackLimit !== undefined) {
      return template.stackLimit;
    }
    return this.getDefaultStackLimit(template?.type ?? "material");
  }

  /**
   * 添加物品到背包
   * @param itemId 物品 ID
   * @param count 数量
   * @returns 是否全部添加成功
   */
  addItem(itemId: string, count: number): boolean {
    if (count <= 0) return false;

    const stackLimit = this.getStackLimit(itemId);
    let remaining = count;

    // 先尝试堆叠到现有格子
    for (let i = 0; i < this.maxSlots && remaining > 0; i++) {
      const slot = this.slots[i];
      if (slot && slot.itemId === itemId) {
        const canAdd = stackLimit - slot.count;
        if (canAdd > 0) {
          const addCount = Math.min(canAdd, remaining);
          slot.count += addCount;
          remaining -= addCount;
          this.emitChange({
            type: "update",
            itemId,
            count: addCount,
            slotIndex: i,
          });
        }
      }
    }

    // 剩余物品放入空格子
    for (let i = 0; i < this.maxSlots && remaining > 0; i++) {
      if (this.slots[i] === null) {
        const addCount = Math.min(stackLimit, remaining);
        this.slots[i] = { itemId, count: addCount };
        remaining -= addCount;
        this.emitChange({
          type: "add",
          itemId,
          count: addCount,
          slotIndex: i,
        });
      }
    }

    return remaining === 0;
  }

  /**
   * 从背包移除物品
   * @param itemId 物品 ID
   * @param count 数量
   * @returns 是否全部移除成功
   */
  removeItem(itemId: string, count: number): boolean {
    if (count <= 0) return false;

    // 计算总数量
    let totalCount = 0;
    for (const slot of this.slots) {
      if (slot && slot.itemId === itemId) {
        totalCount += slot.count;
      }
    }

    if (totalCount < count) {
      return false; // 数量不足
    }

    let remaining = count;

    // 从后往前移除（优先移除后面的堆叠）
    for (let i = this.maxSlots - 1; i >= 0 && remaining > 0; i--) {
      const slot = this.slots[i];
      if (slot && slot.itemId === itemId) {
        const removeCount = Math.min(slot.count, remaining);
        slot.count -= removeCount;
        remaining -= removeCount;

        if (slot.count === 0) {
          this.slots[i] = null;
          this.emitChange({
            type: "remove",
            itemId,
            count: removeCount,
            slotIndex: i,
          });
        } else {
          this.emitChange({
            type: "update",
            itemId,
            count: -removeCount,
            slotIndex: i,
          });
        }
      }
    }

    return remaining === 0;
  }

  /**
   * 从指定格子移除物品（用于装备操作）
   * @param slotIndex 格子索引
   * @param count 数量，默认为全部
   * @returns 是否移除成功
   */
  removeFromSlot(slotIndex: number, count?: number): { itemId: string; count: number } | null {
    if (slotIndex < 0 || slotIndex >= this.maxSlots) return null;

    const slot = this.slots[slotIndex];
    if (!slot) return null;

    const removeCount = count ?? slot.count;
    if (removeCount > slot.count) return null;

    const result = { itemId: slot.itemId, count: removeCount };

    if (removeCount >= slot.count) {
      this.slots[slotIndex] = null;
      this.emitChange({
        type: "remove",
        itemId: slot.itemId,
        count: removeCount,
        slotIndex,
      });
    } else {
      slot.count -= removeCount;
      this.emitChange({
        type: "update",
        itemId: slot.itemId,
        count: -removeCount,
        slotIndex,
      });
    }

    return result;
  }

  /**
   * 获取背包内容（只读副本）
   */
  getInventory(): (InventorySlot | null)[] {
    return [...this.slots];
  }

  /**
   * 获取特定物品的总数量
   */
  getItemCount(itemId: string): number {
    let total = 0;
    for (const slot of this.slots) {
      if (slot && slot.itemId === itemId) {
        total += slot.count;
      }
    }
    return total;
  }

  /**
   * 查找物品的格子索引
   */
  findItemSlot(itemId: string): number {
    for (let i = 0; i < this.maxSlots; i++) {
      const slot = this.slots[i];
      if (slot && slot.itemId === itemId) {
        return i;
      }
    }
    return -1;
  }

  /**
   * 获取空格子数量
   */
  getEmptySlotCount(): number {
    return this.slots.filter((slot) => slot === null).length;
  }

  /**
   * 是否有空格子
   */
  hasEmptySlot(): boolean {
    return this.slots.some((slot) => slot === null);
  }

  /**
   * 订阅背包变更事件
   */
  on(event: "inventory-changed", callback: (event: InventoryChangeEvent) => void): void {
    this.eventTarget.on(event, callback);
  }

  /**
   * 取消订阅
   */
  off(event: "inventory-changed", callback: (event: InventoryChangeEvent) => void): void {
    this.eventTarget.off(event, callback);
  }

  /**
   * 恢复背包状态（用于存档加载）
   */
  restoreState(state: InventoryState): void {
    // 验证并调整大小
    const newSlots = state.slots.slice(0, this.maxSlots);
    this.slots = newSlots.concat(
      new Array(Math.max(0, this.maxSlots - newSlots.length)).fill(null)
    );
    console.log("[InventoryManager] State restored");
  }

  /**
   * 清空背包
   */
  clear(): void {
    this.slots = new Array(this.maxSlots).fill(null);
    this.emitChange({ type: "remove", itemId: "", count: 0 });
  }
  private emitChange(event: InventoryChangeEvent): void {
    this.eventTarget.emit("inventory-changed", event);
  }
}