/**
 * 存档系统类型定义
 */
import type { InventorySlot, EquipmentSlot, AttrId } from "./types";

/** 存档版本号 */
export const SAVE_VERSION = 1;

/** 存档键前缀 */
export const SAVE_KEY_PREFIX = "idle-save-";

/** 游戏状态数据（可序列化） */
export interface GameState {
  /** 背包状态 */
  inventory: InventoryState;
  /** 装备状态 */
  equipment: EquipmentState;
  /** 角色基础属性 */
  character: CharacterState;
}

/** 背包存档状态 */
export interface InventoryState {
  slots: (InventorySlot | null)[];
  maxSlots: number;
}

/** 装备存档状态 */
export interface EquipmentState {
  equipped: Partial<Record<EquipmentSlot, string>>;
}

/** 角色存档状态 */
export interface CharacterState {
  baseAttrs: Partial<Record<AttrId, number>>;
}

/** 存档元数据 */
export interface SaveMetadata {
  /** 存档槽位号 */
  slot: number;
  /** 存档版本 */
  version: number;
  /** 存档时间戳（毫秒） */
  timestamp: number;
  /** 游戏时长（秒） */
  playTime?: number;
}

/** 完整存档数据（包含元数据和游戏状态） */
export interface SaveData {
  meta: SaveMetadata;
  state: GameState;
}

/** 存档列表项 */
export interface SaveListItem extends SaveMetadata {
  /** 存档是否存在 */
  exists: boolean;
}

/** 存档加载结果 */
export interface LoadResult {
  success: boolean;
  data?: SaveData;
  error?: string;
}
