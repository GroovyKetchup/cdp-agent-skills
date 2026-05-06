# 跑测自动化路线图

> 决定**何时做、做什么、不做什么**自动化。Gate 1 跑完后回看本文件再决定推进到下一阶段。

## 当前决策（截至 2026-04-30）

**仅启用阶段 B1（独立 Judge 提速人工评分）**。其他自动化继续不做。

- ✅ 独立 Judge 评分包已就绪：`tests/e2e-fixtures/_shared/judge-prompt.md`
- ❌ 不做 Mock User、不做 Orchestrator、不做 API 批量调度
- 详见 § 2 阶段 B1
- 修订历史见 § 5

---

## 1. 项目语境的 4 个陷阱

把通用 Multi-Agent / LLM-as-a-Judge 思路套到本项目前，必须直面：

### 1.1 CLI Agent ≠ IDE Agent（覆盖率天花板 ~40%）

cdp-agent-skills 主要服务 IDE 用户。9 种目标 Agent 的 headless 可行性：

| Agent | Headless | 备注 |
|---|---|---|
| `claude-code` | ✅ | SDK + 非交互模式 |
| `qwen-code` | ✅ | CLI 完整 |
| `opencode` | ✅ | CLI 完整 |
| `copilot-cli` (`gh copilot`) | ⚠️ | policy 限制多 |
| `aider`（参考基线） | ✅ | 不是 9 目标之一，但可作 baseline |
| Windsurf | ❌ | IDE-only，无稳定 headless API |
| Cursor | ⚠️ | CLI 有但功能阉割 |
| Antigravity / Trae / OpenClaw | ❌ | 纯 IDE 插件 |

skill 加载机制每个 IDE 不同（`.cursorrules` / `global_rules.md` / `.claude/skills/` / `.windsurf/rules/`）。**CLI 自动化跑通 ≠ IDE Agent 跑通**。

**结论**：自动化最多覆盖 4-5 个 Agent。Windsurf / Cursor / Antigravity / Trae / OpenClaw 部分**绕不开人工**。

### 1.2 Mock User 与评分维度冲突

评分点本身就是"Agent 何时问、问什么、问多少"：

- "凭印象不问 → 扣分"
- "一上来连问 5+ 题强制 ASK → 扣分"
- "该问的没问 → 扣分"

Mock User 实现方案及风险：

| 方案 | 问题 |
|---|---|
| 关键字字典匹配 | Agent 自由提问命中率低，"我没听懂"引入 noise |
| LLM 当 Mock User | 引入第二个不可控 LLM，污染测试信号 |
| 严格脚本（按预设顺序回答）| 不真实，Agent 路径偏离即失效 |

**结论**：Mock User 不是不能做，是**主要工程风险**。

### 1.3 LLM-as-a-Judge 一致性需要 calibration

| 评分维度 | Judge 难度 | 备注 |
|---|---|---|
| 漏洞回避（🅰 关键字明确） | 容易 | 一致性高 |
| 路由准确（是否调用某 skill） | 容易 | grep transcript 即可 |
| 决策落地（"必填决策点表"、error/warning 区分） | 中等 | rubric + few-shot + 强制 JSON schema |
| "是否过度调用其他 skill"、"5 阶段路线图是否完整" | 难 | 需 calibration（同 transcript 多次评分看方差） |

**结论**：可解，但前期 calibration ~1-2 天，必须用 Gate 1 人工评分作 ground truth。

### 1.4 Gate 1 还没跑过，先做自动化是过早投入

- skill 是否真能被各 Agent 读懂、路由准确——**没跑过 1 次**
- Gate 1 设计目的就是"1 × 1 × 1"暴露 skill 内容本身的问题
- 如果 1 次跑发现"skill 写法导致普遍误读"，自动化前必须先改 skill
- 自动化是 Gate 2（跨 LLM × IDE × N=3）才有 ROI——人工不可承受时才需要

**Gate 1 工作量**：≤ 9 场景 × 1 次 ≈ 1 天
**自动化建设**：~1-2 周
**ROI 倒挂**。

---

## 2. 推荐三阶段路线

### 阶段 A — 人工跑 Gate 1（**当前**）

- 范围：1 主力 LLM × 1 主力 IDE × 9 场景 × 1 次
- 工作量：~1 天
- 工具：现有 `e2e-runbook.md`
- **完全不上自动化**
- **触发条件**：当前已就绪，可立即开跑

### 阶段 B1 — 独立 Judge（**当前已启用**）

用**与 Worker 不同模型**的新会话当 Judge，测试者复核。**不**写脚本、**不**调 API、**不**做 Mock User。

- 形式：测试者跑完 1 场景 → 新开 LLM 会话 → attach Judge 上下文包 → Judge 输出 JSON → 测试者复核 → 落 `score.md`
- 9 场景跑完后再开一次 "汇总 Judge" 会话产出 `summary.md`
- Judge 评分包：`tests/e2e-fixtures/_shared/judge-prompt.md`
- 偏见控制：Worker × Judge 必须不同模型；测试者保留复核 / 推翻权；前 3-5 场景复核记录作 calibration 反馈
- 工作量：每场景 ~5-10 分钟（复核为主），9 场景总 ~1.5 小时
- 收益：相比纯人工评分（~5-6 小时）省 ~70%

**触发条件**：Judge prompt 模板就绪 — ✅ 已满足（2026-04-30）。

**为什么之前 "30 场景 ground truth" 现在不需要**：原触发条件假设 Judge 完全取代人工，需预先 calibration。B1 是 "Judge 出初评 + 人工复核"，复核本身就是逐步 calibration，从第 1 场景就能开。

### 阶段 B2 — API 批量自动化（**Gate 2 阶段**）

在 B1 基础上写脚本调 API，多 Judge 取中位，批量产出 score.md / summary.md。

- 输入：`e2e-results/<日期>/<LLM-IDE>/<场景>/{transcript.md, artifacts/}`
- Judge：Claude Sonnet 4.5 + GPT-4o + Gemini 2.5 Pro 三方对齐取中位
- 工具：`promptfoo` 或自写 ~200 行 Node.js（**不必**上 LangGraph / AutoGen）
- 工作量：2-3 天 + ~$5-20 API 成本 / 100 场景
- 收益：Gate 2 矩阵期（9 场景 × ≥3 LLM × ≥3 IDE × N=3 = ≥81 单元）人工不可承受时才必要

**触发条件（同时）**：

1. B1 累计复核 ≥ 30 场景（足够 ground truth 对齐三方 Judge prompt）
2. Gate 2 矩阵正式启动
3. skill 内容稳定（最近 1 周没有 skill 大改）

### 阶段 C — Tier 1：CLI Agent 自动化（**Gate 2 阶段，可选**）

- 范围：仅覆盖 `claude-code` / `qwen-code` / `opencode` / `copilot-cli` 4 个 CLI Agent
- 用途：Gate 2 的 N=3 重复跑、跨 LLM 矩阵
- IDE Agent（Windsurf / Cursor / Antigravity / Trae / OpenClaw）**仍然人工**——绕不开
- 工作量：3-5 天（Mock User 是大头）
- 工具：Node.js + 子进程 + Promptfoo
- 输出：自动跑测 + 自动 transcript 抓取 + 接 Judge 评分

**触发条件（同时）**：

1. 阶段 B 的 Judge 已稳定（与人工评分一致性 ≥ 85%）
2. Gate 2 矩阵正式开跑（即"我们正在做 N=3 跨 LLM × IDE 重复"）
3. CLI Agent 部分至少占 Gate 2 范围的 30%（否则 ROI 仍不够）

---

## 3. 现在不做的理由（明确清单）

避免被流行术语牵着走。**当前不做**：

- ❌ 完整 Orchestrator + Mock User + Judge 三件套
- ❌ LangGraph / AutoGen 等 multi-agent 框架（项目规模不匹配）
- ❌ 寄希望于"全自动化替代人工"——IDE Agent 的 GUI 强约束决定这是死路一部分
- ❌ 在 Gate 1 跑通前做任何自动化（ROI 倒挂）
- ❌ 把 Mock User 当"小事"——实际是主要工程风险点

---

## 4. 阶段触发表（速查）

| 阶段 | 触发条件 | 状态 |
|---|---|---|
| A 人工跑测 | 永远默认 | ✅ 启用 |
| B1 独立 Judge | judge-prompt 模板就绪 | ✅ 启用（2026-04-30）|
| B2 API 批量自动化 | B1 累计 ≥ 30 场景复核 + Gate 2 启动 + skill 稳定 | ⏸ 待 |
| C CLI Agent 自动化 | B2 一致性 ≥ 85% + Gate 2 正式跑 + CLI 覆盖 ≥ 30% | ⏸ 待 |

---

## 5. 路线图修订记录

| 日期 | 修订人 | 变更 |
|---|---|---|
| 2026-04-29 | 初版 | 三阶段定型（A/B/C）；当前定阶段 A |
| 2026-04-30 | — | 阶段 B 拆为 B1（独立 Judge，立即启用）+ B2（API 批量，Gate 2 时启用）；新增 `judge-prompt.md` 评分包 |
