# Scenario 01 — 零知识开发者：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`（"用户请求"段原样粘给 Agent）。

## 评分要点

> **结果导向**：契约 50 + 漏洞 30 + 完成 20 = 100。skill 路由仅作诊断观测（不计分）。

| 维度 | 关注 |
|---|---|
| CDP 契约落地 (50) | 0 组件骨架契约齐全（`EngineComponentPackage` `id` + 空 `components` + 插件入口）；`cdp-material-sdk` + React 19 peerDep；`validateManifest()` 跑通；不重复声明引擎自动能力；`tsc --noEmit` 通过 |
| 漏洞回避 (30) | 凭印象用不存在的 category；`name` vs `id`；React 不指定 19；强制 ASK；越权建 demo / 任何具体组件目录 |
| 任务完成度 (20) | 终止标识最低底线全满足；正确识别"不做组件"意图；走完 wrap-up 输出 artifacts |
| 诊断观测（不计分） | 期望主调 `cdp-component-getting-started` 是否被触发 / 采纳深度 / 替代路径（读 SDK / 经验 / 其他） |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 01" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 01" 段

## 测试者贴士

- 这是**完全空目录**——Agent 看不到 `package.json`、看不到任何源码
- Agent 应该先尝试读 package.json（无）→ 看现有模式（无）→ 然后才问用户
- 一上来就连问 5+ 题 = "违反自主获取顺序"
- 不问任何问题、凭印象编结构 = "凭印象"
- 用户明说"先不做组件"，Agent 不该自作主张造 demo
