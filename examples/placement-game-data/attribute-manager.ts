/**
 * 属性管理器：汇总基础 + 装备 + Buff，计算最终属性并产出明细与来源
 */
import type {
  AttrId,
  AttrModifierWithSource,
  AttrDetailRow,
  CharacterRuntime,
  EquipmentTemplate,
  BuffInstance,
} from "./types";

const DEFAULT_ATTR_IDS: AttrId[] = [
  "atk",
  "def",
  "hp",
  "maxHp",
  "critRate",
  "speed",
];

export interface AttributeManagerOptions {
  equipmentTable: Map<string, EquipmentTemplate>;
  attrIds?: AttrId[];
}

export class AttributeManager {
  private equipmentTable: Map<string, EquipmentTemplate>;
  private attrIds: AttrId[];

  constructor(options: AttributeManagerOptions) {
    this.equipmentTable = options.equipmentTable;
    this.attrIds = options.attrIds ?? DEFAULT_ATTR_IDS;
  }

  /**
   * 从角色运行时数据 + 当前 Buff 列表，收集所有「带来源」的属性修饰
   */
  collectModifiersWithSource(runtime: CharacterRuntime): AttrModifierWithSource[] {
    const list: AttrModifierWithSource[] = [];

    // 1. 基础属性 -> 作为 "base" 来源的“修饰”（用 flat 表示基础值）
    for (const attrId of this.attrIds) {
      const base = runtime.baseAttrs[attrId];
      if (base != null && base !== 0) {
        list.push({
          attrId,
          type: "flat",
          value: base,
          sourceType: "base",
          sourceId: "base",
          sourceName: "基础",
        });
      }
    }

    // 2. 装备
    for (const [slot, eqId] of Object.entries(runtime.equipped)) {
      if (!eqId) continue;
      const eq = this.equipmentTable.get(eqId);
      if (!eq) continue;
      for (const mod of eq.modifiers) {
        list.push({
          ...mod,
          sourceType: "equipment",
          sourceId: eq.id,
          sourceName: eq.name,
        });
      }
    }

    // 3. Buff
    for (const buff of runtime.buffs) {
      for (const mod of buff.modifiers) {
        list.push({
          ...mod,
          sourceType: "buff",
          sourceId: buff.id,
          sourceName: buff.name,
        });
      }
    }

    return list;
  }

  /**
   * 计算单个属性的最终值及明细
   * 公式: final = (base + flatSum) * (1 + percentSum)
   */
  computeAttrDetail(
    attrId: AttrId,
    modifiers: AttrModifierWithSource[]
  ): AttrDetailRow {
    const forThis = modifiers.filter((m) => m.attrId === attrId);
    let base = 0;
    let flatTotal = 0;
    let percentTotal = 0;

    for (const m of forThis) {
      if (m.sourceType === "base" && m.type === "flat") {
        base += m.value;
      } else if (m.type === "flat") {
        flatTotal += m.value;
      } else {
        percentTotal += m.value;
      }
    }

    const finalValue = Math.max(0, (base + flatTotal) * (1 + percentTotal));
    return {
      attrId,
      base,
      flatTotal,
      percentTotal,
      finalValue: Math.round(finalValue * 100) / 100,
      sources: forThis,
    };
  }

  /**
   * 获取所有属性的明细（用于属性面板 UI）
   */
  getAttrDetails(runtime: CharacterRuntime): AttrDetailRow[] {
    const modifiers = this.collectModifiersWithSource(runtime);
    return this.attrIds.map((attrId) =>
      this.computeAttrDetail(attrId, modifiers)
    );
  }

  /**
   * 获取最终属性键值对（用于战斗/技能等逻辑）
   */
  getFinalAttrs(runtime: CharacterRuntime): Record<AttrId, number> {
    const details = this.getAttrDetails(runtime);
    const out = {} as Record<AttrId, number>;
    for (const d of details) {
      out[d.attrId] = d.finalValue;
    }
    return out;
  }

  /**
   * 获取当前临时 Buff 列表（用于 Buff 面板 UI，可显示剩余时间）
   */
  getActiveBuffs(runtime: CharacterRuntime): BuffInstance[] {
    return [...runtime.buffs];
  }
}
