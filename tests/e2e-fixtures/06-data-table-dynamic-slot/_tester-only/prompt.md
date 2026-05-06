# Scenario 06 — DataTable 动态作用域 slot：测试 Prompt

## 用户请求（原样发给 Agent）

> 我要给 DataTable 加 columns 配置，每列要能让用户在设计器里配置自定义渲染模板。模板里能拿到当前行的 record 和 index。怎么做？

---

## 测试者预设答案（仅 Agent 主动询问时）

| Agent 可能问 | 回答 |
|---|---|
| DataTable type 名 | `acme.DataTable` |
| 数据源 | dataBindings 接受 `list` 字段，最小可用即可 |
| 列定义结构 | `Array<{ key: string, dataIndex: string, title: string }>` |
| 列模板 scope | `record`（当前行）+ `index`（行索引） |
| 是否要排序/分页 | 不要 |

---

## 期望路径概览

| 步骤 | 期望 skill | 关键产物 |
|---|---|---|
| 1. 路由 | `cdp-component-slots`（核心动态作用域）+ `cdp-component-manifest-basics`（columns 数组 schema）| — |
| 2. slot 设计 | `cdp-component-slots` | 见下表 slot 配置 |
| 3. props 设计 | `cdp-component-manifest-basics` | columns 数组 schema：每列 `dataIndex` 用 `format: 'dataField'` |
| 4. 实现侧 | — | `_scopedSlots[name]?.({ record, index })` 而非 `_slots[name]` |

### 关键 slot 配置（最小正确形态）

```ts
slots: {
  // 动态 slot：每列一个，名字由 columns 数组驱动
  // dynamicSource 指向 props.columns 数组
  // dynamicKey 用 columns[i].key 生成 slot 名
  cellTemplate: {
    title: '单元格模板',
    description: '每列的自定义渲染模板',
    dynamic: true,
    dynamicSource: 'columns',
    dynamicKey: '{key}',                // 模板插值，从 column 对象取 key 字段
    dynamicTitle: '{title}',
    scoped: true,
    scopeDescription: 'record（当前行数据）+ index（行索引）',
  },
},
```

### 关键实现侧契约

```tsx
const DataTable = forwardRef<unknown, DataTableProps>(function DataTable(
  { columns, list, _scopedSlots, slotProps },
  ref,
) {
  return (
    <table {...slotProps?.root}>
      <tbody>
        {list?.map((record, index) => (
          <tr key={index}>
            {columns?.map((col) => (
              <td key={col.key}>
                {/* 优先使用作用域 slot，回落到 dataIndex 默认渲染 */}
                {_scopedSlots?.[col.key]?.({ record, index }) ?? record[col.dataIndex]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
});
```

---

## 必须回避的高置信度漏洞

- 🅰 为每一列硬编码 slot 名（如 `slot-1`、`slot-2`），不用 dynamic 机制
- 🅰 漏 `dynamicSource` 或 `dynamicKey`
- 🅰 漏 `scoped: true`（列模板需要 record 上下文）
- 🅰 实现侧用 `_slots[name]` 而非 `_scopedSlots[name]`
- 🅰 `dynamicKey` 写成 `:key` / `${key}` 等错误模板语法（项目约定是 `{key}`）
- 🅰 用 React render prop 自建 context 替代 SDK scoped slot 机制
- 🅱 columns 数组里 `dataIndex` 不用 `format: 'dataField'`（设计器渲染普通文本框，丢失字段选择器）
- 🅱 columns 嵌套字段缺 `title`

---

## 终止标识（达到即算场景完成）

| # | 验收项 |
|---|---|
| 1 | `src/components/DataTable/{index.tsx, manifest.ts}` 新增 |
| 2 | `src/components.ts` + `src/plugin.ts` 注册 |
| 3 | `npx tsc --noEmit` 通过 |
| 4 | `validateManifest(plugin)` 通过 |
| 5 | manifest 含 `slots.cellTemplate` 三件套：`dynamic: true` + `dynamicSource: 'columns'` + `dynamicKey: '{key}'` + `scoped: true` |
| 6 | 实现侧调 `_scopedSlots[col.key]?.({ record, index })`（**不**用 `_slots`）|
| 7 | columns 数组 schema 含 `dataIndex` 用 `format: 'dataField'` |
| 8 | columns 不写死在 manifest，由 props 配置 |
| 9 | Agent 走完 `wrap-up-prompt.md`，输出 artifacts |

**最低底线**：1 + 2 + 3 + 4 全部满足。

---

## 不应出现的行为

- 主动扩张 manifest 表面：用户没要求就加额外 actions / state / events / slot（例如把排序、筛选、分页做成 manifest 暴露的 CDP 能力）—— 组件内部如何实现这些功能本身（DOM 结构、样式、纯交互）不在 skills 评判范围
- 把 columns 写死在 manifest（应通过 props 由设计师配置）
