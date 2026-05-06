# Scenario: cdp-component-events-actions-state

## 用户请求

给 DataTable 增加：标准 `itemClick` 事件、自定义 `table.export` 事件、`refresh` action（带 params）、`selectedRowKeys` state。

## 期望 Agent 行为

- 标准事件 `type` 取自 `EngineEventProtocol`；自定义事件命名空间形态 `<ns>.<name>` 且声明 `payloadSchema`。
- action key === ref method name；声明 `params` 时 `params.type === 'object'`；建议声明 `returns`。
- state 必须有 `title` + `schema`；ref 通过 `[COMPONENT_STATE_KEY]` 暴露。
- `useImperativeHandle` deps 包含 state 值，避免 stale closure。
- 用 `diagnoseMissingActionImpls()` / `diagnoseMissingStateKeys()` 自检。

## 不应出现

- 不应只写 manifest 而不实现 ref 方法。
- 不应让 action key 与 ref method name 不一致。
- 不应在 `useImperativeHandle` deps 漏 state 值。
