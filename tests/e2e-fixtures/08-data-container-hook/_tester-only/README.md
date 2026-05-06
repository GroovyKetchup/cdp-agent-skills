# Scenario 08 — useDataContainer 误用切换：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`。

## 评分要点

> **结果导向**：契约 50 + 漏洞 30 + 完成 20 = 100。skill 路由仅作诊断观测（不计分）。

| 维度 | 关注 |
|---|---|
| CDP 契约落地 (50) | 识别"订阅式 vs 命令式"误用（`useDataContainer` 订阅整体导致重渲染）；切换到 `useDataContainerApi`（命令式）；字段订阅交给 SDK `DataScope` / `useFieldRegistry`，不绕过；manifest 字节级未变（trait 是对的） |
| 漏洞回避 (30) | 🅰 仅用 `React.memo` 打补丁；🅰 自己手写字段注册表替代 `useFieldRegistry`；🅱 用 `useDataContainer` 加 `useMemo` 减重渲染；🅱 修了 manifest（trait）当问题源；🅰 用 zustand/jotai/valtio 等绕过 SDK DataScope/useFieldRegistry（状态库选择本身不判，只判是否绕过 SDK 契约） |
| 任务完成度 (20) | 终止标识最低底线全满足；self-report 解释"订阅式 vs 命令式"原理；走完 wrap-up |
| 诊断观测（不计分） | 期望主调 `cdp-component-traits` |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 08" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 08" 段

## 测试者贴士

- fixture 故意用错 hook（订阅整个 container）—— 这是**行为错**，`tsc --noEmit` 不会抓
- Agent 必须主动诊断渲染行为，靠 tsc 通过 ≠ 通过
- 关键检验：Agent 是否清楚区分三个 hook 的语义边界（`useDataContainer` 订阅 / `useDataContainerApi` 命令式 / `useFieldRegistry` 字段级订阅）
