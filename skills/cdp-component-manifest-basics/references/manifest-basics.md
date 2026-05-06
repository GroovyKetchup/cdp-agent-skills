# Manifest 基础导航

sdk-docs:
- cdp-material-sdk/docs/component-development/recipes/声明props.md
- cdp-material-sdk/docs/component-development/recipes/配置设计器元信息.md
- cdp-material-sdk/docs/component-development/reference/Manifest字段参考.md

本文件只提供 SDK 文档导航与缺失文档时的 fallback 提示，不复制字段、枚举、模板或示例的完整事实内容。

## 优先读取

- props（JSON Schema）：`node_modules/cdp-material-sdk/docs/component-development/recipes/声明props.md`
- designer meta：`node_modules/cdp-material-sdk/docs/component-development/recipes/配置设计器元信息.md`
- 全字段参考：`node_modules/cdp-material-sdk/docs/component-development/reference/Manifest字段参考.md`
- 校验级别（哪些 warning / error）：`node_modules/cdp-material-sdk/docs/component-development/reference/validateManifest校验规则.md`

## ExtendedJSONSchema7 扩展字段（CDP 设计器特定）

| 字段 | 用途 |
|---|---|
| `'x-dynamic-enum'` | 动态枚举来源配置（运行时拉取选项） |
| `'x-slot'` | 标记字段对应一个插槽 |
| `'x-editableSelectOptions'` | 可编辑下拉选项 |
| `placeholder` | 设计器输入框占位文本 |
| `allowedTabs` | 多 tab 设计器面板中允许出现的 tab 列表 |

具体语义由设计器维护，详细说明读 SDK recipe `声明props.md` 与设计器物料文档。

## SDK 公共入口

- 常量与 manifest 类型：从 `cdp-material-sdk/portable` 导入（`COMPONENT_CATEGORY`、`ComponentManifest` 等）
- 校验工具：`validateManifest` / `validateManifests` 同样从 `cdp-material-sdk/portable` 导入

## Fallback 提示

如果目标项目中不存在 `node_modules/cdp-material-sdk/docs/component-development`，先升级或重装 `cdp-material-sdk@latest`。不导入宿主内部模块或 SDK 源码路径。
