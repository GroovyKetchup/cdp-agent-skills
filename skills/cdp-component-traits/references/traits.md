# Traits 导航

sdk-docs:
- cdp-material-sdk/docs/component-development/recipes/声明数据字段组件.md
- cdp-material-sdk/docs/component-development/recipes/声明数据容器组件.md
- cdp-material-sdk/docs/component-development/recipes/声明布局容器组件.md
- cdp-material-sdk/docs/component-development/reference/Traits能力模型.md

本文件只提供 SDK 文档导航与缺失文档时的 fallback 提示，不复制字段、枚举、模板或示例的完整事实内容。

## 优先读取（按 trait 索引）

- DATA_FIELD：`node_modules/cdp-material-sdk/docs/component-development/recipes/声明数据字段组件.md`
- DATA_CONTAINER：`node_modules/cdp-material-sdk/docs/component-development/recipes/声明数据容器组件.md`
- LAYOUT_CONTAINER + nesting：`node_modules/cdp-material-sdk/docs/component-development/recipes/声明布局容器组件.md`
- 自动注入清单 / 模型边界：`node_modules/cdp-material-sdk/docs/component-development/reference/Traits能力模型.md`
- valueSchema 选择 / 校验级别：`node_modules/cdp-material-sdk/docs/component-development/reference/validateManifest校验规则.md`

## DataScope 详细入参

| 入参 | 何时传 | 说明 |
|---|---|---|
| `getRecord` | 对象型容器（Form） | 记录获取函数；各字段实时读取最新容器数据，避免 record 变化触发后代重渲染 |
| `record` | 数组型容器（Table、CardList 每行） | 当前作用域的记录实例；与 `getRecord` 二选一 |
| `relativePath` | 数组型容器 | 字段在容器 value 内的访问位置，例如 `(childId) => `[${index}].${childId}`` |
| `index` | 数组型容器 | 当前作用域索引 |
| `registerField` / `unregisterField` | 需要聚合字段状态的容器（Form） | 让子字段上报 hidden / readOnly / required / label；不需要可省略 |
| `componentId` | 不传 | 引擎运行时自动装配 |

详细规则与示例代码以 `node_modules/cdp-material-sdk/docs/component-development/recipes/声明数据容器组件.md` 为准。

## SDK 公共入口

- 常量与 manifest 类型：从 `cdp-material-sdk/portable` 导入（`COMPONENT_TRAIT`、`COMPONENT_CATEGORY`、`ComponentManifest` 等）
- DATA_CONTAINER 运行时 hook：从 `cdp-material-sdk/host-react` 导入（`DataScope`、`useDataContainerApi`、`useDataContainer`、`useFieldRegistry`）——仅在确认与宿主共享 React 运行时和 Context 身份时使用

## Fallback 提示

如果目标项目中不存在 `node_modules/cdp-material-sdk/docs/component-development`，先升级或重装 `cdp-material-sdk@latest`。不导入宿主内部模块或 SDK 源码路径。
