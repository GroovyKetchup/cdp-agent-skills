# Scenario: cdp-component-manifest-validation

## 用户请求

组件接入后 actions 不生效，要求排查并给出修复建议。

## 期望 Agent 行为

- 先检查 SDK 导入边界。
- 运行或建议运行 `validateManifest()`。
- 使用 `diagnoseMissingActionImpls()` 比对 manifest actions 与 ref 方法。
- 检查 state、slots、rootPath、loading 常见错误。
- 将 error 作为必须修复项，warning 作为需要确认项。

## 不应出现

- 不应先修改宿主运行时代码。
- 不应忽略 manifest 与组件实现不一致的问题。
