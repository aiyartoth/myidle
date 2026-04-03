/**
 * 默认存档生成器：创建演示用的游戏数据
 */
import type { ItemTemplate, EquipmentTemplate } from "../types/types";
import type { GameState } from "../types/save";

/** 演示用物品模板 */
export const DEMO_ITEMS: ItemTemplate[] = [
  // 消耗品
  { id: "potion_small", name: "小型生命药水", type: "consumable", stackLimit: 20, effect: { heal: 30 } },
  { id: "potion_medium", name: "中型生命药水", type: "consumable", stackLimit: 15, effect: { heal: 80 } },
  { id: "potion_large", name: "大型生命药水", type: "consumable", stackLimit: 10, effect: { heal: 200 } },

  // 材料
  { id: "wood", name: "木材", type: "material", stackLimit: 99 },
  { id: "iron_ore", name: "铁矿石", type: "material", stackLimit: 99 },
  { id: "leather", name: "皮革", type: "material", stackLimit: 99 },

  // 装备 - 武器
  { id: "sword_iron", name: "铁剑", type: "equipment", stackLimit: 1, equipmentSlot: "weapon" },
  { id: "sword_steel", name: "钢剑", type: "equipment", stackLimit: 1, equipmentSlot: "weapon" },
  { id: "axe_battle", name: "战斧", type: "equipment", stackLimit: 1, equipmentSlot: "weapon" },

  // 装备 - 护甲
  { id: "armor_leather", name: "皮甲", type: "equipment", stackLimit: 1, equipmentSlot: "armor" },
  { id: "armor_chain", name: "锁子甲", type: "equipment", stackLimit: 1, equipmentSlot: "armor" },
  { id: "armor_plate", name: "板甲", type: "equipment", stackLimit: 1, equipmentSlot: "armor" },

  // 装备 - 头盔
  { id: "helm_leather", name: "皮帽", type: "equipment", stackLimit: 1, equipmentSlot: "helmet" },
  { id: "helm_iron", name: "铁盔", type: "equipment", stackLimit: 1, equipmentSlot: "helmet" },

  // 装备 - 饰品
  { id: "ring_health", name: "生命戒指", type: "equipment", stackLimit: 1, equipmentSlot: "accessory" },
  { id: "ring_power", name: "力量戒指", type: "equipment", stackLimit: 1, equipmentSlot: "accessory" },
];

/** 演示用装备模板（用于属性计算） */
export const DEMO_EQUIPMENT: EquipmentTemplate[] = [
  // 武器
  {
    id: "sword_iron",
    name: "铁剑",
    slot: "weapon",
    modifiers: [{ attrId: "atk", type: "flat", value: 15 }],
  },
  {
    id: "sword_steel",
    name: "钢剑",
    slot: "weapon",
    modifiers: [
      { attrId: "atk", type: "flat", value: 25 },
      { attrId: "critRate", type: "flat", value: 0.05 },
    ],
  },
  {
    id: "axe_battle",
    name: "战斧",
    slot: "weapon",
    modifiers: [
      { attrId: "atk", type: "flat", value: 30 },
      { attrId: "speed", type: "flat", value: -5 },
    ],
  },

  // 护甲
  {
    id: "armor_leather",
    name: "皮甲",
    slot: "armor",
    modifiers: [
      { attrId: "def", type: "flat", value: 8 },
      { attrId: "maxHp", type: "flat", value: 20 },
    ],
  },
  {
    id: "armor_chain",
    name: "锁子甲",
    slot: "armor",
    modifiers: [
      { attrId: "def", type: "flat", value: 18 },
      { attrId: "maxHp", type: "flat", value: 40 },
      { attrId: "speed", type: "flat", value: -3 },
    ],
  },
  {
    id: "armor_plate",
    name: "板甲",
    slot: "armor",
    modifiers: [
      { attrId: "def", type: "flat", value: 30 },
      { attrId: "maxHp", type: "flat", value: 80 },
      { attrId: "speed", type: "flat", value: -10 },
    ],
  },

  // 头盔
  {
    id: "helm_leather",
    name: "皮帽",
    slot: "helmet",
    modifiers: [
      { attrId: "def", type: "flat", value: 3 },
      { attrId: "maxHp", type: "flat", value: 10 },
    ],
  },
  {
    id: "helm_iron",
    name: "铁盔",
    slot: "helmet",
    modifiers: [
      { attrId: "def", type: "flat", value: 8 },
      { attrId: "maxHp", type: "flat", value: 20 },
    ],
  },

  // 饰品
  {
    id: "ring_health",
    name: "生命戒指",
    slot: "accessory",
    modifiers: [
      { attrId: "maxHp", type: "percent", value: 0.1 },
      { attrId: "hp", type: "flat", value: 50 },
    ],
  },
  {
    id: "ring_power",
    name: "力量戒指",
    slot: "accessory",
    modifiers: [
      { attrId: "atk", type: "percent", value: 0.15 },
    ],
  },
];

/** 新手套装配置 */
export const STARTER_KIT = {
  // 初始背包物品
  inventory: [
    { itemId: "potion_small", count: 5 },
    { itemId: "wood", count: 20 },
    { itemId: "iron_ore", count: 10 },
    { itemId: "leather", count: 5 },
  ],
  // 初始装备
  equipment: {
    weapon: "sword_iron" as const,
    armor: "armor_leather" as const,
    helmet: "helm_leather" as const,
  },
  // 初始属性
  baseAttrs: {
    atk: 10,
    def: 5,
    hp: 100,
    maxHp: 100,
    critRate: 0.05,
    speed: 10,
  },
};

/**
 * 生成默认游戏状态（用于新存档）
 */
export function generateDefaultState(): GameState {
  const inventorySlots = Array(20).fill(null);

  // 填充初始物品
  for (let i = 0; i < STARTER_KIT.inventory.length; i++) {
    inventorySlots[i] = STARTER_KIT.inventory[i];
  }

  return {
    inventory: {
      slots: inventorySlots,
      maxSlots: 20,
    },
    equipment: {
      equipped: { ...STARTER_KIT.equipment },
    },
    character: {
      baseAttrs: { ...STARTER_KIT.baseAttrs },
    },
  };
}

/**
 * 获取模板 Map（便于管理器初始化）
 */
export function getItemTemplateMap(): Map<string, ItemTemplate> {
  return new Map(DEMO_ITEMS.map((item) => [item.id, item]));
}

/**
 * 获取装备模板 Map（便于 AttributeManager 初始化）
 */
export function getEquipmentTemplateMap(): Map<string, EquipmentTemplate> {
  return new Map(DEMO_EQUIPMENT.map((eq) => [eq.id, eq]));
}
