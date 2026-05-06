# 运行时行为导航（rootPath / Loading）

sdk-docs:
- cdp-material-sdk/docs/component-development/recipes/配置DOM根节点注入.md
- cdp-material-sdk/docs/component-development/recipes/配置Loading策略.md
- cdp-material-sdk/docs/component-development/reference/DOM根节点注入模型.md
- cdp-material-sdk/docs/component-development/reference/Loading策略模型.md
- cdp-material-sdk/docs/component-development/reference/引擎基础能力模型.md

本文件只提供 SDK 文档导航与缺失文档时的 fallback 提示，不复制字段、枚举、模板或示例的完整事实内容。

## 优先读取（按能力索引）

- rootPath recipe：`node_modules/cdp-material-sdk/docs/component-development/recipes/配置DOM根节点注入.md`
- Loading recipe：`node_modules/cdp-material-sdk/docs/component-development/recipes/配置Loading策略.md`
- DOM 根节点模型：`node_modules/cdp-material-sdk/docs/component-development/reference/DOM根节点注入模型.md`
- Loading 策略模型：`node_modules/cdp-material-sdk/docs/component-development/reference/Loading策略模型.md`
- 引擎基础能力（hidden / mount / unmount 自动注入）：`node_modules/cdp-material-sdk/docs/component-development/reference/引擎基础能力模型.md`
- 校验级别：`node_modules/cdp-material-sdk/docs/component-development/reference/validateManifest校验规则.md`

## SDK 公共入口

- 常量：从 `cdp-material-sdk/portable` 导入（`INJECT_PATH_SLOT_PROPS` 等）
- 类型：`BaseUIProps<HTMLElementType>` 也从 `cdp-material-sdk/portable` 导入
- 自实现 loading 辅助 hook：`useConcurrentLoading`、`useDualLoading`，从 `cdp-material-sdk/portable` 导入（**无宿主耦合，可在不共享 React 运行时的场景使用**）
- 校验：`validateManifest` 同样从 `cdp-material-sdk/portable` 导入

## Fallback 提示

如果目标项目中不存在 `node_modules/cdp-material-sdk/docs/component-development`，先升级或重装 `cdp-material-sdk@latest`。不导入宿主内部模块或 SDK 源码路径。
