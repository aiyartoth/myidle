/**
 * 放置游戏 - 属性 / 装备 / 道具 / Buff 类型定义
 * 用于属性明细、来源追踪与临时 Buff 管理
 */

/** 属性 ID，可扩展 */
export type AttrId = "atk" | "def" | "hp" | "maxHp" | "critRate" | "speed";

/** 单条属性修饰：固定值 或 百分比（0.1 = 10%） */
export interface AttrModifier {
  attrId: AttrId;
  type: "flat" | "percent";
  value: number; // flat: 直接加减; percent: 小数，如 0.1 表示 +10%
}

/** 带来源的一条属性修饰（用于计算与展示） */
export interface AttrModifierWithSource extends AttrModifier {
  sourceType: "base" | "equipment" | "buff";
  sourceId: string;   // 装备 id / Buff 实例 id / "base"
  sourceName?: string; // 展示用名称
}

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

/** Buff 实例（带持续时间与来源） */
export interface BuffInstance {
  id: string;           // 实例 id，用于移除
  templateId: string;    // Buff 模板 id
  name: string;
  sourceType: "skill" | "item" | "env";
  sourceId: string;
  remainingMs: number;   // 剩余毫秒
  modifiers: AttrModifier[];
}

/** 道具类型 */
export type ItemType = "consumable" | "material" | "equipment";

/** 道具模板（静态表） */
export interface ItemTemplate {
  id: string;
  name: string;
  type: ItemType;
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

/** 单条属性的明细与来源（用于 UI 展示） */
export interface AttrDetailRow {
  attrId: AttrId;
  base: number;
  flatTotal: number;
  percentTotal: number;
  finalValue: number;
  /** 每条加成的来源，便于展示「来自 xxx」 */
  sources: AttrModifierWithSource[];
}

/** 角色核心运行时数据（用于计算属性） */
export interface CharacterRuntime {
  /** 基础属性（无装备、无 Buff） */
  baseAttrs: Partial<Record<AttrId, number>>;
  equipped: EquippedMap;
  buffs: BuffInstance[];
}
