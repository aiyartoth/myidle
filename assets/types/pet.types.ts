/**
 * 宠物系统 - 属性、品级、属性点、技能
 */

/** 宠物属性 ID（攻击/防御/血量/蓝量/忠诚/速度等） */
export type PetAttrId = "atk" | "def" | "hp" | "maxHp" | "mp" | "maxMp" | "loyalty" | "speed";

/** 宠物品级 */
export type PetGrade = "S" | "A" | "B" | "C" | "D";

/** 属性点分配记录（用于重置属性点） */
export type PetStatAllocation = Partial<Record<PetAttrId, number>>;

/** 宠物技能效果类型 */
export type PetSkillEffectType = "damage" | "buff" | "debuff" | "heal";

/** 宠物技能模板（静态表） */
export interface PetSkillTemplate {
  id: string;
  name: string;
  effectType: PetSkillEffectType;
  /** 伤害倍率、治疗量等，具体含义依 effectType */
  value?: number;
  /** 施加的 Buff 模板 id（effectType 为 buff/debuff 时） */
  buffTemplateId?: string;
  buffDurationMs?: number;
}

/** 宠物技能槽（已装备的技能） */
export interface PetSkillSlot {
  templateId: string;
  /** 技能等级等扩展 */
  level?: number;
}

/** 宠物基础模板（静态表，可选：用于生成初始属性） */
export interface PetTemplate {
  id: string;
  name: string;
  grade: PetGrade;
  /** 初始属性 */
  baseAttrs: Partial<Record<PetAttrId, number>>;
  /** 可学技能 id 列表 */
  skillIds?: string[];
}

/** 宠物运行时数据 */
export interface PetRuntime {
  id: string;
  templateId: string;
  name: string;
  grade: PetGrade;
  /** 基础属性（不含属性点加成） */
  baseAttrs: Partial<Record<PetAttrId, number>>;
  /** 剩余可分配属性点 */
  remainingStatPoints: number;
  /** 已分配的属性点记录（便于重置） */
  statAllocation: PetStatAllocation;
  /** 已装备技能 */
  skills: PetSkillSlot[];
}
