# Scenario 02 — 从零做 ColorField：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`。

## 评分要点

| 维度 | 关注 |
|---|---|
| 路由 | 5 skill 串联：`getting-started` → `manifest-basics` → `traits` → `events-actions-state` → `manifest-validation` |
| 决策 | DATA_FIELD trait + `valueSchema` + `meta.title/category` + props.title；`forwardRef` + ref 上 `[COMPONENT_STATE_KEY]`；`onChange(nextValue)` 不传 event |
| 漏洞 | 重复声明 DATA_FIELD 自动注入字段（`value`/`readOnly`/`required`/`name`/`label`）；重复声明 `getValue`/`setValue`/`valueChange`；漏 `meta.title`；漏 props 字段 `title`；凭印象 category（应是 `DataEntry`） |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 02" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 02" 段

## 测试者贴士

- fixture 已有 `package.json` + `tsconfig.json`，**没有** `src/` —— Agent 自己搭骨架
- 用户没要求 `clear` / `reset` 等额外 action —— 主动加到 manifest = 越权；组件内部 UX（颜色预设、图标、动效等）不在 skills 评判范围
- 默认值应在 `valueSchema.default`，不在 React 组件参数
