# Scenario 02 — 从零做 ColorField：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`。

## 评分要点

> **结果导向**：契约 50 + 漏洞 30 + 完成 20 = 100。skill 路由仅作诊断观测（不计分）。

| 维度 | 关注 |
|---|---|
| CDP 契约落地 (50) | DATA_FIELD trait + `valueSchema` + `meta.title/category=DataEntry`；不重复声明 DATA_FIELD 自动注入字段（`value`/`readOnly`/`required`/`name`/`label`/`getValue`/`setValue`/`valueChange`）；`onChange(nextValue)` 不传 event；`validateManifest()` + `printValidationResult()` 自检 |
| 漏洞回避 (30) | 上述重复声明；`onChange` 传整个 event；漏 `meta.title` / `props.title`；凭印象 category；主动扩张 manifest 表面（用户没要求加 loading/clear action 等） |
| 任务完成度 (20) | 终止标识最低底线全满足；`forwardRef` + ref 上 `[COMPONENT_STATE_KEY]`；走完 wrap-up |
| 诊断观测（不计分） | 期望主调 `cdp-component-getting-started`，串联 manifest-basics / traits / events-actions-state / manifest-validation |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 02" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 02" 段

## 测试者贴士

- fixture 已有 `package.json` + `tsconfig.json`，**没有** `src/` —— Agent 自己搭骨架
- 用户没要求 `clear` / `reset` 等额外 action —— 主动加到 manifest = 越权；组件内部 UX（颜色预设、图标、动效等）不在 skills 评判范围
- 默认值应在 `valueSchema.default`，不在 React 组件参数
