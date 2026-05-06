---
name: cdp-component-runtime-behavior
description: Use when configuring rootPath / INJECT_PATH_SLOT_PROPS for DOM root injection, or choosing engine.render.loading strategy (native / wrapper / none) for a CDP component.
---

# 配置运行时行为：rootPath 与 Loading

## 概述

两项独立但常一同声明的 manifest 运行时配置：

- **`engine.render.injection.rootPath`** —— 告诉宿主把基础能力注入到组件真实 DOM 根节点的哪个 props 路径
- **`engine.render.loading`** —— 声明宿主如何控制组件 loading 状态（`native` / `wrapper` / `none`）

## 何时使用

| 需求 | 字段 |
|---|---|
| 设计器需要选中 / 定位 / 控制显隐组件 | `rootPath` |
| 包装第三方 React 组件需要决定注入位置 | `rootPath`（具体决策见 `cdp-component-adapter-and-wrap`） |
| 组件需要响应外部 `setLoading` 或被宿主接管 loading | `engine.render.loading` |
| 重复声明 `hidden` / `setHidden` / `getHidden` / `toggleHidden` / `mount` / `unmount` | **不要**——这些是引擎基础能力，宿主自动补充 |

## rootPath 决策

| 组件情况 | rootPath 推荐 | 实现侧契约 |
|---|---|---|
| 自研组件可改源码（默认） | `INJECT_PATH_SLOT_PROPS` | 在真实根 DOM 展开 `{...slotProps?.root}` |
| 组件 props 已直接透传到根 DOM | `'$root'` | 组件根 props 直接落到 DOM 元素 |
| 包装第三方组件 | `INJECT_PATH_SLOT_PROPS` + 外层加 wrapper DOM | wrapper 上展开 `slotProps.root`，第三方组件内嵌（**不要直接给第三方传 slotProps.root**——第三方常不透传未知 DOM 属性） |
| 自定义路径 | 自定义字符串（如 `'containerProps.root'`） | 组件确保该路径上 props 最终落到真实 DOM |
| 完全黑盒 / 临时验证 | 不声明，宿主外套 `<div>` 兜底 | 仅适用临时场景，正式组件建议显式声明 |

不确定时正式组件优先选 `INJECT_PATH_SLOT_PROPS`。字段路径完整为 `manifest.engine.render.injection.rootPath`（不要漏 `render`）。

## Loading 策略

| 策略 | 适合组件 | 宿主行为 | 实现侧契约 |
|---|---|---|---|
| `native` | 已有 loading prop（Button / Select / Upload） | 宿主注入 loading（或 `propName` 指定的 prop） | loading=true 时**阻断用户交互**（不只是显示动画） |
| `wrapper` | 没有 loading prop 但可整体遮罩（Card / Chart / PreviewPanel） | 渲染外层 spin / wave / skeleton 遮罩 | 不需要组件实现 loading 逻辑 |
| `none` | 内部 loading 状态复杂（Table / TreeTable / AsyncSelect） | 宿主**不接管** | 组件内部自管；如外部仍需控制，自行声明 `setLoading` / `getLoading` actions |

`native` prop 名不是 `loading` 时配 `propName`：

```ts
loading: { strategy: 'native', propName: 'spinning' }
```

`wrapper` 可指定 `wrapperType: 'wave' | 'spin' | 'skeleton' | <自定义 type>` 与 `wrapperProps`；`spin` / `wave` 支持 `setLoading({ loading, text })` 的 `text` 参数。

### `none` 策略下自实现 loading 的辅助 hook

SDK 在 `cdp-material-sdk/portable` 提供两个**纯 React、无宿主耦合**的 hook，避免重复实现引用计数：

- **`useConcurrentLoading`**：单一 loading + 引用计数（按钮挂多个异步动作）。返回 `isLoading` / `getLoading` / `startLoading(text?)` / `stopLoading` / `loadingText`。
- **`useDualLoading`**：分别建模"动作 loading"与"数据 loading"，对外仍提供合并 `isLoading`（适合 Table 这类同时有按钮触发动作和后台数据请求的组件）。

## 引擎基础能力（勿重复声明）

宿主自动补充以下，作者**不要在 manifest 中重复声明同名 action / state / event**：

- `hidden` prop / state、`getHidden` / `setHidden` / `toggleHidden` actions
- `mount` / `unmount` 生命周期事件

## 引导路径

事实源（优先读取目标项目本地 SDK 文档）：

- `node_modules/cdp-material-sdk/docs/component-development/recipes/配置DOM根节点注入.md`
- `node_modules/cdp-material-sdk/docs/component-development/recipes/配置Loading策略.md`
- `node_modules/cdp-material-sdk/docs/component-development/reference/DOM根节点注入模型.md`
- `node_modules/cdp-material-sdk/docs/component-development/reference/Loading策略模型.md`
- `node_modules/cdp-material-sdk/docs/component-development/reference/引擎基础能力模型.md`

`references/` 仅作为导航与 fallback 提示。

## 工作流程

1. rootPath：按"决策"表选策略；正式组件优先 `INJECT_PATH_SLOT_PROPS`。
2. 在组件实现里把 rootPath 指向的 props **真正展开到真实 DOM 节点**（自研组件直接展开；包装第三方在 wrapper DOM 展开）。
3. Loading：按"策略"表选 `native` / `wrapper` / `none`。`none` 下若仍需外部控制，补 `setLoading` / `getLoading` actions（走 events-actions-state skill），并考虑用 `useConcurrentLoading` / `useDualLoading`。
4. 不要重复声明 hidden / mount / unmount 等引擎基础能力。
5. 修改 manifest 后从 `cdp-material-sdk/portable` 导入 `validateManifest` 执行校验；并按 SDK recipe 的验收步骤验证设计器选中、显隐与 loading 触发效果。

## 常见错误

| 错误 | 修复 |
|---|---|
| 写 `INJECT_PATH_SLOT_PROPS` 但组件没展开 `slotProps.root` | 在真实根 DOM 加 `{...slotProps?.root}`；ref 落同一节点 |
| 把 `slotProps.root` 直接给不透传 DOM 属性的第三方组件 | 外层加 wrapper DOM，wrapper 上展开 `slotProps.root` |
| 字段路径漏 `render`（写 `engine.injection` 或 `engine.loading`） | 完整路径 `engine.render.injection.rootPath` / `engine.render.loading` |
| Button 用 `wrapper` 整体遮罩 | 改 `native`；loading 时阻断点击 |
| Table 用 `wrapper` 全局遮罩，破坏局部体验 | 改 `none`；按需自实现 `setLoading` / `getLoading` actions |
| `native` 模式 loading 时只显示动画但不阻断交互 | 在组件实现中真正禁用按钮 / 输入 |
| prop 名不是 `loading` 时漏 `propName` | 加 `propName: '<实际名>'` |
| `none` 策略下自己造引用计数管 loading | 用 `useConcurrentLoading` 或 `useDualLoading` |
| 重复声明 `hidden` / `setHidden` / `mount` / `unmount` 等基础能力 | 删掉，宿主自动补充 |

## 完成检查

- [ ] rootPath 路径与 SDK 字段名一致（`engine.render.injection.rootPath`）
- [ ] rootPath 指向的 props 在组件实现中**真正落到真实 DOM 节点**
- [ ] 包装第三方组件时已加 wrapper DOM 承接 `slotProps.root`
- [ ] Loading 策略选型符合"策略"表（已有 prop / 可整体遮罩 / 内部复杂）
- [ ] `native` 策略下 loading=true 时组件**阻断用户交互**
- [ ] `none` 策略下若需外部控制，已自实现 `setLoading` / `getLoading` 并考虑用 `useConcurrentLoading` / `useDualLoading`
- [ ] 没有重复声明引擎基础能力（hidden / setHidden / mount / unmount 等）
- [ ] `validateManifest()` 无 error；设计器选中、显隐、loading 触发效果实测通过

## 维护来源

- `cdp-material-sdk/docs/component-development/recipes/配置DOM根节点注入.md`
- `cdp-material-sdk/docs/component-development/recipes/配置Loading策略.md`
- `cdp-material-sdk/docs/component-development/reference/DOM根节点注入模型.md`
- `cdp-material-sdk/docs/component-development/reference/Loading策略模型.md`
- `cdp-material-sdk/docs/component-development/reference/引擎基础能力模型.md`
