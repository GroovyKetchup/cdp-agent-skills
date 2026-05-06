# Scenario 03 — 包装第三方 DatePicker：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`。

## 评分要点

| 维度 | 关注 |
|---|---|
| 路由 | 主调 `cdp-component-adapter-and-wrap`（核心）+ `cdp-component-runtime-behavior`（rootPath 决策） |
| 决策 | 三层决策表分流：**结构** wrapper（forwardRef + 外层 DOM + `slotProps.root`）；**Props** wrapper 内做值类型转换（number ↔ Date）；**事件** `adapter.events.valueChange.propName: 'onDateChange'` + `transform` |
| 漏洞 | 用 `propMapping` 试图做值类型转换（只改名不改值）；wrapper 里手写所有事件适配；`slotProps.root` 直接传给 vendor（vendor 不接受未知 DOM 属性）；`adapter.events` 引用未在 manifest `events` 声明的事件 |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 03" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 03" 段

## 测试者贴士

- `vendor/date-picker.tsx` 是 stub —— 接口：`selectedDate: Date` + `onDateChange(date: Date|null)`，**不**接受未知 DOM 属性
- vendor 是只读的，Agent 不该 `extends` 或改 vendor 源码
- React 应配 peerDependency，避免重复打包
