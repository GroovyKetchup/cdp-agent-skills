# 校验脚本导航

sdk: cdp-material-sdk@latest
sdk-docs: cdp-material-sdk/docs/component-development/getting-started/05-自检与排错.md

本文件只提供 SDK 文档导航和缺失文档时的 fallback 提示，不复制字段、枚举、模板或示例的完整事实内容。具体实现以目标项目本地安装的 SDK 文档为准。

## 优先读取

- `node_modules/cdp-material-sdk/docs/component-development/getting-started/05-自检与排错.md`
- `node_modules/cdp-material-sdk/docs/component-development/reference/validateManifest校验规则.md`

## 维护路径

- `cdp-material-sdk/docs/component-development/getting-started/05-自检与排错.md`
- `cdp-material-sdk/docs/component-development/reference/validateManifest校验规则.md`

## Fallback 提示

如果目标项目中不存在 `node_modules/cdp-material-sdk/docs/component-development`，先升级或重装 `cdp-material-sdk@latest`。写代码时仍应从 `cdp-material-sdk/portable` 导入公开 API，不要导入宿主内部模块或 SDK 源码路径。
