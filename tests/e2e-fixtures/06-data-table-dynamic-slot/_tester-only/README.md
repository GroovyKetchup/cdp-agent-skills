# Scenario 06 — DataTable 动态作用域 slot：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`。

## 评分要点

| 维度 | 关注 |
|---|---|
| 路由 | 主调 `cdp-component-slots`（核心）+ `cdp-component-manifest-basics`（columns 数组 schema） |
| 决策 | 动态作用域 slot 三件套：`dynamicSource: 'columns'` + `dynamicKey: 'col-{index}'` + `scoped: true` + `scopeDescription`；实现侧用 `_scopedSlots[name]?.(scope)` 而非 `_slots[name]`；columns 定义里 `dataIndex` 用 `format: 'dataField'` |
| 漏洞 | 为每列硬编码 slot 名（不动态）；漏 `dynamicSource` / `dynamicKey`；漏 `scoped: true`；用 `_slots` 而非 `_scopedSlots`；用 React render-prop 自建 context |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 06" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 06" 段

## 测试者贴士

- fixture 是**空 plugin**，等 Agent 自己加 DataTable 组件
- scope 字段名（如 `record`、`index`）应从 SDK recipe 取，不要 Agent 自创
