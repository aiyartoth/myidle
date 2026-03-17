# 放置游戏 - 属性/装备/道具/Buff 数据管理示例

本目录是 [设计文档](../../docs/placement-game-data-design.md) 的配套示例代码，实现：

- **属性**：基础 + 装备 + Buff，统一用「属性修饰」表示，带来源
- **装备**：槽位 + 静态表，参与属性计算
- **Buff**：临时修饰，带剩余时间与来源
- **属性明细**：每条属性的数值、固定/百分比拆分、以及「来自哪里」

## 文件说明

| 文件 | 说明 |
|------|------|
| `types.ts` | 属性 ID、修饰、装备、Buff、道具、角色运行时等类型定义 |
| `attribute-manager.ts` | 属性管理器：汇总修饰、计算最终属性、产出明细与来源列表 |
| `example-usage.ts` | 示例：创建角色/装备/Buff，打印属性明细与当前 Buff |

## 如何运行示例

在项目根目录（或本目录）安装依赖后，用 `tsx` 或 `ts-node` 运行（不参与主项目 build）：

```bash
# 若未安装 tsx
pnpm add -D tsx

# 在项目根目录执行
pnpm exec tsx examples/placement-game-data/example-usage.ts
```

或将 `examples/placement-game-data/` 下的 `types.ts`、`attribute-manager.ts` 复制到你的游戏项目中，再按需扩展装备穿戴、道具使用、Buff 计时与移除逻辑。

## 扩展建议

- **装备穿戴**：维护 `CharacterRuntime.equipped`，穿戴/脱下时更新并重算属性
- **道具使用**：扣背包数量，根据 `ItemTemplate.effect` 施加 Buff 或回血，再更新 `runtime.buffs` / 当前血量
- **Buff 计时**：每帧或定时器对 `runtime.buffs` 中每条 `remainingMs` 扣减，≤0 时移除，再调用 `getAttrDetails` 刷新展示
- **属性明细 UI**：用 `getAttrDetails()` 返回的 `AttrDetailRow[]` 渲染表格，用 `sources` 显示「来自 xxx」
