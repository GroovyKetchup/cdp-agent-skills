# Scenario 09 — 复制粘贴老组件清理：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`。

## 评分要点

| 维度 | 关注 |
|---|---|
| 路由 | 主调 `cdp-component-add-to-existing-package`；按需 `traits` / `events-actions-state` |
| 决策 | 复制后**清理**与新组件无关的：`loading` 配置、`setLoading` action、disabled 相关 props/state；新 type 唯一不与 OldButton 重复且加正确命名空间；不留"老组件特有" trait / event / action / state |
| 漏洞 | 没移除老组件特有的 trait / event / action / state（配置漂移）；复用相同 `type` 字符串 |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 09" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 09" 段

## 测试者贴士

- fixture 已有 `OldButton`（含 loading / setLoading / disabled / hidden 一堆 manifest 字段）
- 用户要的 `NewActionBar` 不需要 loading 和 disabled，要图标
- 关键考查：Agent 是否会**逐字段过一遍**问"这个新组件需要吗"，而不是无脑复制 manifest
