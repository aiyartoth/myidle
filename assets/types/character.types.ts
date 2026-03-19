/**
 * 角色运行时 - 基础属性、装备、Buff 汇总
 */

import type { AttrId } from "./attribute.types";
import type { EquippedMap } from "./equipment.types";
import type { BuffInstance } from "./buff.types";

/** 角色核心运行时数据（用于计算属性） */
export interface CharacterRuntime {
  /** 基础属性（无装备、无 Buff） */
  baseAttrs: Partial<Record<AttrId, number>>;
  equipped: EquippedMap;
  buffs: BuffInstance[];
}
