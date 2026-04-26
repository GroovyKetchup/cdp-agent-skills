# Scenario: cdp-component-data-field-container

## 用户请求

把一个输入框声明为 CDP 数据字段，并把一个 Form 声明为数据容器。

## 期望 Agent 行为

- 输入框声明 `COMPONENT_TRAIT.DATA_FIELD`。
- 输入框提供 `meta.valueSchema`，接收 `value` 并调用 `onChange(nextValue)`。
- Form 声明 `COMPONENT_TRAIT.DATA_CONTAINER`。
- Form 提供对象型 `meta.valueSchema`。
- 仅在确认共享 React runtime 后才使用 `host-react`。

## 不应出现

- 不应把纯布局容器声明为 `DATA_CONTAINER`。
- 不应缺失 `valueSchema`。
