/**
 * 物品系统 - 道具类型、模板、背包格子
 */
import type { EquipmentSlot } from "./equipment.types";
/** 道具类型 */
export type ItemType = "consumable" | "material" | "equipment";

/** 道具模板（静态表） */
export interface ItemTemplate {
  id: string;
  name: string;
  type: ItemType;
  stackLimit: number;
  equipmentSlot?: EquipmentSlot;
  /** 使用效果：如施加 Buff、回复等 */
  effect?: {
    buffTemplateId?: string;
    buffDurationMs?: number;
    heal?: number;
  };
}

/** 背包格子 */
export interface InventorySlot {
  itemId: string;
  count: number;
}

/** 背包变更事件 */
export interface InventoryChangeEvent {
  type: 'add' | 'remove' | 'update';
  itemId: string;
  count: number;
  slotIndex?: number;
}