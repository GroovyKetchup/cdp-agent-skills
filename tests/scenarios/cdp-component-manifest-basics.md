# Scenario: cdp-component-manifest-basics

## 用户请求

给一个新组件补齐 manifest 必填字段、props（JSON Schema）以及设计器元信息。

## 期望 Agent 行为

- 声明 `type` / `meta.title` / `meta.category`，category 取自 `COMPONENT_CATEGORY` 真实导出。
- props 用 JSON Schema 表达；正确使用 `ExtendedJSONSchema7` 设计器扩展（如 `'x-dynamic-enum'`、`'x-slot'`、`placeholder`）。
- 声明设计器 meta（如 `description`、`hiddenInComponentList`、图标）按需。
- 跑 `validateManifest()` 0 error。

## 不应出现

- 不应使用 `BASIC` / `FORM` / `CONTAINER` 等 SDK 未导出的 category 值。
- 不应把 designer 扩展字段当成运行时 props 用。
