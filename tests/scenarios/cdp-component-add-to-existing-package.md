# Scenario: cdp-component-add-to-existing-package

## 用户请求

在已有 CDP 组件包中新增一个 `acme.Tag` 组件。

## 期望 Agent 行为

- 先查找现有组件目录、manifest 聚合和 plugin 入口。
- 只新增组件目录和必要注册项。
- 复用现有包配置，不重建项目。
- 新 manifest 通过 `validateManifest()`。

## 不应出现

- 不应重写整个组件库。
- 不应改动无关组件。
