# Scenario 03 — 包装第三方 DatePicker：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`。

## 评分要点

> **结果导向**：契约 50 + 漏洞 30 + 完成 20 = 100。skill 路由仅作诊断观测（不计分）。

| 维度 | 关注 |
|---|---|
| CDP 契约落地 (50) | 三层决策表：**结构** wrapper（forwardRef + 外层 DOM + spread `slotProps.root`，不传给 vendor）；**Props** wrapper 内做值类型转换（number ↔ Date），不用 propMapping 改值；**事件** `adapter.events.valueChange.propName: 'onDateChange'` + `transform`，事件已在 manifest `events` 声明；rootPath = `INJECT_PATH_SLOT_PROPS` |
| 漏洞回避 (30) | 用 `propMapping` 试图改值类型；wrapper 里手写所有事件适配；`slotProps.root` 直接传给 vendor；`adapter.events` 引用未声明事件；重复声明 DATA_FIELD 自动注入的 `valueChange` |
| 任务完成度 (20) | 终止标识最低底线全满足；vendor 字节级未变；`validateManifest(plugin)` 通过；走完 wrap-up |
| 诊断观测（不计分） | 期望主调 `cdp-component-adapter-and-wrap`，串联 `cdp-component-runtime-behavior`（rootPath） |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 03" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 03" 段

## 测试者贴士

- `vendor/date-picker.tsx` 是 stub —— 接口：`selectedDate: Date` + `onDateChange(date: Date|null)`，**不**接受未知 DOM 属性
- vendor 是只读的，Agent 不该 `extends` 或改 vendor 源码
- React 应配 peerDependency，避免重复打包
