# Adapter 与第三方包装导航

sdk-docs:
- cdp-material-sdk/docs/component-development/recipes/使用Adapter适配组件API.md
- cdp-material-sdk/docs/component-development/recipes/接入第三方React组件库.md
- cdp-material-sdk/docs/component-development/reference/Events模型.md
- cdp-material-sdk/docs/component-development/reference/SDK导入边界.md

本文件只提供 SDK 文档导航与缺失文档时的 fallback 提示，不复制字段、枚举、模板或示例的完整事实内容。

## 优先读取（按主题索引）

- Wrapper vs Adapter 决策框架：`node_modules/cdp-material-sdk/docs/component-development/recipes/使用Adapter适配组件API.md`
- 第三方 React 组件库接入场景：`node_modules/cdp-material-sdk/docs/component-development/recipes/接入第三方React组件库.md`
- 事件协议（`EngineEventProtocol[K]`）：`node_modules/cdp-material-sdk/docs/component-development/reference/Events模型.md`
- SDK 导入边界（不要导入宿主内部）：`node_modules/cdp-material-sdk/docs/component-development/reference/SDK导入边界.md`
- 校验级别：`node_modules/cdp-material-sdk/docs/component-development/reference/validateManifest校验规则.md`

## SDK 公共入口

- 类型：`BaseUIProps<HTMLElementType>` 从 `cdp-material-sdk/portable` 导入
- 常量：`INJECT_PATH_SLOT_PROPS` 从 `cdp-material-sdk/portable` 导入
- 校验：`validateManifest` 从 `cdp-material-sdk/portable` 导入
- React peerDependency：包装第三方时，`react` / `react-dom` 应放在 `peerDependencies`，避免重复打包

## 关联 skill

- 事件 / 动作 / 状态声明本身：`cdp-component-events-actions-state`
- rootPath / Loading 配置：`cdp-component-runtime-behavior`
- DATA_FIELD 自动注入字段（勿在 manifest 重复声明）：`cdp-component-traits`

## Fallback 提示

如果目标项目中不存在 `node_modules/cdp-material-sdk/docs/component-development`，先升级或重装 `cdp-material-sdk@latest`。不导入宿主内部模块或 SDK 源码路径。
