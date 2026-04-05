/**
 * 物品管理系统集成测试
 * 使用方法：将此组件挂载到场景中的任意节点，运行游戏查看控制台输出
 */
import { _decorator, Component, log } from "cc";
import { ItemManager } from "../Controller/ItemManager";
import { InventoryManager } from "../Controller/InventoryManager";
import { EquipmentManager } from "../Controller/EquipmentManager";
import { AttributeManager } from "../Controller/AttributeManager";
import type { ItemTemplate, EquipmentTemplate, CharacterRuntime } from "../types/types";

const { ccclass } = _decorator;

// 测试用物品模板
const TEST_ITEMS: ItemTemplate[] = [
  {
    id: "potion",
    name: "生命药水",
    type: "consumable",
    stackLimit: 10,
    effect: { heal: 50 },
  },
  {
    id: "sword",
    name: "铁剑",
    type: "equipment",
    stackLimit: 1,
    equipmentSlot: "weapon",
  },
  {
    id: "shield",
    name: "木盾",
    type: "equipment",
    stackLimit: 1,
    equipmentSlot: "armor",
  },
];

// 测试用装备模板（用于 AttributeManager）
const TEST_EQUIPMENT: EquipmentTemplate[] = [
  {
    id: "sword",
    name: "铁剑",
    slot: "weapon",
    modifiers: [
      { attrId: "atk", type: "flat", value: 10 },
    ],
  },
  {
    id: "shield",
    name: "木盾",
    slot: "armor",
    modifiers: [
      { attrId: "def", type: "flat", value: 5 },
    ],
  },
];

@ccclass("ItemSystemTest")
export class ItemSystemTest extends Component {
  private itemManager!: ItemManager;
  private inventoryManager!: InventoryManager;
  private equipmentManager!: EquipmentManager;
  private attributeManager!: AttributeManager;

  start(): void {
    log("[ItemSystemTest] ===== 开始物品管理系统测试 =====");
    this.setupManagers();
    this.testInventoryStacking();
    this.testInventoryFull();
    this.testEquipUnequip();
    this.testAttributeIntegration();
    log("[ItemSystemTest] ===== 测试完成 =====");
  }

  private setupManagers(): void {
    // 创建物品管理器并加载模板
    this.itemManager = new ItemManager();
    this.itemManager.loadTemplates(TEST_ITEMS);

    // 创建属性管理器
    const equipmentTable = new Map<string, EquipmentTemplate>();
    for (const eq of TEST_EQUIPMENT) {
      equipmentTable.set(eq.id, eq);
    }
    this.attributeManager = new AttributeManager({ equipmentTable });

    // 创建背包管理器
    this.inventoryManager = new InventoryManager({
      maxSlots: 10,
      itemTemplateTable: new Map(TEST_ITEMS.map((i) => [i.id, i])),
    });

    // 创建装备管理器
    this.equipmentManager = new EquipmentManager({
      inventoryManager: this.inventoryManager,
      itemManager: this.itemManager,
      attributeManager: this.attributeManager,
    });

    log("[ItemSystemTest] 管理器初始化完成");
  }

  private testInventoryStacking(): void {
    log("[ItemSystemTest] --- 测试：堆叠功能 ---");

    // 测试堆叠（药水堆叠上限 10）
    const result1 = this.inventoryManager.addItem("potion", 5);
    log(`[ItemSystemTest] 添加 5 个药水: ${result1}`);

    const result2 = this.inventoryManager.addItem("potion", 8);
    log(`[ItemSystemTest] 再添加 8 个药水: ${result2} (应分成两堆: 10+3)`);

    const inventory = this.inventoryManager.getInventory();
    const nonNullSlots = inventory.filter((s) => s !== null);
    log(`[ItemSystemTest] 当前占用格子: ${nonNullSlots.length} (期望: 2)`);

    let potionCount = 0;
    for (const slot of nonNullSlots) {
      if (slot?.itemId === "potion") {
        potionCount += slot.count;
        log(`[ItemSystemTest] 药水堆叠: ${slot.count} 个`);
      }
    }
    log(`[ItemSystemTest] 药水总数: ${potionCount} (期望: 13)`);

    // 验证测试通过
    if (potionCount === 13 && nonNullSlots.length === 2) {
      log("[ItemSystemTest] ✓ 堆叠测试通过");
    } else {
      log("[ItemSystemTest] ✗ 堆叠测试失败");
    }

    // 清理
    this.inventoryManager.removeItem("potion", 13);
  }

  private testInventoryFull(): void {
    log("[ItemSystemTest] --- 测试：背包满 ---");

    // 填满背包（每个装备占一格）
    for (let i = 0; i < 10; i++) {
      this.inventoryManager.addItem("sword", 1);
    }

    const result = this.inventoryManager.addItem("shield", 1);
    log(`[ItemSystemTest] 背包满时添加物品: ${result} (期望: false)`);

    if (!result) {
      log("[ItemSystemTest] ✓ 背包满测试通过");
    } else {
      log("[ItemSystemTest] ✗ 背包满测试失败");
    }

    // 清理解包
    for (let i = 0; i < 10; i++) {
      this.inventoryManager.removeFromSlot(i, 1);
    }
  }

  private testEquipUnequip(): void {
    log("[ItemSystemTest] --- 测试：装备/脱下 ---");

    // 添加剑和盾到背包
    this.inventoryManager.addItem("sword", 1);
    this.inventoryManager.addItem("shield", 1);

    // 装备剑
    const equipResult1 = this.equipmentManager.equip("sword");
    log(`[ItemSystemTest] 装备铁剑: ${equipResult1}`);

    // 检查背包（剑应该不见了）
    const swordInInventory = this.inventoryManager.getItemCount("sword");
    log(`[ItemSystemTest] 背包中铁剑数量: ${swordInInventory} (期望: 0)`);

    // 检查装备栏
    const equippedWeapon = this.equipmentManager.getItemAtSlot("weapon");
    log(`[ItemSystemTest] 已装备武器: ${equippedWeapon} (期望: sword)`);

    // 脱下剑
    const unequipResult = this.equipmentManager.unequip("weapon");
    log(`[ItemSystemTest] 脱下铁剑: ${unequipResult}`);

    // 检查背包（剑应该回来了）
    const swordBack = this.inventoryManager.getItemCount("sword");
    log(`[ItemSystemTest] 脱下后铁剑数量: ${swordBack} (期望: 1)`);

    if (equipResult1 && swordInInventory === 0 && equippedWeapon === "sword" && unequipResult && swordBack === 1) {
      log("[ItemSystemTest] ✓ 装备/脱下测试通过");
    } else {
      log("[ItemSystemTest] ✗ 装备/脱下测试失败");
    }
  }

  private testAttributeIntegration(): void {
    log("[ItemSystemTest] --- 测试：属性集成 ---");

    // 基础属性
    const baseAttrs: Partial<Record<"atk" | "def", number>> = {
      atk: 10,
      def: 5,
    };

    // 没有任何装备时的属性
    const runtime1: CharacterRuntime = {
      baseAttrs,
      equipped: {},
      buffs: [],
    };
    const attrs1 = this.attributeManager.getFinalAttrs(runtime1);
    log(`[ItemSystemTest] 无装备时攻击力: ${attrs1.atk} (期望: 10)`);

    // 装备剑
    this.inventoryManager.addItem("sword", 1);
    this.equipmentManager.equip("sword");

    // 获取当前装备状态并计算属性
    const runtime2 = this.equipmentManager.createCharacterRuntime(baseAttrs, []);
    const attrs2 = this.attributeManager.getFinalAttrs(runtime2);
    log(`[ItemSystemTest] 装备铁剑后攻击力: ${attrs2.atk} (期望: 20, 基础10+装备10)`);

    // 卸下剑
    this.equipmentManager.unequip("weapon");
    const runtime3 = this.equipmentManager.createCharacterRuntime(baseAttrs, []);
    const attrs3 = this.attributeManager.getFinalAttrs(runtime3);
    log(`[ItemSystemTest] 卸下铁剑后攻击力: ${attrs3.atk} (期望: 10)`);

    if (attrs1.atk === 10 && attrs2.atk === 20 && attrs3.atk === 10) {
      log("[ItemSystemTest] ✓ 属性集成测试通过");
    } else {
      log("[ItemSystemTest] ✗ 属性集成测试失败");
    }
  }
}
