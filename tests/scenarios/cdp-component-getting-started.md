# Scenario: cdp-component-getting-started

## 用户请求

从零创建一个 CDP 组件库工程，并提供一个最小可运行的文本组件。

## 期望 Agent 行为

- 建立组件、manifest、package 聚合和 plugin 入口。
- 默认从 `cdp-material-sdk/portable` 导入类型和工具。
- 构建目标为 ESM。
- React 相关依赖 externalize。
- 最后运行 `validateManifest()` 或给出明确自检脚本。

## 不应出现

- 不应导入宿主内部模块。
- 不应把 React 打入 bundle。
