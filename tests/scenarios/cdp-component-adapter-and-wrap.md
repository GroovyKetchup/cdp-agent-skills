# Scenario: cdp-component-adapter-and-wrap

## 用户请求

把第三方 `ThirdPartyDatePicker`（值 prop 为 `selectedDate`、变化事件为 `onDateChange`）包装成 CDP 组件，要求归一化为 `value` / `onChange`，并支持 CDP 设计器选中。

## 期望 Agent 行为

- 三层决策：事件层走 `adapter.events.<type>.propName/transform/toScope`；Props 层走 `adapter.propMapping`（仅改名）或 wrapper 内做值变换；结构层走 wrapper（forwardRef + spread `slotProps.root`）。
- adapter 引用的事件必须先在 `events` / `customEvents` 声明。
- wrapper 用 `forwardRef`，承接 `BaseUIProps<HTMLElementType>`，spread `slotProps.root`，把 react peerDep 留给宿主（不重复打包 react）。
- DATA_FIELD 自动注入的 `valueChange` 走 adapter 适配，**不在 manifest 重复声明**。

## 不应出现

- 不应在 wrapper 里手写所有事件适配（事件层是 adapter 主场）。
- 不应让 adapter 引用未在 manifest 声明的事件。
- 不应把第三方组件直接当根节点而不外层加 wrapper DOM 承接 `slotProps.root`。
