# Scenario 09 — 复制粘贴老组件清理：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`。

## 评分要点

> **结果导向**：契约 50 + 漏洞 30 + 完成 20 = 100。skill 路由仅作诊断观测（不计分）。

| 维度 | 关注 |
|---|---|
| CDP 契约落地 (50) | 必删：`engine.render.loading` / `actions.setLoading` / `actions.getLoading` / `state.loading` / DATA_FIELD trait / `adapter.propMapping` / `events.focus` / `events.blur` / `props.placeholder`；必保：INTERACTION_CLICKABLE trait / `events.click` / `actions.click` / `props.label`；type 唯一（`acme.NewActionBar` 不复用）；`validateManifest()` 通过 |
| 漏洞回避 (30) | 没移除老组件特有的 trait/event/action/state（配置漂移）；复用相同 `type` 字符串；直接 `import OldButton` 实现复用 |
| 任务完成度 (20) | 终止标识全满足；OldButton 字节级未变；走完 wrap-up |
| 诊断观测（不计分） | 期望主调 `cdp-component-add-to-existing-package`，串联 traits / events-actions-state / runtime-behavior（清无关能力）+ manifest-validation |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 09" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 09" 段

## 测试者贴士

- fixture 已有 `OldButton`（含 loading / setLoading / disabled / hidden 一堆 manifest 字段）
- 用户要的 `NewActionBar` 不需要 loading 和 disabled，要图标
- 关键考查：Agent 是否会**逐字段过一遍**问"这个新组件需要吗"，而不是无脑复制 manifest
