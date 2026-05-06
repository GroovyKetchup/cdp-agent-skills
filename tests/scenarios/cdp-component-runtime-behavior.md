# Scenario: cdp-component-runtime-behavior

## 用户请求

ChartCard 选中框偏移；DataTable 切换数据时设计器看不到 loading 遮罩。

## 期望 Agent 行为

- rootPath：`engine.render.injection.rootPath` 指向真实 DOM 路径；优先使用 `INJECT_PATH_SLOT_PROPS` 让根节点透传 `slotProps.root`（forwardRef + spread）。
- Loading：按策略选 native（组件接管）/ wrapper（引擎遮罩）/ none，并在 manifest 写 `engine.render.loading`（不是 `engine.loading`）。
- 用 `useDualLoading` / `useConcurrentLoading` 等 SDK hooks 处理 loading 流（不要自己造定时器去抖）。
- 不重复声明引擎自动注入的 `hidden` / `mount` / `unmount` 等基础能力。

## 不应出现

- 不应声明 rootPath 但组件不 spread `slotProps.root`。
- 不应把 `loading` 写到 `engine.loading`（错位置）。
- 不应在 manifest 重复声明引擎基础能力。
