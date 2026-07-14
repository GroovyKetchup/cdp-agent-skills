---
name: cdp-component-traits
description: Use when a CDP component needs DATA_FIELD value semantics, DATA_CONTAINER data scope, LAYOUT_CONTAINER default children area, INTERACTION_DRILLABLE controlled drill behavior, or nesting constraints (allowedChildren / allowedParents).
---

# 声明 Traits

## 概述

CDP traits 互不互斥，按组件形态组合声明：

- `DATA_FIELD`：单值字段（value / onChange）
- `DATA_CONTAINER`：管理子字段数据作用域
- `LAYOUT_CONTAINER`：默认 children 区域开关
- `INTERACTION_DRILLABLE`：宿主管理状态的层级下钻能力

`nesting` 配合 `LAYOUT_CONTAINER` 限制可拖入的子 / 父类型。

## 何时使用

| 组件形态 | trait 组合 |
|---|---|
| 单值输入字段（Input / Select / Switch / DatePicker） | `DATA_FIELD` |
| 表单（Form / FieldSet） | `DATA_CONTAINER` + `LAYOUT_CONTAINER` |
| 数据列表（Table / List / CardList） | `DATA_CONTAINER`（行/列模板走 `cdp-component-slots`） |
| 通用布局容器（Card / Section / Grid） | `LAYOUT_CONTAINER` |
| 强组合关系（Tabs / Steps / Collapse） | `LAYOUT_CONTAINER` + `nesting.allowedChildren` / `allowedParents` |
| 仅展示（Text / Icon / Badge） | 不声明 trait |
| 层级下钻（Chart / Table / CardList） | `INTERACTION_DRILLABLE` |
| 仅具名/作用域/动态插槽，无默认 children 主区 | 不在本 skill，走 `cdp-component-slots` |

`LAYOUT_CONTAINER` 与 `manifest.slots` **正交**：只用 slots 不需要本 trait；slots 工作流走 `cdp-component-slots` skill。

## DATA_FIELD：自动注入清单（关键）

声明 `DATA_FIELD` 后，引擎按 `meta.valueSchema` 自动注入并特化以下字段——**默认不要重复声明**（重复会覆盖引擎版本并丢失 `valueSchema` 自动特化）：

- Props：`value` / `readOnly` / `required` / `name` / `label` / `labelStrategy`
- Events：`valueChange`
- Actions：`getValue` / `setValue` / `getReadOnly` / `setReadOnly` / `toggleReadOnly` / `getRequired` / `setRequired` / `toggleRequired` / `triggerValueChange`
- State：`value` / `readOnly` / `required`

manifest 里只写**业务专属** props（如 `placeholder`、`options`）；`meta.valueSchema` 必含 `type` 与 `default`。组件接收 `value`、调用 `onChange(nextValue)`（**不是** `onChange(event)`）；接收 `readOnly` / `required` 后必须在 UI 真正生效。

## DATA_CONTAINER：数据作用域

需要：`meta.valueSchema` 描述容器值结构；在子组件渲染区域包 `DataScope`（从 `cdp-material-sdk/host-react` 导入）。

- 读写容器数据：默认用 `useDataContainerApi`（命令式，引用稳定）；仅当 UI 必须随容器值刷新时才用 `useDataContainer`（订阅式）。
- 字段状态聚合：用 SDK 的 `useFieldRegistry()`，不手写注册表。
- DataScope 入参 `getRecord` / `register*` 必须引用稳定（`useCallback` 或 `useFieldRegistry`）；**不传** `componentId`。详细入参表（对象型 vs 数组型容器）见 `references/traits.md`。

同时接收字段子组件时 → 加 `LAYOUT_CONTAINER`（典型 Form）。

## LAYOUT_CONTAINER 与 nesting

声明 `LAYOUT_CONTAINER` 后，宿主把 `schema.children` 递归渲染为 React `children` 注入。组件实现必须渲染 `{children}`。

`nesting` 约束默认 children 区域：

- `allowedChildren` / `allowedParents`：限制可拖入的子 / 允许的父 `type`
- `minChildren` / `maxChildren`：数量约束
- 强组合关系（Tabs/TabPane 类）**双向声明**。

`nesting.allowedChildren` 与 `slots.allowedChildren` 是不同字段：前者管默认 children 区域，后者管具名 slot 区域。

## INTERACTION_DRILLABLE：受控下钻

声明 `COMPONENT_TRAIT.INTERACTION_DRILLABLE` 后，宿主 Feature 自动维护并注入：

- Prop：`drillPath`、`onDrillNavigateRequest`、`onDrillResetRequest`
- Event：`drill:navigateRequest`、`drill:resetRequest`
- Actions：`drillPush`、`drillPopTo`、`drillReset`
- State：`drillPath`

组件只接收 `drillPath` 展示路径，选择历史节点时调用 `onDrillNavigateRequest({ index })`，返回根层时调用 `onDrillResetRequest()`。不要在组件内维护第二份路径，也不要在 manifest 重复声明上述字段。路径 UI 应复用所属外置 UI 库的共享视图；SDK 不提供 Hook、HOC 或 UI。

## 引导路径

事实源（优先读取目标项目本地 SDK 文档）：

- `node_modules/cdp-material-sdk/docs/component-development/recipes/声明数据字段组件.md`
- `node_modules/cdp-material-sdk/docs/component-development/recipes/声明数据容器组件.md`
- `node_modules/cdp-material-sdk/docs/component-development/recipes/声明布局容器组件.md`
- `node_modules/cdp-material-sdk/docs/component-development/reference/Traits能力模型.md`
- `node_modules/cdp-material-sdk/docs/component-development/recipes/声明层级下钻能力.md`
- `node_modules/cdp-material-sdk/docs/component-development/reference/层级下钻能力模型.md`

`references/` 仅作为导航与 fallback 提示。

## 工作流程

1. 按"何时使用"表判断 trait 组合。
2. 子内容形态：默认 children 主区 → `LAYOUT_CONTAINER`（+ `nesting`）；具名 / 作用域 / 动态插槽 → `cdp-component-slots` skill。
3. 数据角色：单值 → `DATA_FIELD` + `valueSchema`（勿重复声明自动注入字段）；容器 → `DATA_CONTAINER` + `valueSchema` + `DataScope`。
4. 实现侧契约：DATA_FIELD 调用 `onChange(nextValue)`、应用 `readOnly` / `required`；DATA_CONTAINER 包 `DataScope`、读数据用 `useDataContainerApi`；LAYOUT_CONTAINER 渲染 `{children}`。
5. 下钻能力：声明 `INTERACTION_DRILLABLE`，使用受控 props 展示路径，不重复声明或维护 trait 自动提供的契约。
6. 修改 manifest 后从 `cdp-material-sdk/portable` 导入 `validateManifest` 执行校验。

## 常见错误

| 错误 | 修复 |
|---|---|
| DATA_FIELD 重复声明自动注入字段（value / onChange / valueChange / getValue / setValue 等） | 删掉，只留业务专属 props |
| 组件 `onChange` 传整个 event 而非值 | 改为 `onChange?.(event.target.value)` 或对应值提取 |
| 接收 `readOnly` / `required` 但 UI 不生效 | 在渲染中真正应用，否则 setReadOnly 等 action UI 不变 |
| Form 只声明 DATA_CONTAINER，漏 LAYOUT_CONTAINER | 既管值又拖入字段，两 trait 都要 |
| DATA_CONTAINER 不包 DataScope | 按 recipe 加 `<DataScope getRecord={...}>{children}</DataScope>` |
| DataScope 传 inline 函数 / 手写注册表 | `useCallback` 包 `getRecord`；用 SDK `useFieldRegistry()` |
| 误用 `useDataContainer` 默认订阅整个容器值 | 默认用 `useDataContainerApi`；仅 UI 必须随容器值刷新时才订阅 |
| Tabs 用 slots 命名 panel1 / panel2 硬编码 | 改用 `LAYOUT_CONTAINER` + `nesting.allowedChildren: ['TabPane']` |
| 用 `slots.allowedChildren` 限制默认 children 子类型 | 用 `nesting.allowedChildren`；slots.allowedChildren 是约束 slot 区域 |
| 误以为 `LAYOUT_CONTAINER` 必须同时声明 slots | 二者正交；只有匿名主区时不需要 slots |
| 每个组件自己维护 `drillPath` 或重复声明下钻 actions/state | 删除本地状态和重复 manifest 字段，改为 `INTERACTION_DRILLABLE` + 受控 props |

## 完成检查

- [ ] trait 组合符合"何时使用"表
- [ ] DATA_FIELD：valueSchema 含 default；组件 `onChange(nextValue)`；无重复声明自动注入字段
- [ ] DATA_CONTAINER：valueSchema 完整；子区域包 `DataScope`；`getRecord` / `register*` 引用稳定
- [ ] Form 类同时拖入子组件 → 同时声明 `LAYOUT_CONTAINER`
- [ ] LAYOUT_CONTAINER：组件实际渲染 `{children}`；`nesting` 中 type 真实存在；强组合双向声明
- [ ] `validateManifest()` 无 error
- [ ] DRILLABLE：只声明 trait；组件受控渲染 `drillPath` 并发出导航请求，无第二份路径状态

## 维护来源

- `cdp-material-sdk/docs/component-development/recipes/声明数据字段组件.md`
- `cdp-material-sdk/docs/component-development/recipes/声明数据容器组件.md`
- `cdp-material-sdk/docs/component-development/recipes/声明布局容器组件.md`
- `cdp-material-sdk/docs/component-development/reference/Traits能力模型.md`
- `cdp-material-sdk/docs/component-development/recipes/声明层级下钻能力.md`
- `cdp-material-sdk/docs/component-development/reference/层级下钻能力模型.md`
