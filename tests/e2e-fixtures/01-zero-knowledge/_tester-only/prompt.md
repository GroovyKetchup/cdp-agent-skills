# Scenario 01 — 零知识开发者：测试 Prompt

## 用户请求（原样发给 Agent）

> 我同事让我帮 CDP 平台开发一个组件，但我从来没听说过 CDP，也不知道要怎么开始。你能告诉我从哪里入手吗？

---

## 测试者预设答案（仅 Agent 主动询问时使用）

| Agent 可能问 | 你回答 |
|---|---|
| 包名 / 项目名是什么？ | `@acme/cdp-components` |
| 包版本？ | `0.1.0` |
| 组件命名空间 / type 前缀？ | `acme` |
| 第一个要做什么组件？ | 我先把架子搭起来就行，**组件等我同事说清楚需求下次再做——这次不做任何组件** |
| 用什么 React 版本？ | 跟 SDK 走（19） |
| 用 TypeScript 还是 JavaScript？ | TypeScript |
| 用什么打包工具？ | Vite，跟 SDK 一致 |

**注意**：

- Agent 应该**先**走"自主获取顺序"（读 package.json → 看现有模式 → 失败后再问）
- 如果 Agent 一上来就问 5+ 个问题逐个确认，记一笔"违反自主获取顺序"
- 如果 Agent 不问任何问题就凭印象编结构，记一笔"凭印象"

---

## 不应出现的行为（出现即扣失败模式回避分）

- 凭印象用 `BASIC` / `FORM` / `CONTAINER` 等不存在的 category
  - 真实可用的 category 在 SDK `COMPONENT_CATEGORY` 中：`General`, `Float`, `Layout`, `DataEntry`, `DataDisplay`, `Chart`, `Business`, `Shell`, `Page`, `Dev`, `HtmlTemplate`
- `EngineComponentPackage` 用 `name` 字段（应为 `id`）
- React 版本不指定为 19（SDK peerDep）
- 强制每步 ASK 确认（旧版 skill 有此问题，新版应让 LLM 自主决定何时问）
- **创建任何具体组件**（即使是空壳）——本场景目标是 **0 组件骨架**，用户已明确说"组件下次再做"。出现 `Button` / `MyComponent` / `Demo*` / `Hello` 等 = 越权

---

## 期望路径概览

Agent 应给出大致这样的引导，**并按下方"终止标识"段动手搭出来**：

1. **现状评估**：当前目录空，无 `package.json`，无现有组件包模式 → 需要从零搭建
2. **必填决策点询问**：按"自主获取顺序"，至少询问包名 + type 命名空间前缀（其他可推断）
3. **5 阶段路线图执行**：
   - 阶段 1（环境与依赖）：✅ **必做** — `npm init` + 装 `cdp-material-sdk` + `react@19` peerDep
   - 阶段 2（搭骨架）：✅ **必做** — 建立可注册 0 组件的包骨架：存在空 components 注册点（独立数组或内联均可）+ 插件入口用 `EngineComponentPackage` 注册 0 组件
   - 阶段 3（首个组件）：❌ **必跳** — 用户明确说不做组件
   - 阶段 4（能力按需添加）：❌ **必跳** — 没组件就没能力可加
   - 阶段 5（交付前自检）：✅ **必做** — `validateManifest()` 对 0 组件 plugin 跑，应返回成功
4. **不应越权**：用户已明确"不做组件"，Agent 不应自作主张造任何 demo

---

## 终止标识（达到即算场景完成）

测试者按以下清单核验，**全部满足**才视为正常完成：

| # | 验收项 | 验证方法 |
|---|---|---|
| 1 | mech 工作区有 `package.json` | 含 `cdp-material-sdk` 依赖 + `react@19`（dependencies 或 peerDependencies） |
| 2 | mech 工作区有空 components 注册点 | 满足任一即可：独立文件导出空 manifest 数组；或 `EngineComponentPackage.components` 内联为 `[]` |
| 3 | mech 工作区有插件入口 | 用 `EngineComponentPackage`（`id` 字段不是 `name`），对外注册 0 组件包；文件名不限 |
| 4 | `npx tsc --noEmit` 通过 | 无 TS 错误 |
| 5 | `validateManifest()` 调用且返回成功 | Agent 在 transcript / artifacts 里贴出调用结果，显示 0 组件无错 |
| 6 | **0 个具体业务组件实现** | 不应出现 Button / Demo / Hello 等任何具体组件 manifest 或实现；空的组件父目录可以存在 |
| 7 | Agent 走完 `wrap-up-prompt.md`，输出 artifacts | self-report 含包名 / type 前缀 / 跳过组件的理由 |

**最低底线**（达不到即记 `incomplete`）：1 + 2 + 3 + 4 全部满足。第 5、6、7 项作为评分项细分。
