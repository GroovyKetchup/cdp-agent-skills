---
name: cdp-component-adapter-and-wrap
description: Use when a CDP component's underlying React component has prop names, event names, ref methods, or value shape differing from CDP conventions; or when wrapping Ant Design, Arco, Material UI, ECharts, or other third-party React libraries.
---

# Adapter 决策与第三方组件包装

## 概述

接入第三方组件、或组件 prop / 事件名不符合 CDP 约定时有两条路径：在 manifest 声明 **adapter** 让引擎层映射；或在 React **wrapper** 内手写转换。**按"层"做选择，不是"默认优先谁"**。

## 何时使用

| 场景 | 路径 |
|---|---|
| 组件 prop / 事件名 / ref / value 形状偏离 CDP 约定 | 本 skill |
| 包装 AntD / Arco / MUI / ECharts / 自研 UI Kit / 老组件 | 本 skill |
| 组件已按 CDP 约定（`value` / `onChange` / `onClick` / 标准 payload） | 不需要 adapter |
| rootPath / Loading 配置 | 见 `cdp-component-runtime-behavior` |
| events / actions / state 声明本身 | 见 `cdp-component-events-actions-state` |

## 三层决策框架（核心）

| 层 | 适配诉求 | 推荐 | adapter 原生能力 |
|---|---|---|---|
| 事件层 | 改 prop 名（`onClick` → `onPress`） | **adapter** | `events[K].propName` / `customEvents[K].propName` |
| 事件层 | reshape payload 到 CDP 标准 payload | **adapter** | `events[K].transform`（类型化到 `EngineEventProtocol[K]`） |
| 事件层 | 提取作用域 `record` / `index` | **adapter** | `events[K].toScope` / `customEvents[K].toScope` |
| Props 层 | 仅改 prop 名（`value` → `selectedValue`） | **adapter** | `propMapping` |
| Props 层 | 值变换 / 默认值 / 受控-非受控调谐 | **wrapper** | 仅 `mapProps`（**逃生舱**，不要常用） |
| 结构层 | children / slots / ref / 副作用 | **wrapper** | — |

要点：

- **事件层是 adapter 主场**：`propName + transform + toScope` 覆盖"换名 + 重塑 payload + 提取作用域"，`transform` 类型约束到 `EngineEventProtocol[K]`。wrapper 重新构造 payload 会丢失类型约束。
- **结构层永远 wrapper**：children / slots / ref / `useEffect` / 错误边界不在 adapter 能力内。
- **协议解耦方向相反**：wrapper 把原生 API 锁在内部、对外 CDP 形状；adapter 让组件保留原生 API、转换写在 manifest。
- **混合策略合法**（事件层 adapter + props 值层 wrapper），但**同一适配点不要两层都做**（叠加或冲突）。

## adapter 原语速查

```ts
adapter: {
  propMapping: { value: 'selectedValue', readOnly: 'disabled' }, // 仅改名
  events: {
    valueChange: {
      propName: 'onSelectedValueChange',
      transform: (event, nextValue) => ({ value: nextValue }),
    },
  },
  customEvents: {
    'acme:rowClick': {
      propName: 'onItemTap',
      transform: (item) => ({ rowId: item.id }),
      toScope: (item, index) => ({ record: item, index }),
    },
  },
}
```

`adapter.events` 引用的事件**必须先在 manifest `events` 声明**；自定义事件先在 `customEvents` 声明（含 `payloadSchema`，见 `cdp-component-events-actions-state` skill）。

## wrapper 标准模板

```tsx
import { forwardRef } from 'react';
import { ThirdPartyComponent } from 'some-ui-lib';
import type { BaseUIProps } from 'cdp-material-sdk/portable';

export const AcmeX = forwardRef<HTMLDivElement, BaseUIProps<HTMLDivElement> & { value?: string; onChange?: (v: string) => void }>(
  ({ value = '', onChange, slotProps }, ref) => (
    <div {...slotProps?.root} ref={ref}>
      <ThirdPartyComponent thirdValue={value} onThirdChange={onChange} />
    </div>
  ),
);
```

外层 wrapper DOM 承接 `slotProps.root`（第三方常不透传未知 DOM 属性）；ref 落 wrapper 节点；第三方原生 API 锁内部，对外暴露 CDP 形状。

## 引导路径

事实源（优先读取目标项目本地 SDK 文档）：

- `node_modules/cdp-material-sdk/docs/component-development/recipes/使用Adapter适配组件API.md`
- `node_modules/cdp-material-sdk/docs/component-development/recipes/接入第三方React组件库.md`
- `node_modules/cdp-material-sdk/docs/component-development/reference/Events模型.md`

本 skill 的 `references/adapter-and-wrap.md` 仅作为 SDK 文档导航与 fallback 提示。

## 工作流程

1. 列出第三方组件偏离 CDP 约定的所有点（prop 名 / 事件名 / payload / value 形状 / 结构）。
2. 按"三层决策"表为每个点选 adapter 或 wrapper：事件层与 props 层"仅改名"用 adapter；props 层"值变换"以上 + 结构层用 wrapper。
3. wrapper：写 forwardRef 标准模板，外层 DOM 承接 `slotProps.root`，对外暴露 CDP 形状的 props。
4. adapter：在 manifest 中按 `propMapping` / `events.*.propName/transform/toScope` 声明；引用的事件先在 `events` / `customEvents` 中声明（走 `cdp-component-events-actions-state` skill）。
5. rootPath 选择 `INJECT_PATH_SLOT_PROPS`，配 wrapper DOM（见 `cdp-component-runtime-behavior` skill）。
6. 修改 manifest 后从 `cdp-material-sdk/portable` 导入 `validateManifest` 执行校验；React 相关依赖标记为 peerDependencies，不打入 bundle。

## 常见错误

| 错误 | 修复 |
|---|---|
| `mapProps` 做改名 / 当主力 | 改名用 `propMapping`；复杂值变换走 wrapper（`mapProps` 是逃生舱、无类型） |
| `propMapping` 做值变换 | 回到 wrapper（propMapping 只能改名） |
| wrapper 内手写 `onPress={onClick}` 转 prop 名 / 重新构造 CDP payload | 用 `adapter.events.propName` + `transform`（类型化到 `EngineEventProtocol[K]`） |
| List / Table 行项事件用 wrapper 手写作用域注入 | 用 `adapter.events.toScope` 提取 `{ record, index }` |
| 同一适配点在 adapter 和 wrapper 都做 | 二选一；事件层适配只在一处 |
| `adapter.events` / `adapter.customEvents` 引用未声明事件 | 先在 manifest `events` / `customEvents` 中声明 |
| 把 `slotProps.root` 直接给第三方组件 | 外层加 wrapper DOM 承接 |
| 重复声明 DATA_FIELD 自动注入的 `valueChange` | 删掉，仅在 `adapter.events.valueChange` 写映射；见 `cdp-component-traits` |

## 完成检查

- [ ] 每个适配点已按"三层决策"表分到 adapter 或 wrapper（无两层同时做）
- [ ] adapter `propMapping` 仅用于改名；值变换在 wrapper 内
- [ ] 事件层适配优先用 `adapter.events.propName / transform / toScope`，不在 wrapper 内重塑 payload
- [ ] adapter 引用的事件已在 manifest `events` / `customEvents` 中声明
- [ ] wrapper 外层 DOM 承接 `slotProps.root`；ref 落到该 DOM
- [ ] 不重复声明 trait 自动注入字段
- [ ] React 依赖标记为 peerDependencies，未打入 bundle
- [ ] `validateManifest()` 无 error

## 维护来源

- `cdp-material-sdk/docs/component-development/recipes/使用Adapter适配组件API.md`
- `cdp-material-sdk/docs/component-development/recipes/接入第三方React组件库.md`
- `cdp-material-sdk/docs/component-development/reference/Events模型.md`
