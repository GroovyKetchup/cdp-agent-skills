# Scenario 07 — Button + native loading + onPress：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`。

## 评分要点

| 维度 | 关注 |
|---|---|
| 路由 | 主调 `cdp-component-runtime-behavior`（Loading 决策）+ `cdp-component-adapter-and-wrap`（事件名 propName） |
| 决策 | Loading 选 `native`（VendorButton 自带 loading），**不**用 `wrapper`（整体遮罩破坏视觉）；事件 `adapter.events.click.propName: 'onPress'`；rootPath 决策：vendor 不接受未知 DOM 属性，需 wrapper 外层 + `INJECT_PATH_SLOT_PROPS` |
| 漏洞 | 用 `wrapper` 整体遮罩；用 `native` 但忘"loading 时阻断点击"；把 `INJECT_PATH_SLOT_PROPS` 直接给 vendor；重复声明 `hidden` / `setHidden` / `mount` / `unmount`（引擎自动补充） |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 07" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 07" 段

## 测试者贴士

- `vendor/button.tsx` 是 stub —— 接口：`onPress`（不是 `onClick`）+ 内置 `loading` prop
- `runtime-behavior` skill 的 Loading 决策表会指引 `native` vs `wrapper`，Agent 应明确说出选哪个 + 理由
