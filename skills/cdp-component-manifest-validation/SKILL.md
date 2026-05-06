---
name: cdp-component-manifest-validation
description: Use when a CDP component package fails to render, events/actions/state silently do not work, validateManifest reports warnings/errors, rootPath/loading issues occur, or a pre-release self-check is needed.
---

# 校验 Manifest 与排查集成问题

## 概述

主线 skill：**交付前自检** + **排障入口**。本 skill 只做校验工具速查 + SDK 导入边界 + "症状→原子 skill"路由——具体修复办法走对应原子 skill。

## 何时使用

| 触发情境 | 工作模式 |
|---|---|
| 准备发布 / 提交组件包 | 交付前自检 |
| 组件无法渲染 / 事件不触发 / action 调不通 / state 过期 / 选中框偏移 / loading 行为异常 | 排障入口 |
| validateManifest 出 error / warning | 排障入口 |

## 校验工具速查

从 `cdp-material-sdk/portable` 导入：

```ts
import {
  validateManifest,        // 单组件 manifest 校验
  validateManifests,       // 组件包批量校验
  printValidationResult,   // 格式化输出
  diagnoseMissingActionImpls,  // 对比 manifest.actions 与 ref 方法名
  diagnoseMissingStateKeys,    // 对比 manifest.state 与 COMPONENT_STATE_KEY
  COMPONENT_STATE_KEY,
} from 'cdp-material-sdk/portable';

// 单组件
printValidationResult(validateManifest(manifest));

// 组件包
const allManifests = pkg.components.map((c) => c.manifest);
printValidationResult(validateManifests(allManifests));

// ref 一致性（运行时）
const missingActions = diagnoseMissingActionImpls(
  Object.keys(manifest.actions ?? {}),
  ref.current,
);
const missingStates = diagnoseMissingStateKeys(
  manifest,
  ref.current?.[COMPONENT_STATE_KEY],
);
```

## error / warning 处理

| 级别 | 处理 |
|---|---|
| **error** | 必须修复，否则组件不可交付 |
| **warning** | 评估是否符合预期；接受需要记录理由（如"自定义 rootPath 已确认透传"） |

完整规则级别清单（基础字段 / events / adapter events / actions / state / slots / rootPath / traits）见 SDK `validateManifest校验规则.md`。

## SDK 导入边界

正式组件包**只能**通过两个公开入口访问 SDK：

- `cdp-material-sdk/portable`：manifest 类型、`COMPONENT_TRAIT` / `COMPONENT_CATEGORY` / `COMPONENT_STATE_KEY` 常量、`INJECT_PATH_SLOT_PROPS`、校验工具（validateManifest 等）、辅助 hook（useConcurrentLoading / useDualLoading）、`BaseUIProps` 类型——纯 React、无宿主耦合，永远可用。
- `cdp-material-sdk/host-react`：`DataScope`、`useDataContainerApi` / `useDataContainer`、`useFieldRegistry`——**仅在确认与宿主共享 React 运行时与 Context 身份时**才能用（数据容器组件场景）。

**不导入**：宿主内部模块（`@cdp/host` 之类）、SDK 源码路径（`cdp-material-sdk/src/...`）、非公开协议路径。

## 症状 → 原子 skill 路由

| 症状 | 先排查 | 走哪个原子 skill |
|---|---|---|
| 组件渲染不出 | type 是否在 plugin.ts 注册；validateManifest 是否报 error | 取决于 error 内容 |
| 设计器选中框偏移 / 显隐失效 | rootPath 配置 + slotProps.root 透传 | `cdp-component-runtime-behavior` |
| `valueChange` 不触发 | DATA_FIELD trait 是否声明；组件是否调 `onChange(nextValue)` | `cdp-component-traits` + `cdp-component-events-actions-state` |
| 自定义事件不触发 | adapter.events 引用是否先在 manifest 声明；payload 形状 | `cdp-component-events-actions-state` + `cdp-component-adapter-and-wrap` |
| action 调用报"方法不存在" | diagnoseMissingActionImpls；action key vs ref method name | `cdp-component-events-actions-state` |
| state 拿到旧值 / 空值 | useImperativeHandle deps 数组；COMPONENT_STATE_KEY 暴露 | `cdp-component-events-actions-state` |
| loading 不响应 / 设计器无遮罩 | 策略选型 native / wrapper / none；prop 名 | `cdp-component-runtime-behavior` |
| Form 子字段拿不到值 / 路径错 | DataScope 是否包；getRecord 引用稳定性 | `cdp-component-traits` |
| 设计器显示插槽但运行时无内容 | 组件是否实际渲染 `_slots[name]` | `cdp-component-slots` |
| 物料面板找不到组件 | meta.title / category；hiddenInComponentList 是否误开 | `cdp-component-manifest-basics` |

## 引导路径

事实源（优先读取目标项目本地 SDK 文档）：

- `node_modules/cdp-material-sdk/docs/component-development/reference/validateManifest校验规则.md`
- `node_modules/cdp-material-sdk/docs/component-development/reference/Manifest字段参考.md`
- `node_modules/cdp-material-sdk/docs/component-development/reference/SDK导入边界.md`
- `node_modules/cdp-material-sdk/docs/component-development/getting-started/05-自检与排错.md`
- `node_modules/cdp-material-sdk/docs/component-development/FAQ.md`

`references/` 仅作为导航与 fallback 提示。

## 工作流程

1. **不要先改宿主代码**。先在组件包工程内运行静态校验。
2. 跑 `validateManifest(manifest)` 或批量 `validateManifests(...)`，按 error 逐项修复；warning 评估后接受或修复。
3. 跑 `diagnoseMissingActionImpls()` / `diagnoseMissingStateKeys()` 检查 ref 与 manifest 一致性。
4. 检查 SDK 导入边界（`portable` / `host-react` 公开入口；不引宿主内部）。
5. 仍有故障 → 用"症状→原子 skill 路由"表跳到对应原子 skill 修复。
6. 修复后回到第 2 步重新校验，直至 error 清空、症状消失。

## 完成检查

- [ ] `validateManifest()` / `validateManifests()` 无 error
- [ ] warning 已修复或明确记录接受理由
- [ ] `diagnoseMissingActionImpls()` 与 `diagnoseMissingStateKeys()` 通过
- [ ] SDK 导入符合公开边界（仅 `portable` / 必要时 `host-react`，不导宿主内部）
- [ ] 报告的所有症状已闭环（设计器选中、事件触发、action 调用、state 读取、loading、rootPath 透传等）

## 维护来源

- `cdp-material-sdk/docs/component-development/reference/validateManifest校验规则.md`
- `cdp-material-sdk/docs/component-development/reference/Manifest字段参考.md`
- `cdp-material-sdk/docs/component-development/reference/SDK导入边界.md`
- `cdp-material-sdk/docs/component-development/getting-started/05-自检与排错.md`
- `cdp-material-sdk/docs/component-development/FAQ.md`
