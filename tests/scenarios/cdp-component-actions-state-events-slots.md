# Scenario: cdp-component-actions-state-events-slots

## 用户请求

给表格组件添加行点击事件、刷新动作、选中行状态和行操作插槽。

## 期望 Agent 行为

- 自定义事件使用 namespaced 命名并声明 `payloadSchema`。
- action manifest key 与 ref 暴露方法一致。
- state key 出现在 `COMPONENT_STATE_KEY` 对象中。
- 作用域 slot 包含 `scopeDescription`。
- 使用诊断工具检查 action/state 一致性。

## 不应出现

- 不应只写 manifest 而不实现 ref 方法。
- 不应声明 slot 后不渲染 `_slots` 或 `_scopedSlots`。
