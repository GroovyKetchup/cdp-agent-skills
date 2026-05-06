# Scenario 08 — useDataContainer 误用切换：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`。

## 评分要点

| 维度 | 关注 |
|---|---|
| 路由 | 主调 `cdp-component-traits`（DATA_CONTAINER 三 hook 选择）；如涉及 loading 触发 `runtime-behavior` |
| 决策 | 识别"订阅式 vs 命令式"误用：`useDataContainer` 是订阅式，订阅整个容器导致每字段输入都重渲染；切换到 `useDataContainerApi`（命令式）只在需要时读值；字段订阅交给 `DataScope` / `useFieldRegistry` |
| 漏洞 | 用 `useDataContainer` 替代 `useDataContainerApi`（订阅式性能差）；自己手写字段注册表而不用 `useFieldRegistry` |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 08" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 08" 段

## 测试者贴士

- fixture 故意用错 hook（订阅整个 container）—— 这是**行为错**，`tsc --noEmit` 不会抓
- Agent 必须主动诊断渲染行为，靠 tsc 通过 ≠ 通过
- 关键检验：Agent 是否清楚区分三个 hook 的语义边界（`useDataContainer` 订阅 / `useDataContainerApi` 命令式 / `useFieldRegistry` 字段级订阅）
