# Scenario: cdp-component-slots

## 用户请求

给 Card 加 header 与 footer 命名插槽；给 Table 加按列动态渲染单元格的作用域插槽。

## 期望 Agent 行为

- manifest 声明 `slots`（命名 / 动态 / 作用域）；动态 slot 必须有 `dynamicSource` 与 `dynamicKey`；作用域 slot 应该有 `scopeDescription`。
- 组件实现实际渲染 `_slots[name]` / `_scopedSlots[name](scope)`。
- `allowedChildren` 是字符串数组（如允许的组件 type 列表）。

## 不应出现

- 不应声明 slot 后组件不实际渲染 `_slots` / `_scopedSlots`。
- 不应让动态 slot 漏 `dynamicSource` 或 `dynamicKey`。
- 不应把 `allowedChildren` 写成对象或非字符串数组。
