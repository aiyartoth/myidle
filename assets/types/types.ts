/**
 * 放置游戏 - 属性 / 装备 / 道具 / Buff 类型定义
 * 按类别拆分到各子模块，本文件统一导出以保持原有引用路径兼容
 */

export type {
  AttrId,
  AttrModifier,
  AttrModifierWithSource,
  AttrDetailRow,
} from "./attribute.types";

export type { BuffInstance } from "./buff.types";

export type {
  EquipmentSlot,
  EquipmentTemplate,
  EquippedMap,
} from "./equipment.types";

export type { ItemType, ItemTemplate, InventorySlot } from "./item.types";

export type { CharacterRuntime } from "./character.types";

export type {
  PetAttrId,
  PetGrade,
  PetStatAllocation,
  PetSkillEffectType,
  PetSkillTemplate,
  PetSkillSlot,
  PetTemplate,
  PetRuntime,
} from "./pet.types";
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
  /** 堆叠上限，默认为 1 */
  stackLimit?: number;
  /** 使用效果：如施加 Buff、回复等 */
  effect?: {
    buffTemplateId?: string;
    buffDurationMs?: number;
    heal?: number;
  };
  /** 装备槽位（仅当 type 为 equipment 时有效） */
  equipmentSlot?: EquipmentSlot;
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
