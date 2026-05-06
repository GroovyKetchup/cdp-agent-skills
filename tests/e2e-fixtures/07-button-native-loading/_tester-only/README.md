# Scenario 07 — Button + native loading + onPress：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`。

## 评分要点

> **结果导向**：契约 50 + 漏洞 30 + 完成 20 = 100。skill 路由仅作诊断观测（不计分）。

| 维度 | 关注 |
|---|---|
| CDP 契约落地 (50) | Loading 选 `LOADING_STRATEGY.NATIVE`（vendor 自带）；rootPath = `INJECT_PATH_SLOT_PROPS` + 外层 div spread `slotProps?.root`；事件 `adapter.events.click.propName: 'onPress'`；`readOnly→disabled` 映射二选一（`adapter.propMapping: { readOnly: 'disabled' }` 或 wrapper JSX 里手写 `disabled={readOnly}` 透传）；不重复声明引擎自动能力 |
| 漏洞回避 (30) | 用 `wrapper` 整体遮罩；把 `INJECT_PATH_SLOT_PROPS` 直接给 vendor；重复声明 `hidden` / `mount` / `unmount`；`adapter.events.click` 引用未声明事件；wrapper 内手写 `onPress={onClick}` 转换；声明 `NATIVE` 但 wrapper 又重复实现 loading state |
| 任务完成度 (20) | 终止标识最低底线全满足；vendor 字节级未变；`validateManifest(plugin)` 通过；走完 wrap-up |
| 诊断观测（不计分） | 期望主调 `cdp-component-runtime-behavior` + `cdp-component-adapter-and-wrap`，串联 events-actions-state |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 07" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 07" 段

## 测试者贴士

- `vendor/button.tsx` 是 stub —— 接口：`onPress`（不是 `onClick`）+ 内置 `loading` prop
- `runtime-behavior` skill 的 Loading 决策表会指引 `native` vs `wrapper`，Agent 应明确说出选哪个 + 理由
