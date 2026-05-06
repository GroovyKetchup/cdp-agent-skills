# Scenario 04 — 已有项目加 Card：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`。

## 评分要点

> **结果导向**：契约 50 + 漏洞 30 + 完成 20 = 100。skill 路由仅作诊断观测（不计分）。

| 维度 | 关注 |
|---|---|
| CDP 契约落地 (50) | **只新增**：Card 组件 + manifest 接入既有组件包注册入口；不重写包结构 / plugin / 构建工具；ColorField 字节级未变；trait `[LAYOUT_CONTAINER]`（不要 DATA_CONTAINER）；两个命名 slot（语义上一个对应标题区、一个对应操作区，key 名你定：`header`/`footer` 或 `titleSlot`/`actionSlot` 等）各含 `title`；实现侧用 `_slots[<对应 slot key>]` 渲染两个区域（不用 React children 凑数） |
| 漏洞回避 (30) | 重建组件包结构 / 替换构建工具；改写 ColorField 等无关组件；创建 manifest 但未接入注册入口；漏 slot `title`；忘渲染 `_slots`；误以为 LAYOUT_CONTAINER 必须配 slots |
| 任务完成度 (20) | 终止标识最低底线全满足；`validateManifest(plugin)` 通过；走完 wrap-up |
| 诊断观测（不计分） | 期望主调 `cdp-component-add-to-existing-package`（**不是** getting-started），串联 traits / slots / manifest-basics |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 04" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 04" 段

## 测试者贴士

- fixture 已有 ColorField 完整实现作"抄作业"参考
- LAYOUT_CONTAINER 提供默认 children 区域；header/footer 必须用具名 slot，不要把 children 当 slot
