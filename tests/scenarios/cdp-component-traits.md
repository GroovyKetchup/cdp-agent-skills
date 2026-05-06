# Scenario: cdp-component-traits

## 用户请求

把 UserSelect 声明为 DATA_FIELD（值是用户 ID 字符串），把 OrderForm 声明为 DATA_CONTAINER（对象型，子字段独立读写）。

## 期望 Agent 行为

- DATA_FIELD：声明 trait 后**不在 manifest 里重复声明** `value` prop / `valueChange` event；`meta.valueSchema` 描述值类型。
- DATA_CONTAINER：从 `cdp-material-sdk/host-react` 导入 `DataScope` 包住子树；按对象型 vs 数组型选择 `getRecord` / `record` + `relativePath` + `index`。
- LAYOUT_CONTAINER 仅用于纯结构容器，不持有数据。
- 组件实现需调用 `onChange(nextValue)` 提交值变化。

## 不应出现

- 不应在 manifest 里手写 `value` prop 与 `valueChange` 事件（DATA_FIELD 自动注入）。
- 不应在不共享 React 运行时的场景使用 `cdp-material-sdk/host-react`。
- 不应把 LAYOUT_CONTAINER 当数据容器使用。
