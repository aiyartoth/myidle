/**
 * 存档系统集成测试
 * 使用方法：将此组件挂载到场景中的任意节点，运行游戏查看控制台输出
 */
import { _decorator, Component, log } from "cc";
import { ItemManager } from "../Controller/ItemManager";
import { InventoryManager } from "../Controller/InventoryManager";
import { EquipmentManager } from "../Controller/EquipmentManager";
import { AttributeManager } from "../Controller/AttributeManager";
import { SaveManager } from "../Controller/SaveManager";
import type { ItemTemplate, EquipmentTemplate } from "../types/types";

const { ccclass } = _decorator;

// 测试用物品模板
const TEST_ITEMS: ItemTemplate[] = [
  {
    id: "potion",
    name: "生命药水",
    type: "consumable",
    stackLimit: 10,
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

// 测试用装备模板
const TEST_EQUIPMENT: EquipmentTemplate[] = [
  {
    id: "sword",
    name: "铁剑",
    slot: "weapon",
    modifiers: [{ attrId: "atk", type: "flat", value: 10 }],
  },
  {
    id: "shield",
    name: "木盾",
    slot: "armor",
    modifiers: [{ attrId: "def", type: "flat", value: 5 }],
  },
];

@ccclass("SaveSystemTest")
export class SaveSystemTest extends Component {
  private itemManager!: ItemManager;
  private inventoryManager!: InventoryManager;
  private equipmentManager!: EquipmentManager;
  private attributeManager!: AttributeManager;
  private saveManager!: SaveManager;

  async start(): Promise<void> {
    log("[SaveSystemTest] ===== 开始存档系统测试 =====");
    this.setupManagers();

    // 清理测试存档
    this.saveManager.deleteSlot(99);
    this.saveManager.deleteSlot(98);

    await this.testSaveLoadCycle();
    await this.testAutoSave();
    await this.testSlotIsolation();

    // 清理
    this.saveManager.deleteSlot(99);
    this.saveManager.deleteSlot(98);

    log("[SaveSystemTest] ===== 测试完成 =====");
  }

  private setupManagers(): void {
    // 创建物品管理器
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

    // 创建存档管理器
    this.saveManager = new SaveManager({
      inventoryManager: this.inventoryManager,
      equipmentManager: this.equipmentManager,
    });

    log("[SaveSystemTest] 管理器初始化完成");
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async testSaveLoadCycle(): Promise<void> {
    log("[SaveSystemTest] --- 测试：存取周期 ---");

    // 初始状态
    this.inventoryManager.addItem("potion", 5);
    this.inventoryManager.addItem("sword", 1);
    this.equipmentManager.equip("sword");

    // 记录保存前的状态
    const preSaveInventory = JSON.stringify(this.inventoryManager.getInventory());
    const preSaveEquipped = JSON.stringify(this.equipmentManager.getEquipped());

    log(`[SaveSystemTest] 保存前背包: ${preSaveInventory}`);
    log(`[SaveSystemTest] 保存前装备: ${preSaveEquipped}`);

    // 保存到测试槽位
    const saveResult = this.saveManager.saveToSlot(99);
    log(`[SaveSystemTest] 保存结果: ${saveResult}`);

    // 修改状态（模拟游戏继续）
    this.inventoryManager.clear();
    this.equipmentManager.clear();
    this.inventoryManager.addItem("shield", 1);

    log(`[SaveSystemTest] 修改后背包: ${JSON.stringify(this.inventoryManager.getInventory())}`);

    // 加载存档
    const loadResult = this.saveManager.loadFromSlot(99);
    if (loadResult.success && loadResult.data) {
      this.saveManager.deserialize(loadResult.data.state);
    }

    // 验证状态恢复
    const postLoadInventory = JSON.stringify(this.inventoryManager.getInventory());
    const postLoadEquipped = JSON.stringify(this.equipmentManager.getEquipped());

    log(`[SaveSystemTest] 加载后背包: ${postLoadInventory}`);
    log(`[SaveSystemTest] 加载后装备: ${postLoadEquipped}`);

    if (postLoadInventory === preSaveInventory && postLoadEquipped === preSaveEquipped) {
      log("[SaveSystemTest] ✓ 存取周期测试通过");
    } else {
      log("[SaveSystemTest] ✗ 存取周期测试失败 - 状态不匹配");
    }
  }

  private async testAutoSave(): Promise<void> {
    log("[SaveSystemTest] --- 测试：自动保存 ---");

    // 清理并启用自动保存
    this.inventoryManager.clear();
    this.equipmentManager.clear();
    this.saveManager.enableAutoSave(99);

    // 触发背包变化
    this.inventoryManager.addItem("potion", 3);

    // 等待防抖完成
    log("[SaveSystemTest] 等待自动保存（600ms）...");
    await this.delay(600);

    // 验证自动保存是否触发
    const result = this.saveManager.loadFromSlot(99);
    if (result.success && result.data) {
      const potionCount = result.data.state.inventory.slots
        .filter((s) => s?.itemId === "potion")
        .reduce((sum, s) => sum + (s?.count ?? 0), 0);

      if (potionCount === 3) {
        log("[SaveSystemTest] ✓ 自动保存测试通过");
      } else {
        log(`[SaveSystemTest] ✗ 自动保存测试失败 - 药水数量: ${potionCount}, 期望: 3`);
      }
    } else {
      log("[SaveSystemTest] ✗ 自动保存测试失败 - 无法加载存档");
    }

    this.saveManager.disableAutoSave();
  }

  private async testSlotIsolation(): Promise<void> {
    log("[SaveSystemTest] --- 测试：存档槽位隔离 ---");

    // 清理
    this.saveManager.deleteSlot(98);
    this.saveManager.deleteSlot(99);

    // 槽位 99: 有药水
    this.inventoryManager.clear();
    this.inventoryManager.addItem("potion", 5);
    this.saveManager.saveToSlot(99);

    // 槽位 98: 有剑
    this.inventoryManager.clear();
    this.inventoryManager.addItem("sword", 1);
    this.saveManager.saveToSlot(98);

    // 验证槽位 99
    const result99 = this.saveManager.loadFromSlot(99);
    const slot99HasPotion = result99.success && result99.data?.state.inventory.slots
      .some((s) => s?.itemId === "potion" && s.count === 5);

    // 验证槽位 98
    const result98 = this.saveManager.loadFromSlot(98);
    const slot98HasSword = result98.success && result98.data?.state.inventory.slots
      .some((s) => s?.itemId === "sword" && s.count === 1);

    // 验证隔离性
    const slot99HasSword = result99.success && result99.data?.state.inventory.slots
      .some((s) => s?.itemId === "sword");

    if (slot99HasPotion && slot98HasSword && !slot99HasSword) {
      log("[SaveSystemTest] ✓ 存档槽位隔离测试通过");
    } else {
      log(`[SaveSystemTest] ✗ 存档槽位隔离测试失败`);
      log(`  槽位99有药水: ${slot99HasPotion}`);
      log(`  槽位98有剑: ${slot98HasSword}`);
      log(`  槽位99无剑: ${!slot99HasSword}`);
    }
  }
}
