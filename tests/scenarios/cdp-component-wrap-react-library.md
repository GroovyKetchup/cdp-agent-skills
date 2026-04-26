# Scenario: cdp-component-wrap-react-library

## 用户请求

把 Ant Design `Select` 包装成 CDP 数据字段组件。

## 期望 Agent 行为

- 创建 CDP wrapper，而不是裸注册第三方组件。
- 转换 `value` 和 `onChange`。
- 将 `slotProps.root` 透传到真实 DOM 根节点。
- 如有 loading 能力，使用 `engine.render.loading`。
- React 依赖不进入 bundle。

## 不应出现

- 不应把复杂业务逻辑塞进 `adapter.mapProps`。
- 不应声明无法落到真实 DOM 的 rootPath。
