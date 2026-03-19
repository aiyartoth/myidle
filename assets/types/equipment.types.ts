/**
 * 装备系统 - 槽位、模板、当前装备
 */

import type { AttrModifier } from "./attribute.types";

/** 装备槽位 */
export type EquipmentSlot = "weapon" | "armor" | "helmet" | "accessory";

/** 装备模板（静态表） */
export interface EquipmentTemplate {
  id: string;
  name: string;
  slot: EquipmentSlot;
  modifiers: AttrModifier[];
}

/** 角色当前装备：槽位 -> 装备 id */
export type EquippedMap = Partial<Record<EquipmentSlot, string>>;
