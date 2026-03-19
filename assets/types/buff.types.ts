/**
 * Buff 系统 - Buff 实例与持续时间
 */

import type { AttrModifier } from "./attribute.types";

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
