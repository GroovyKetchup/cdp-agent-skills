# Scenario 06 — DataTable 动态作用域 slot：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`。

## 评分要点

> **结果导向**：契约 50 + 漏洞 30 + 完成 20 = 100。skill 路由仅作诊断观测（不计分）。

| 维度 | 关注 |
|---|---|
| CDP 契约落地 (50) | 三件套：`dynamic: true` + `dynamicSource: 'columns'` + `dynamicKey: '{<列唯一标识字段名>}'`（字段名你定，例 `key` / `id`）；`scoped: true` + `scopeDescription`（含 record + index）；实现侧用 `_scopedSlots[col.<唯一标识字段>]?.({ record, index })`（**不**用 `_slots`）；与数据绑定相关的列字段（例 `dataIndex` / `field`）用 `format: 'dataField'`；columns 由 props 配置不写死 |
| 漏洞回避 (30) | 为每列硬编码 slot 名；漏 `dynamicSource` / `dynamicKey` / `scoped`；用 `_slots` 而非 `_scopedSlots`；`dynamicKey` 模板语法错（项目约定 `{<字段名>}`，误例：`:key` / `${key}` / `[key]`）；dynamicKey 插值字段 与 实现侧 `_scopedSlots[col.<字段>]` 不一致；用 React render prop 自建 context；主动扩张 manifest 表面（排序/筛选/分页做成 manifest 暴露能力） |
| 任务完成度 (20) | 终止标识最低底线全满足；走完 wrap-up |
| 诊断观测（不计分） | 期望主调 `cdp-component-slots`，串联 `cdp-component-manifest-basics`（columns schema） |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 06" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 06" 段

## 测试者贴士

- fixture 是**空 plugin**，等 Agent 自己加 DataTable 组件
- scope 字段名（如 `record`、`index`）应从 SDK recipe 取，不要 Agent 自创
