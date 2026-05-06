# Scenario 04 — 已有项目加 Card：测试者笔记

> 仅测试者读，**不**进 Agent workspace（已通过 `_tester-only/` 隔离）。

## 用法

跑测流程见 `../../../e2e-runbook.md` § 3。Prompt 在 `./prompt.md`。

## 评分要点

| 维度 | 关注 |
|---|---|
| 路由 | 主调 `cdp-component-add-to-existing-package`（**不是** getting-started）；按需 `traits` / `slots` / `manifest-basics` |
| 决策 | **只新增**：Card 组件实现 + manifest，并把 Card 纳入既有组件包注册入口；不重写 plugin / 构建工具 / ColorField；slots `header` / `footer` 含 `title`；type 同命名空间（`acme.Card`） |
| 漏洞 | 重建组件包结构 / 替换构建工具；改写不相关组件；漏聚合或 plugin 注册；漏 slot `title`；用 `<header>{children}</header>` 凑数而非 `_slots.header` |

完整评分表 → `../../../e2e-evaluation-template.md` "场景 04" 段
完整设计依据 → `../../../e2e-test-matrix.md` "场景 04" 段

## 测试者贴士

- fixture 已有 ColorField 完整实现作"抄作业"参考
- LAYOUT_CONTAINER 提供默认 children 区域；header/footer 必须用具名 slot，不要把 children 当 slot
