---
name: cdp-component-slots
description: Use when a CDP component needs named slots, scoped slots, dynamic slots, or renders _slots / _scopedSlots in its implementation.
---

# 声明插槽

## 概述

为 CDP 组件声明可被设计器填充的内容区域。slots 与 `LAYOUT_CONTAINER` trait 是两条独立机制：slots 控制具名/作用域/动态插槽，trait 控制默认 children 区域。

## 何时使用

**先判断是否属于本 skill 范围**。如果用户需求是“一个默认 children 主区”（如 Card / Section 内容区）或“强组合关系”（如 Tabs/TabPane），**先切到 `cdp-component-traits` skill**，本 skill 不负责这些场景。

| 子内容形态 | 用法 |
|---|---|
| 多个具名固定区域（Modal 的 footer、Card 的 header / extra） | 命名插槽 |
| 子内容需要行 / 列上下文（record、rowIndex） | 作用域插槽（`scoped: true`） |
| 根据 props 数组生成多个区域（列模板、行模板） | 动态插槽（`dynamic: true`，**列/行模板通常同时 `scoped: true`**） |
| 单一匿名子区域 | **不用 slots**、不在本 skill，用 `LAYOUT_CONTAINER` trait |
| 强组合关系（Tabs/TabPane、Steps/Step） | **不用 slots**、不在本 skill，用 `LAYOUT_CONTAINER` + `nesting.allowedChildren` |
| 既有匿名主区又有具名扩展区（带 header/footer 的 Card） | slots **加上** `LAYOUT_CONTAINER` trait（两套并存） |

trait / nesting 选择交给 `cdp-component-traits` skill。

## 关键约束

- **slots 与 `LAYOUT_CONTAINER` 正交**：宿主在运行时独立判断。只用 slots 时**不需要**声明 `LAYOUT_CONTAINER` trait。
- **每个 slot 必须有 `title`** —— `validateManifest()` 会报 error。
- **动态 slot 必须有 `dynamicSource` 与 `dynamicKey`**
  - `dynamicSource`：props 中作为模板源的数组字段名（如 `'columns'`）
  - `dynamicKey`：含 `{...}` 占位符的稳定 key 模板（如 `'col:{dataIndex}'`）
- **作用域 slot 建议有 `scopeDescription`** —— 设计器与 AI 工具据此理解可用上下文。
- **组件实现必须实际渲染 `_slots[name]` 或 `_scopedSlots[name]`** —— 仅声明不渲染会让设计器显示插槽但运行时无内容。
- 命名/动态非作用域 slot 用 `_slots[name]`；作用域 slot 用 `_scopedSlots[name]`。

## 引导路径

事实源（优先读取目标项目本地 SDK 文档）：

- `node_modules/cdp-material-sdk/docs/component-development/recipes/声明插槽.md`
- `node_modules/cdp-material-sdk/docs/component-development/reference/Slots模型.md`

`references/slots.md` 仅作为导航与 fallback 提示。

## 工作流程

1. 判断子内容形态。如不属于本 skill 范围（单一匿名主区 / 强组合关系 / 不接子内容），切到 `cdp-component-traits` skill。
2. 在 manifest 顶层声明 `slots` 字段，每个 slot 至少有 `title`。
3. 按需加 `scoped: true` + `scopeDescription`、或 `dynamic: true` + `dynamicSource` + `dynamicKey`。列 / 行模板动态 slot 几乎总是同时是作用域。
4. 在组件实现中从 props 解构 `_slots` / `_scopedSlots`：
   - 命名 / 非作用域动态插槽：`{_slots[name]}`
   - 作用域插槽：`{_scopedSlots[name]?.(scope)}`，其中 `scope` 是一个包含上下文字段（如 `record`、`rowIndex`）的对象
   - **具体调用参数名称与类型必须从 SDK recipe 示例代码复制**，不要凭印象猜。
5. 修改 manifest 后从 `cdp-material-sdk/portable` 导入 `validateManifest` 并执行校验。

## 常见错误

| 错误 | 修复 |
|---|---|
| 单一匿名子区域用 slots | 改用 `LAYOUT_CONTAINER` trait（cdp-component-traits） |
| 强组合关系（Tabs/TabPane）用 slots | 改用 `LAYOUT_CONTAINER` + `nesting.allowedChildren` / `allowedParents` |
| 同时加 `LAYOUT_CONTAINER` 与 slots，但只想要具名插槽 | 删掉 `LAYOUT_CONTAINER`：二者正交，slots 不依赖该 trait |
| 声明了 slot 但组件没渲染 `_slots[name]` | 在组件实现中补上渲染——设计器看到插槽 ≠ 运行时有内容 |
| 动态 slot 缺 `dynamicKey` 或用 `:` 等非模板格式 | 用 `'col:{dataIndex}'` 格式：含 `{字段}` 占位符 |
| 作用域 slot 用 `_slots[name]` 取数据 | 用 `_scopedSlots[name]?.(scope)`，否则拿不到 scope props |
| 用 React render-prop / Context 自建作用域传递 record / rowIndex | SDK 的作用域 slot 已封装完整机制，声明 `scoped: true` 后在实现侧用 `_scopedSlots[name]?.(scope)` 即可 |
| 列 / 行模板动态 slot 漏写 `scoped: true` | 动态 slot 根据数据生成多个实例，几乎总需要行/列上下文；补上 `scoped: true` 与 `scopeDescription` |
| 把 events / actions / state 当 slots 写 | 走 cdp-component-events-actions-state skill |

## 完成检查

- [ ] 每个 slot 都声明了 `title`
- [ ] 动态 slot 声明了 `dynamicSource` 与 `dynamicKey`
- [ ] 作用域 slot 声明了 `scopeDescription`
- [ ] 组件实现实际渲染了 `_slots` 或 `_scopedSlots`
- [ ] 不需要默认 children 区域时未声明 `LAYOUT_CONTAINER`
- [ ] `validateManifest()` 无 error

## 维护来源

- `cdp-material-sdk/docs/component-development/recipes/声明插槽.md`
- `cdp-material-sdk/docs/component-development/reference/Slots模型.md`
