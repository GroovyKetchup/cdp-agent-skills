# Scenario 05 — 修故障 manifest：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`。

## 评分要点

| 维度 | 关注 |
|---|---|
| 路由 | 主调 `cdp-component-manifest-validation`（症状路由表） → `cdp-component-events-actions-state`（修 actions / state） |
| 决策 | **不**先改宿主代码 / 不直接看 CDP 引擎源码；**先**校验 manifest（`validateManifest()` + `diagnoseMissingActionImpls()` + `diagnoseMissingStateKeys()`）；区分 error 必修 / warning 建议修；action key 必须 = ref method name |
| 漏洞 | 直接修宿主代码而不先验证 manifest；不会用 `diagnoseMissing*` 自检；不知 action key = ref method；不区分 error / warning |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 05" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 05" 段

## 测试者贴士

故意写错 6 处（**不**告诉 Agent）：

1. ref method 叫 `resetValue`，但 manifest action key 是 `reset` → 调用失败
2. state `selectedColor` 直接挂 ref 顶层，不在 `[COMPONENT_STATE_KEY]` 下 → 读不到
3. `useImperativeHandle` 依赖数组缺 `selectedColor` → stale closure
4. action `reset` 漏 `title` → validateManifest warning
5. action `reset.params` 没 `type='object'` → validateManifest error
6. state `selectedColor` 漏 schema → validateManifest warning

`tsc --noEmit` **不会**抓这些错（都是数据/语义错，不是类型错）—— 需要 Agent 主动跑 `validateManifest()` + `diagnoseMissing*()` 才能发现。
