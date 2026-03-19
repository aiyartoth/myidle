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
