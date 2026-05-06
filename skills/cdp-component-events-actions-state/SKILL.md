---
name: cdp-component-events-actions-state
description: Use when declaring outbound events, imperative component methods (actions), or readable runtime state (state) on a CDP component manifest.
---

# 声明事件、动作、状态

## 概述

三种独立机制：**events** 让组件向宿主通知；**actions** 让宿主命令式调用组件方法；**state** 让宿主表达式只读访问组件运行时数据。

## 何时使用

| 需求 | 字段 |
|---|---|
| 组件需要通知宿主（值变、点击、行点击、业务事件） | `events` / `customEvents` |
| 外部流程需要命令式调用组件方法（refresh、clear、focus） | `actions` |
| 外部表达式需要读取组件运行时数据（loading、selectedRowKeys） | `state` |
| 子内容承载（命名 / 作用域 / 动态插槽） | **不在本 skill** —— 走 `cdp-component-slots` |
| DATA_FIELD 自动注入的 `valueChange` / `getValue` / `setValue` / `value` 等 | **不在本 skill** —— 见 `cdp-component-traits`，**勿重复声明** |
| 包装第三方组件 prop 名 / 回调签名不同 | adapter 部分见 `cdp-component-adapter-and-wrap` |

## events / customEvents 核心约束

- **优先用标准事件**（`click` / `focus` / `blur` / `valueChange` / `itemClick` / `itemDoubleClick` / `itemRightClick` / `itemLongPress` / `dataFetch`）写在 `events`。完整清单见 SDK `Events模型.md`。
- **标准事件不能覆盖时**才声明 `customEvents`，且：
  - 名字必须 namespaced（`acme:rowAction`、`table:filterChange`）
  - 必须声明 `payloadSchema`（`validateManifest()` 强校验）
- **adapter 中映射的事件必须先在 manifest 声明**（`adapter.events` ↔ `events`，`adapter.customEvents` ↔ `customEvents`）。

## actions 核心约束

- 每个 action 必须有 `title`
- 有参数的 action：**`params.type` 必须是 `'object'`**（不能是 array 或单一类型）
- 建议声明 `returns`（warning 级别）
- **manifest 中的 action key 必须与 React ref 方法名一致**——通过 `useImperativeHandle` 暴露
- 修改 manifest 后用 `diagnoseMissingActionImpls()` 校验 ref 实现覆盖

## state 核心约束

- 每个 state 必须有 `title` 和 `schema`
- **state key 必须暴露在 `COMPONENT_STATE_KEY` 对象下**（从 `cdp-material-sdk/portable` 导入常量；**不**手写 `'__state'` 字符串）
- state 是**只读快照**——外部修改请走 action
- `useImperativeHandle` 的 **依赖数组必须包含所有暴露的 state 值**，否则外部读到 stale closure 旧值
- 修改后用 `diagnoseMissingStateKeys()` 校验

### 实现骨架

```tsx
import { forwardRef, useImperativeHandle, useState } from 'react';
import { COMPONENT_STATE_KEY } from 'cdp-material-sdk/portable';

export const Comp = forwardRef((props, ref) => {
  const [keyword, setKeyword] = useState('');
  useImperativeHandle(ref, () => ({
    refresh: async () => { /* ... */ return true; },
    [COMPONENT_STATE_KEY]: { keyword },
  }), [keyword]);
  return <div />;
});
```

## 引导路径

事实源（优先读取目标项目本地 SDK 文档）：

- `node_modules/cdp-material-sdk/docs/component-development/recipes/声明事件.md`
- `node_modules/cdp-material-sdk/docs/component-development/recipes/声明动作与状态.md`
- `node_modules/cdp-material-sdk/docs/component-development/reference/Events模型.md`
- `node_modules/cdp-material-sdk/docs/component-development/reference/ActionsState模型.md`

`references/` 仅作为导航与 fallback 提示。

## 工作流程

1. 判断需要哪类能力（按"何时使用"表）。如属于 slots / DATA_FIELD 自动注入，切到对应 skill。
2. events：先查标准事件表，能覆盖直接写 `events`；不能覆盖才用 `customEvents`（namespaced + `payloadSchema`）。
3. actions：声明 `title` + 必要 `params`（`type: 'object'`） + 建议 `returns`；ref 暴露同名方法。
4. state：声明 `title` + `schema`；ref 在 `COMPONENT_STATE_KEY` 下暴露同名值；deps 数组含所有 state 值。
5. 修改后从 `cdp-material-sdk/portable` 导入 `validateManifest` / `diagnoseMissingActionImpls` / `diagnoseMissingStateKeys` 执行校验。

## 常见错误

| 错误 | 修复 |
|---|---|
| 把 namespaced 自定义事件写进 `events` | 移到 `customEvents`，并补 `payloadSchema` |
| 自定义事件名漏 namespace（`rowClick` 而非 `acme:rowClick`） | 加组织 / 组件 / 业务前缀 |
| 自定义事件漏 `payloadSchema` | 必填，validateManifest error；按业务字段补 schema |
| 标准事件能覆盖却新声明 customEvents（如 `itemClick`） | 用标准事件，第三方回调签名不同时走 `adapter.events.transform` |
| 重复声明 DATA_FIELD 自动注入的 `valueChange` / `getValue` / `setValue` / `value` state | 删掉，去 traits skill 查自动注入清单 |
| `adapter.events` / `adapter.customEvents` 引用 manifest 未声明事件 | 先在 `events` 或 `customEvents` 声明，再在 adapter 映射 |
| Action 漏 `title` | 补 |
| Action `params.type` 不是 `'object'` | 改为 `'object'` 包装；单参数也要包成对象字段 |
| Manifest 声明 action 但 ref 没暴露同名方法 | 在 `useImperativeHandle` 实现；用 `diagnoseMissingActionImpls()` 复检 |
| state key 写在 ref 顶层而非 `COMPONENT_STATE_KEY` 下 | 移入 `[COMPONENT_STATE_KEY]: { ... }`；用常量不手写字符串 |
| useImperativeHandle 依赖数组漏 state 值 | 补全；否则外部读到 stale closure 旧值 |
| 想用 state 写值（外部修改组件） | state 是只读快照；写操作走 action |

## 完成检查

- [ ] 标准事件优先；自定义事件 namespaced + 有 `payloadSchema`
- [ ] adapter 中事件引用的是 manifest 已声明事件
- [ ] 每个 action 有 `title`；有参数时 `params.type === 'object'`
- [ ] manifest action key 与 ref 方法名一致；`diagnoseMissingActionImpls()` 通过
- [ ] 每个 state 有 `title` + `schema`；暴露在 `COMPONENT_STATE_KEY` 下
- [ ] `useImperativeHandle` 依赖数组含所有 state 值
- [ ] 无重复声明 DATA_FIELD 自动注入字段
- [ ] `validateManifest()` 与 `diagnoseMissingStateKeys()` 无 error

## 维护来源

- `cdp-material-sdk/docs/component-development/recipes/声明事件.md`
- `cdp-material-sdk/docs/component-development/recipes/声明动作与状态.md`
- `cdp-material-sdk/docs/component-development/reference/Events模型.md`
- `cdp-material-sdk/docs/component-development/reference/ActionsState模型.md`
