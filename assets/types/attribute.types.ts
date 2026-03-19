/**
 * 人物属性 - 属性 ID、修饰、明细
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
