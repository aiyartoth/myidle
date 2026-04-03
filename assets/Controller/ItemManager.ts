/**
 * 物品管理器：管理物品模板定义和查询
 */
import type { ItemTemplate, EquipmentSlot, ItemType } from "../types/types";

export class ItemManager {
  private templateTable: Map<string, ItemTemplate>;

  constructor() {
    this.templateTable = new Map();
  }

  /**
   * 加载物品模板数据
   * @param templates 物品模板数组
   */
  loadTemplates(templates: ItemTemplate[]): void {
    for (const template of templates) {
      this.templateTable.set(template.id, template);
    }
  }

  /**
   * 加载单个物品模板
   * @param template 物品模板
   */
  loadTemplate(template: ItemTemplate): void {
    this.templateTable.set(template.id, template);
  }

  /**
   * 获取物品模板
   * @param itemId 物品 ID
   * @returns 物品模板或 null
   */
  getTemplate(itemId: string): ItemTemplate | null {
    return this.templateTable.get(itemId) ?? null;
  }

  /**
   * 检查物品是否存在
   * @param itemId 物品 ID
   */
  hasTemplate(itemId: string): boolean {
    return this.templateTable.has(itemId);
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): ItemTemplate[] {
    return Array.from(this.templateTable.values());
  }

  /**
   * 检查物品是否为装备
   * @param itemId 物品 ID
   */
  isEquipment(itemId: string): boolean {
    const template = this.getTemplate(itemId);
    return template?.type === "equipment";
  }

  /**
   * 检查物品是否为消耗品
   * @param itemId 物品 ID
   */
  isConsumable(itemId: string): boolean {
    const template = this.getTemplate(itemId);
    return template?.type === "consumable";
  }

  /**
   * 获取装备槽位
   * @param itemId 物品 ID
   * @returns 装备槽位或 null
   */
  getEquipmentSlot(itemId: string): EquipmentSlot | null {
    const template = this.getTemplate(itemId);
    if (template?.type === "equipment") {
      return template.equipmentSlot ?? null;
    }
    return null;
  }

  /**
   * 获取物品类型
   * @param itemId 物品 ID
   */
  getItemType(itemId: string): ItemType | null {
    const template = this.getTemplate(itemId);
    return template?.type ?? null;
  }

  /**
   * 获取物品名称
   * @param itemId 物品 ID
   */
  getItemName(itemId: string): string {
    const template = this.getTemplate(itemId);
    return template?.name ?? itemId;
  }

  /**
   * 获取物品堆叠上限
   * @param itemId 物品 ID
   */
  getStackLimit(itemId: string): number {
    const template = this.getTemplate(itemId);
    if (template?.stackLimit !== undefined) {
      return template.stackLimit;
    }
    // 默认：装备不可堆叠，其他可堆叠 99 个
    return template?.type === "equipment" ? 1 : 99;
  }

  /**
   * 获取物品使用效果（用于消耗品）
   * @param itemId 物品 ID
   */
  getItemEffect(itemId: string): ItemTemplate["effect"] | null {
    const template = this.getTemplate(itemId);
    return template?.effect ?? null;
  }
}