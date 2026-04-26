# Scenario: cdp-component-rootpath-loading

## 用户请求

给一个第三方 Card wrapper 配置设计器可选中根节点和 Loading 策略。

## 期望 Agent 行为

- 使用 `INJECT_PATH_SLOT_PROPS` 并透传 `slotProps.root`。
- 确认 rootPath 最终落到真实 DOM 节点。
- Loading 字段写在 `engine.render.loading`。
- 根据组件能力选择 `native`、`wrapper` 或 `none`。

## 不应出现

- 不应写成 `engine.loading`。
- 不应在 `native` loading 下只显示动画但不阻断交互。
