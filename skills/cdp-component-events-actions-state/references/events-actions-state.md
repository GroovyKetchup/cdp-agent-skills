# Events / Actions / State 导航

sdk-docs:
- cdp-material-sdk/docs/component-development/recipes/声明事件.md
- cdp-material-sdk/docs/component-development/recipes/声明动作与状态.md
- cdp-material-sdk/docs/component-development/reference/Events模型.md
- cdp-material-sdk/docs/component-development/reference/ActionsState模型.md

本文件只提供 SDK 文档导航与缺失文档时的 fallback 提示，不复制字段、枚举、模板或示例的完整事实内容。

## 优先读取（按能力索引）

- 事件 recipe：`node_modules/cdp-material-sdk/docs/component-development/recipes/声明事件.md`
- 动作与状态 recipe：`node_modules/cdp-material-sdk/docs/component-development/recipes/声明动作与状态.md`
- 标准事件清单与 payload 协议：`node_modules/cdp-material-sdk/docs/component-development/reference/Events模型.md`
- Actions / State 模型与校验：`node_modules/cdp-material-sdk/docs/component-development/reference/ActionsState模型.md`
- 校验级别（哪些 warning / error）：`node_modules/cdp-material-sdk/docs/component-development/reference/validateManifest校验规则.md`

## 标准事件速查

完整定义和 payload 见 `Events模型.md`。本表只供选型参考：

| type | 适合场景 | 推荐 React props |
|---|---|---|
| `click` / `focus` / `blur` | 按钮、输入聚焦 | `onClick` / `onFocus` / `onBlur` |
| `valueChange` | 数据字段值变化（DATA_FIELD 自动注入，**勿重复声明**） | `onChange` |
| `itemClick` / `itemDoubleClick` / `itemRightClick` / `itemLongPress` | 表格行 / 列表项交互 | `onItemClick` 等 |
| `dataFetch` | 组件请求外部数据 | `onDataFetch` |

## SDK 公共入口

- 常量：从 `cdp-material-sdk/portable` 导入（`COMPONENT_STATE_KEY` 用作 ref 状态键）
- 校验工具：从 `cdp-material-sdk/portable` 导入（`validateManifest`、`diagnoseMissingActionImpls`、`diagnoseMissingStateKeys`）

## Fallback 提示

如果目标项目中不存在 `node_modules/cdp-material-sdk/docs/component-development`，先升级或重装 `cdp-material-sdk@latest`。不导入宿主内部模块或 SDK 源码路径。
