# Scenario 01 — 零知识开发者：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`（"用户请求"段原样粘给 Agent）。

## 评分要点

| 维度 | 关注 |
|---|---|
| 路由 | 主调 `cdp-component-getting-started`；不要过度调用其他 skill |
| 决策 | 按"必填决策点表 + 自主获取顺序"操作；给出 5 阶段路线图 |
| 漏洞 | 凭印象用不存在的 category；`name` vs `id`；React 不指定 19；强制 ASK；主动建 demo |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 01" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 01" 段

## 测试者贴士

- 这是**完全空目录**——Agent 看不到 `package.json`、看不到任何源码
- Agent 应该先尝试读 package.json（无）→ 看现有模式（无）→ 然后才问用户
- 一上来就连问 5+ 题 = "违反自主获取顺序"
- 不问任何问题、凭印象编结构 = "凭印象"
- 用户明说"先不做组件"，Agent 不该自作主张造 demo
