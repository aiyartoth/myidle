/**
 * 使用示例：创建角色、装备、Buff，并打印属性明细与来源
 */
import { AttributeManager } from "./attribute-manager";
import type { CharacterRuntime, EquipmentTemplate } from "./types";

// 装备表
const equipmentTable = new Map<string, EquipmentTemplate>([
  [
    "sword_1",
    {
      id: "sword_1",
      name: "铁剑",
      slot: "weapon",
      modifiers: [
        { attrId: "atk", type: "flat", value: 20 },
        { attrId: "critRate", type: "percent", value: 0.05 },
      ],
    },
  ],
  [
    "armor_1",
    {
      id: "armor_1",
      name: "皮甲",
      slot: "armor",
      modifiers: [
        { attrId: "def", type: "flat", value: 15 },
        { attrId: "maxHp", type: "percent", value: 0.1 },
      ],
    },
  ],
]);

const manager = new AttributeManager({ equipmentTable });

// 角色运行时数据
const runtime: CharacterRuntime = {
  baseAttrs: {
    atk: 50,
    def: 10,
    hp: 100,
    maxHp: 100,
    critRate: 0,
    speed: 5,
  },
  equipped: {
    weapon: "sword_1",
    armor: "armor_1",
  },
  buffs: [
    {
      id: "buff_rage_1",
      templateId: "rage",
      name: "狂暴",
      sourceType: "item",
      sourceId: "potion_rage",
      remainingMs: 30000,
      modifiers: [
        { attrId: "atk", type: "percent", value: 0.2 },
        { attrId: "def", type: "percent", value: -0.1 },
      ],
    },
  ],
};

// 属性明细
const details = manager.getAttrDetails(runtime);
console.log("========== 属性明细与来源 ==========\n");
for (const d of details) {
  if (d.base === 0 && d.flatTotal === 0 && d.percentTotal === 0) continue;
  console.log(`【${d.attrId}】最终: ${d.finalValue}`);
  console.log(`  基础 ${d.base} + 固定 ${d.flatTotal}，再 × (1 + ${(d.percentTotal * 100).toFixed(0)}%)`);
  console.log("  来源:");
  for (const s of d.sources) {
    const v = s.type === "percent" ? `${(s.value * 100).toFixed(0)}%` : s.value;
    console.log(`    - ${s.sourceName} (${s.sourceType}): ${v}`);
  }
  console.log("");
}

console.log("========== 当前 Buff ==========\n");
for (const b of manager.getActiveBuffs(runtime)) {
  console.log(`${b.name} 剩余 ${(b.remainingMs / 1000).toFixed(1)}s (来自 ${b.sourceType}: ${b.sourceId})`);
}
