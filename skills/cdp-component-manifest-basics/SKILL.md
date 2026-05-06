---
name: cdp-component-manifest-basics
description: Use when declaring component props with JSON Schema, configuring designer metadata (icon, category, hiddenInComponentList, designer.* fields), or adjusting how a CDP component appears in the designer.
---

# Manifest 基础：props 与设计器元信息

## 概述

`props` 是组件向**设计器、表达式、AI 工具**暴露的**可配置项契约**（JSON Schema 标准），不是 React props 接口的镜像。`meta` 决定组件在物料面板的呈现与归类。

## 何时使用

| 场景 | 字段 |
|---|---|
| 给组件加可在设计器配置的输入项 | `props` |
| 设置物料面板显示名 / 分类 / 图标 / 描述 | `meta.title` / `category` / `icon` / `description` |
| 同分类下二次分组 | `meta.subGroup` |
| 父子绑定子部件不想单独出现在面板 | `meta.hiddenInComponentList: true` |
| 字段已由 trait 自动注入（DATA_FIELD 的 value 等） | **不在本 skill**——勿重复声明，见 `cdp-component-traits` |
| 事件 / 运行时状态 / 命令式调用 | **不在本 skill**——见 `cdp-component-events-actions-state` |

## props（JSON Schema）核心约束

- 顶层 `{ type: 'object', properties: { ... } }`
- **每个字段必须有 `title`**（`validateManifest()` 缺失会 warning，设计器 fallback 到 key 名）
- **默认值写在 schema `default`**，不是 React 组件参数默认值——后者设计器看不到
- **枚举优先用 `oneOf` 配 `{ const, title }`**（每选项可有差异化中文标签）；纯值列表才用 `enum`
- 嵌套：对象 `type: 'object' + properties`；数组 `type: 'array' + items: { type: 'object', properties }`
- `format` 提示设计器控件：`dataField`（字段选择器）、`color`、`icon`、`expression`、`panelButton`

### 不要写进 props

- 事件回调（如 `onChange`） → 走 events / customEvents
- 内部运行时状态 → 走 state
- 命令式调用 → 走 actions
- trait 自动注入字段（DATA_FIELD 的 `value` / `readOnly` 等） → 删掉，重复声明会覆盖引擎版本并丢失 `valueSchema` 自动特化

### 与 adapter.propMapping 的边界

`props.properties` 的 key 是**面向设计器的 CDP 名**。React 组件实际接收的 prop 名不同时（如第三方 `selectedValue`），用 `adapter.propMapping` 映射，**不要为了贴合第三方而改 manifest key**——manifest key 是表达式 / AI / 设计器看到的稳定名。

## meta 字段

| 字段 | 必填 | 用途 |
|---|:---:|---|
| `meta.title` | ✅ | 物料面板显示名 / 设计器节点名 |
| `meta.category` | ✅ | 顶层分类（`COMPONENT_CATEGORY.*` 常量） |
| `meta.description` | | Tooltip + AI 上下文 |
| `meta.subGroup` | | 同 category 下二次分组（同包内复用同字符串） |
| `meta.icon` | | 物料面板图标（设计器内置图标名优先） |
| `meta.hiddenInComponentList` | | 隐藏于物料面板，仍可被 nesting / slots 加入 |

`hiddenInComponentList: true` 适用：

- **父子绑定子部件**（TabPane / StepItem / TableColumn——必须通过父 nesting / slots 暴露）
- **内部辅助组件**
- **过渡期废弃组件**（保 `type` 兼容性）

不要用它"软删除"未实现的组件——直接不导出更清晰。

## 引导路径

事实源（优先读取目标项目本地 SDK 文档）：

- `node_modules/cdp-material-sdk/docs/component-development/recipes/声明props.md`
- `node_modules/cdp-material-sdk/docs/component-development/recipes/配置设计器元信息.md`
- `node_modules/cdp-material-sdk/docs/component-development/reference/Manifest字段参考.md`

`references/` 仅作为导航与 fallback 提示。

## 工作流程

1. props：列出**对外可配置项**（去掉事件 / 状态 / actions / trait 自动注入字段）。
2. 顶层 `{ type: 'object', properties }`；每字段写 `type` + `title` + 必要 `default`。
3. 枚举用 `oneOf` 配 `{ const, title }`；嵌套用 object/array 标准结构；字段控件提示用 `format`。
4. meta：填 `title` + `category`，按需 `description` / `subGroup` / `icon` / `hiddenInComponentList`。
5. 修改 manifest 后从 `cdp-material-sdk/portable` 导入 `validateManifest` 执行校验。

## 常见错误

| 错误 | 修复 |
|---|---|
| 把 React `onChange` / 内部状态 / 运行时数据写进 props | 删掉，分别走 events / state / actions |
| 重复声明 trait 自动注入 props | 删掉，仅留业务专属 props |
| 默认值写在 React 组件参数而非 schema `default` | 移到 `props.properties.X.default`，设计器才能预填 |
| 缺 `title` | 补；设计器会 fallback 到 key 名，不利于 i18n |
| 用 `enum` 列字符串失去差异化标签 | 改 `oneOf` 配 `{ const, title }` |
| 第三方 prop 名直接当 manifest key | manifest key 用 CDP 名；第三方 rename 走 `adapter.propMapping` |
| 数组 `items` 漏 `type: 'object'` 或 `properties` | 补全；嵌套字段同样需 `title` |
| 字段需设计器选择器但不用 `format`（如 `dataIndex` 不用 `format: 'dataField'`） | 加上对应 `format`，设计器才能渲染专用控件 |
| 漏 `meta.title` 或 `meta.category` | 必填，`validateManifest()` error |
| 子部件类组件未声明 `hiddenInComponentList: true` | 加上，避免被单独拖入面板 |
| 用 `hiddenInComponentList` 软删除未实现组件 | 直接不导出该组件 |

## 完成检查

- [ ] props 顶层 `{ type: 'object', properties }`；每字段有 `title`；默认值写 schema `default`
- [ ] props 中无事件 / 状态 / actions / trait 自动注入字段
- [ ] 枚举字段用 `oneOf` + `{ const, title }` （或纯值列表用 `enum`）
- [ ] meta 含必填 `title` 与 `category`；`subGroup` 同包内复用同一常量
- [ ] 子部件类组件已声明 `hiddenInComponentList: true`
- [ ] `validateManifest()` 无 error

## 维护来源

- `cdp-material-sdk/docs/component-development/recipes/声明props.md`
- `cdp-material-sdk/docs/component-development/recipes/配置设计器元信息.md`
- `cdp-material-sdk/docs/component-development/reference/Manifest字段参考.md`
