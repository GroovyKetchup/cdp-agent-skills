# 组件开发文档映射

`cdp-material-sdk/docs/component-development` 是组件开发文档事实源。目标项目安装 SDK 后，Agent 应优先读取 `node_modules/cdp-material-sdk/docs/component-development` 下的同名文档。本文件只记录 SDK 随包文档到 9 个新 Skills 的导航映射。

## 入口与 getting-started

| 文档 | Skills |
|---|---|
| `README.md` | 全部 Skills |
| `FAQ.md` | `cdp-component-manifest-validation` |
| `getting-started/01-创建或接入组件库工程.md` | `cdp-component-getting-started` |
| `getting-started/02-创建组件包并注册.md` | `cdp-component-getting-started`, `cdp-component-add-to-existing-package` |
| `getting-started/03-开发最小可运行组件.md` | `cdp-component-getting-started`, `cdp-component-add-to-existing-package` |
| `getting-started/04-构建发布与宿主接入.md` | `cdp-component-getting-started` |
| `getting-started/05-自检与排错.md` | `cdp-component-getting-started`, `cdp-component-add-to-existing-package`, `cdp-component-manifest-validation` |

## Recipes

| 文档 | Skills |
|---|---|
| `recipes/声明props.md` | `cdp-component-manifest-basics` |
| `recipes/配置设计器元信息.md` | `cdp-component-manifest-basics` |
| `recipes/声明数据字段组件.md` | `cdp-component-traits` |
| `recipes/声明数据容器组件.md` | `cdp-component-traits` |
| `recipes/声明布局容器组件.md` | `cdp-component-traits` |
| `recipes/声明事件.md` | `cdp-component-events-actions-state` |
| `recipes/声明动作与状态.md` | `cdp-component-events-actions-state` |
| `recipes/声明插槽.md` | `cdp-component-slots` |
| `recipes/配置DOM根节点注入.md` | `cdp-component-runtime-behavior`, `cdp-component-adapter-and-wrap` |
| `recipes/配置Loading策略.md` | `cdp-component-runtime-behavior`, `cdp-component-adapter-and-wrap` |
| `recipes/使用Adapter适配组件API.md` | `cdp-component-adapter-and-wrap` |
| `recipes/接入第三方React组件库.md` | `cdp-component-adapter-and-wrap` |

## Reference

| 文档 | Skills |
|---|---|
| `reference/Manifest字段参考.md` | `cdp-component-manifest-basics`, `cdp-component-manifest-validation` |
| `reference/Traits能力模型.md` | `cdp-component-traits` |
| `reference/Events模型.md` | `cdp-component-events-actions-state`, `cdp-component-adapter-and-wrap` |
| `reference/ActionsState模型.md` | `cdp-component-events-actions-state` |
| `reference/Slots模型.md` | `cdp-component-slots` |
| `reference/DOM根节点注入模型.md` | `cdp-component-runtime-behavior` |
| `reference/Loading策略模型.md` | `cdp-component-runtime-behavior` |
| `reference/引擎基础能力模型.md` | `cdp-component-runtime-behavior` |
| `reference/SDK导入边界.md` | 全部 Skills |
| `reference/validateManifest校验规则.md` | `cdp-component-manifest-validation` |
| `reference/示例代码索引.md` | `cdp-component-add-to-existing-package`, `cdp-component-manifest-validation` |
