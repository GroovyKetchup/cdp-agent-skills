# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 风格记录变更。

## [Unreleased]

## [0.1.1] - 2026-05-07

### Changed

- **`install` 交互式 agent 选择改为编号菜单**：原先需手动输入 agent id（易拼错），现在打印编号列表（1-10），支持输入数字、agent id 或直接回车走默认 `windsurf`；无效输入会重新询问而不是直接报错。向后兼容旧的 id 输入方式。


### Added

- **端到端验证矩阵（Gate 1）**：`tests/e2e-test-matrix.md` 定义 9 场景验证方案（5 Tier A 必跑 + 4 Tier B 进阶），含三 Gate 投产门槛（内部 MVP / 跨 LLM × IDE 矩阵 / 真实开发者灰度）。
- **9 个独立靠场 fixture** `tests/e2e-fixtures/01..09/`：每个含代码骨架（`src/`、`vendor/`、`package.json`、`tsconfig.json` 视场景而定）+ `_tester-only/{README.md,prompt.md}`（**仅测试者读，不进 Agent workspace**）。
  - 01 零知识 / 02 从零 ColorField / 03 包装 DatePicker / 04 加 Card / 05 修故障 manifest / 06 DataTable scoped slot / 07 Button native loading / 08 useDataContainer 误用 / 09 复制粘贴清理（详见矩阵）
- **评分模板** `tests/e2e-evaluation-template.md`：路由 40 + 决策 30 + 漏洞回避 30；含 Gate 1 门槛、9 场景汇总、单场景详评、跑测后处理（回填 `tdd-progress.md` + Gate 2 准备）。
- **跑测 SOP** `tests/e2e-runbook.md`：8 节实操手册（速查 / 红线 / 一次性准备 / 单场景 / 跑批 / 异常 / 假错 / Gate 1 收尾），含跨平台一键准备脚本、并跑节奏建议、超时与作废判定。
- **收尾 prompt 模板** `tests/e2e-fixtures/_shared/wrap-up-prompt.md`：标准化的"测试者 → Agent"4 步收尾指令（mkdir、拷源码、终端输出、200 字 self-report），含占位符填写说明、不可改的理由（避免反向泄题）、与 transcript / score 的边界。
- 仓库根 `jsconfig.json`：将 `tests/e2e-fixtures` 排除出主项目 LSP 解析，避免 fixture lint 噪音污染仓库主视图。
- README 新增"端到端验证（Gate 1）"段。
- **自动化路线图** `tests/automation-roadmap.md`：明确"现在不做"清单 + 三阶段路线（A 人工 Gate 1 / B Judge 自动化 / C CLI Agent 自动化）+ 各阶段触发条件 + 4 个项目语境陷阱（CLI ≠ IDE 覆盖率天花板、Mock User 与评分维度冲突、Judge calibration 成本、Gate 1 前自动化 ROI 倒挂）。避免被 Multi-Agent / LLM-as-a-Judge 等流行术语牵着走过早投入。
- **Judge 评分包** `tests/e2e-fixtures/_shared/judge-prompt.md`：独立 Judge 启动包，含上下文文件清单（7 类）+ Judge System Prompt（角色 / 纪律 / JSON output schema 含 evidence 行号引用）+ summary.md 汇总 Prompt + 偏见与限制说明。核心约束：Worker × Judge **必须不同模型**（如 Worker=Claude → Judge=GPT-4o / Gemini），测试者保留复核 / 推翻权。配套 runbook §3.1 第 9 步与 §7 收尾。
- **automation-roadmap 阶段 B 拆为 B1/B2**：B1（独立 Judge 提速人工评分，**立即启用**）省略原"30 场景 ground truth 预 calibration"门槛——因为 B1 是"Judge 初评 + 人工复核"模式，复核本身就是逐步 calibration；B2（API 批量自动化）保留原门槛，Gate 2 矩阵期再启用。

### Changed

- **fixture 结构调整（防泄题）**：`README.md` + `prompt.md` 从 `tests/e2e-fixtures/<场景>/` 移至 `tests/e2e-fixtures/<场景>/_tester-only/`。这两个文件含"评分关注 / 期望路径 / 测试者预设答案 / 漏洞清单"，原放在 fixture 根 = Agent 一打开 workspace 即可读到 = 直接给 Agent 答题卡。新结构通过 `Copy-Item -Exclude '_tester-only'` 在复制到 mech 时排除，仓库源仍可被测试者读取。`_tester-only/` 内的相对路径同步从 `../../e2e-*.md` 改为 `../../../e2e-*.md`。
- **runbook 大幅瘦身**：从 ~450 行精简到 ~190 行。新结构以"做什么"为骨架（速查 → 红线 → 一次性准备 → 单场景 8 步 → 跑批 → 异常 → 假错 → Gate 1 收尾），删除冗长的"为什么这样设计"解释，保留所有命令、清单与判定标准。一次性准备段含一条覆盖"复制 + 排除 _tester-only + npm install + 装 skill"的批量脚本。

### Fixed

- `tests/e2e-fixtures/03-wrap-third-party-datepicker/tsconfig.json` 与 `07-button-native-loading/tsconfig.json`：删除 `rootDir: "./src"`（与 `include: ["vendor/**/*"]` 冲突，tsc 报 TS6059）。机械验证 9/9 通过。

### 验证

- `npm test`：19/19 通过
- 9 fixture 独立目录 `npm install` 全部成功；6 个含 src 的（03/04/05/07/08/09）`tsc --noEmit` 全部通过
- 9 fixture 本地 `node src/cli.js install --agent windsurf --yes --all`（`exit=0`），每个 mech 副本 `.windsurf/skills/` 含 9 个 skill 子目录
- 仓库 9 fixture 根目录已确认无 `*.md`（`README/prompt` 全部归位 `_tester-only/`）
- mech 9 fixture 根目录已确认无 `README.md/prompt.md` 残留

### 注

- Gate 1 通过 ≠ 投产 ready。Gate 2（跨 LLM × IDE × N=3）+ Gate 3（真实开发者灰度）待规划。
- 故意错的场景 05（manifest 数据错）和 08（hook 误用）按设计**不**被 tsc 拦截，留给 Agent 用 `validateManifest()` / 行为诊断发现。

## [0.2.0] - 2026-04-28

### Changed (Breaking)

- Skills 由 7 个重构为 9 个，按"主线 + 原子"分层：
  - **主线 skill**（3 个）只做工作流程编排、决策点和"症状 / 需求 → 原子 skill"路由，不重复原子内容：
    - `cdp-component-getting-started`（总调度，从零启动）
    - `cdp-component-add-to-existing-package`（增量新增组件）
    - `cdp-component-manifest-validation`（排错入口 + 交付前自检）
  - **原子 skill**（6 个）各管一块独立能力：
    - `cdp-component-manifest-basics`（**新增**，覆盖 props + designer meta + manifest 必填字段）
    - `cdp-component-traits`（替换 `cdp-component-data-field-container`，新增 `LAYOUT_CONTAINER`）
    - `cdp-component-events-actions-state`（由 `cdp-component-actions-state-events-slots` 拆分，去掉 slots）
    - `cdp-component-slots`（由 `cdp-component-actions-state-events-slots` 拆分独立）
    - `cdp-component-runtime-behavior`（替换 `cdp-component-rootpath-loading`，引入 `useConcurrentLoading` / `useDualLoading` 与引擎基础能力）
    - `cdp-component-adapter-and-wrap`（替换 `cdp-component-wrap-react-library`，升格为"Adapter 三层决策框架 + wrapper 标准模板"）
- SKILL.md 章节契约更新为：`## 概述` / `## 何时使用` / `## 工作流程` 或 `## 阶段路线图` / `## 引导路径` / `## 完成检查` / `## 维护来源`（取代旧 `## 适用场景` / `## 前置检查` / `## 运行时参考` / `## 需求澄清|决策点`）。
- 主线 skill 移除"必须与用户确认"的强制 ASK pattern，改为"自主获取顺序"决策点列（让 agent 自主推断 / 读现有代码 / 必要时再询问）。
- references frontmatter 放宽：仅强制要求 `sdk-docs:` 指向 `cdp-material-sdk/docs/component-development/`，不再要求 `sdk: cdp-material-sdk@0.0.4` 行。
- 测试 (`tests/install/skill-catalog.test.js`、`tests/install/install-targets.test.js`) 同步更新到 9-skill 契约。

### Removed

- 删除 4 个旧 skill 目录：
  - `cdp-component-wrap-react-library`（被 `cdp-component-adapter-and-wrap` 替代）
  - `cdp-component-data-field-container`（被 `cdp-component-traits` 替代）
  - `cdp-component-actions-state-events-slots`（拆分为 `cdp-component-events-actions-state` + `cdp-component-slots`）
  - `cdp-component-rootpath-loading`（被 `cdp-component-runtime-behavior` 替代）
- SKILL.md 移除嵌入的 `npm install ... cdp-material-sdk@latest` 命令——安装指引归 README，skill 内容专注任务。

### Migration

- 替换旧 skill 引用：
  - `cdp-component-wrap-react-library` → `cdp-component-adapter-and-wrap`
  - `cdp-component-data-field-container` → `cdp-component-traits`
  - `cdp-component-actions-state-events-slots` → `cdp-component-events-actions-state` 或 `cdp-component-slots`（按场景拆）
  - `cdp-component-rootpath-loading` → `cdp-component-runtime-behavior`
- 旧版本中独立的 props / designer meta 任务现在走新 skill `cdp-component-manifest-basics`。

## [0.1.0] - 2026-04-26

### Added

- 初始化 `cdp-agent-skills` 独立仓库。
- 提供 `install`、`list`、`doctor` CLI 命令。
- 支持 Windsurf、Claude Code、Cursor、Copilot CLI、Antigravity、Trae、OpenClaw、Qwen Code、OpenCode 和 Custom 安装目标。
- 支持 Skills 目录型安装和 managed instruction file 桥接安装。
- 提供 7 个 CDP 组件开发 Skills：
  - `cdp-component-getting-started`
  - `cdp-component-add-to-existing-package`
  - `cdp-component-wrap-react-library`
  - `cdp-component-data-field-container`
  - `cdp-component-actions-state-events-slots`
  - `cdp-component-rootpath-loading`
  - `cdp-component-manifest-validation`
- 增加 Agent 安装目标、SDK 公开入口和组件文档映射参考。
- 增加 CLI、安装适配器、Skill catalog 和交互安装测试。
