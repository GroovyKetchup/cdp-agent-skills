# cdp-agent-skills 跑测 SOP

> 给**人类测试者**看的实操手册。配套 `e2e-test-matrix.md`（设计依据）+ `e2e-evaluation-template.md`（评分模板）+ `e2e-fixtures/_shared/wrap-up-prompt.md`（收尾模板）使用。

---

## 0. 速查

```
一次性准备：复制 fixture（排除 _tester-only）→ npm install → 装 skills
单场景：     新开 IDE 窗口 → 念 prompt → 不暗示 → Agent 收尾 → 评分
跨场景：     关窗口、新开窗口、加载下个 fixture
```

---

## 1. 红线（违反任意一条 = 本次跑测作废）

1. **每个 fixture 子目录单独作 IDE workspace 根**——绝不打开 mech 父目录、`tests/e2e-fixtures/`、仓库根
2. **换场景 = 关闭 IDE 窗口、新开窗口加载下个 fixture**——清空对话不够
3. **mech 副本里不能有 `README.md` / `prompt.md`**——这两个文件含答案，仓库源放在 `_tester-only/`，复制到 mech 时必须排除
4. **不暗示、不指点**——Agent 主动问到 `_tester-only/prompt.md` 的"测试者预设答案"表里的问题，照答；表外问题统一回"按你的判断处理"
5. **不让被测 Worker 自评 score.md**（独立 Judge 不算违反，见 § 3.1 第 9 步）

**作废征兆**：Agent 说"延续上次设计"、引用其他场景的组件名（如场景 01 提到 `ColorField`）、给出与他场一字不差的代码 → 立即关掉所有窗口、重置 mech、重跑。

---

## 2. 一次性准备

### 2.1 环境

- Node ≥ 18
- 仓库路径（示例）：`c:\project\js\CDP\cdp-agent-skills`
- mech 工作区（示例）：`C:\Users\<you>\AppData\Local\Temp\cdp-skills-mech`
- 选定 LLM × IDE 组合，**整次跑测不混**

### 2.2 复制 9 fixture 到 mech + 装 skill（一条脚本）

```powershell
$repo  = "c:\project\js\CDP\cdp-agent-skills"
$mech  = "C:\Users\<you>\AppData\Local\Temp\cdp-skills-mech"
$cli   = "$repo\src\cli.js"
$agent = "windsurf"   # 或 cursor / claude / antigravity / trae / openclaw / qwen-code / opencode / copilot-cli
$fixtures = @(
  '01-zero-knowledge','02-from-scratch-field','03-wrap-third-party-datepicker',
  '04-add-card-to-existing','05-broken-manifest','06-data-table-dynamic-slot',
  '07-button-native-loading','08-data-container-hook','09-copy-paste-cleanup'
)

foreach ($f in $fixtures) {
  $dst = Join-Path $mech $f
  if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
  New-Item -ItemType Directory -Path $dst -Force | Out-Null
  # 关键：-Exclude '_tester-only' 把答题卡留在仓库源
  Copy-Item "$repo\tests\e2e-fixtures\$f\*" $dst -Recurse -Exclude '_tester-only'
  Push-Location $dst
  if (Test-Path 'package.json') { npm install --silent }
  node $cli install --agent $agent --yes --all
  Pop-Location
  Write-Host "[$f] ready"
}
```

> 发版后可改用 `npx cdp-agent-skills@latest install --agent $agent --yes --all` 替代 `node $cli ...`。

### 2.3 准备 results 目录（仓库**外**）

```
e2e-results/<日期>/<LLM-IDE>/
  <场景>/
    transcript.md     # IDE 导出
    score.md          # 复制自 e2e-evaluation-template.md 对应场景段
    artifacts/        # Agent 用收尾 prompt 自己 robocopy 整盘镜像
  summary.md          # 跑完所有场景再写
```

---

## 3. 跑一个场景

### 3.1 步骤

1. **新开 IDE 窗口**（启动器/快捷方式新开实例，不是 File → Open Folder 切换）
2. **Open Folder 选 `<mech>\<场景>\`**——子目录、不是父
3. 关闭 IDE 全局规则注入（Cursor `.cursorrules` 全局、Windsurf global rules、Copilot instructions）
4. 打开仓库 `tests/e2e-fixtures/<场景>/_tester-only/prompt.md`，**复制"## 用户请求（原样发给 Agent）"段下的引用块**，粘到对话框，**不**加任何额外说明
5. 观察 Agent 跑（见 § 3.2 行为约束）
6. Agent 自报完成后，让它跑：`npm install && npx tsc --noEmit`（如有 src）+ 必要时 `validateManifest()`
7. 粘 `tests/e2e-fixtures/_shared/wrap-up-prompt.md` 的收尾 prompt（替换 4 个占位符），等 Agent 说"收尾完毕"
8. 从 IDE 导出完整对话 → `transcript.md`
9. **独立 Judge 评分**（见 `tests/e2e-fixtures/_shared/judge-prompt.md`）：
   - 新开会话，**模型必须 ≠ 被测 Worker 模型**（Worker=Claude → Judge=GPT-4o / Gemini；以此类推）
   - Attach `judge-prompt.md` § 0 列出的 7 类文件
   - 粘贴 `judge-prompt.md` § 1 的整段 Prompt
   - 复核 Judge 输出 JSON（重点核 `evidence` 数组与 `calibration_notes`），任何无证据扣分推翻重判
   - 把复核后的 JSON 转写为 `score.md`（保留 JSON + markdown 表格两份）

### 3.2 行为约束

| 测试者 | 做 ✅ / 不做 ❌ |
|---|---|
| ❌ | 主动给 skill 名 / 暗示路径 / 答没问的问题 / 纠正中间错（除非完全跑题）|
| ✅ | Agent 主动问到 `_tester-only/prompt.md` 预设表里的，**只**用预设答案回 |
| ✅ | 表外问题（如"要单测吗"），回"按你的判断处理" |
| ✅ | Agent 没主动跑 tsc / validateManifest，**不**提醒——评分时记下 |

### 3.3 单场景超时

- 上限 **30 分钟**：超时记 `timeout`，按 30 分钟时的产出评分
- Agent 死循环修同处错 ≥ 5 轮：手动打断，记 `loop`

---

## 4. 跑批

### 4.1 顺序

01 → 04 → 02 → 05 → 03（Tier A 完，可停）→ 09 → 06 → 07 → 08（Tier B）

### 4.2 并跑节奏

| 节奏 | 何时用 |
|---|---|
| **N=1 串跑** | 第一次熟悉 SOP / 拿 baseline |
| **N=2 错峰**（一长 02/09 + 一短 01/04） | 想省时且能盯两个对话 |
| **N≥3 同 LLM × IDE** | ❌ 禁（注意力 / rate limit / 内存）|
| **跨 LLM × IDE 并跑** | ✅（Gate 2 矩阵期推荐）|

每窗口独占 1 个测试者注意力，盯不过来立刻降并发。

### 4.3 中途停止

- 跑完当前**整个**场景再休——不接受"中断单场后续"
- 每场跑完立即填 `score.md`，不积压
- 发现 fixture bug：记到 `summary.md` 的"fixture 反馈"段，跑完整体再回头修

---

## 5. 异常处理

| 现象 | 做什么 |
|---|---|
| `npm install` 失败 | `npm view cdp-material-sdk version` 看 registry；删 `package-lock.json` 重装 |
| Agent 不识别 skill | `node <repo>\src\cli.js doctor --agent <target>`；重启 IDE；必要时 `install --force` |
| Agent 拒绝执行（策略屏蔽） | 记 `policy-blocked`；不算路由分；写进 summary 的"模型可用性"段 |
| 长上下文衰减（重复读 / 忘决定） | 记 `context-fatigue`；新建会话粘当前进度续跑 |
| IDE 卡死 / Agent 静默 ≥ 3 分钟 | 截图、重启 IDE（**不**重置 fixture 目录）、重发同句 prompt，记 `recovered-from-stall` |
| Agent 引用其他场景组件名 / 说"延续上次设计" | **违反 § 1 红线**——本次跑测整体作废，重置后重跑 |

---

## 6. 假错清单（不算 bug）

| 现象 | 解释 |
|---|---|
| 仓库内 fixture 显示 `Cannot find module 'cdp-material-sdk/portable'` | fixture 没装包；mech 副本装了之后没问题 |
| 场景 05 Agent 跑 `tsc --noEmit` 通过 | 故意错是数据/字符串错，不是类型错——靠 `validateManifest()` 抓 |
| 场景 08 Agent 不跑 tsc | hook 误用是行为错——靠 Agent 行为诊断不是 tsc |

---

## 7. Gate 1 收尾

跑完一个 LLM × IDE 的全部场景后：

1. **汇总 Judge**（独立新会话，输入 9 个 score.md JSON）：按 `judge-prompt.md` § 3 给的汇总 Prompt 输出 markdown 格式 `summary.md`；Tier A 平均 ≥ 80 = **Gate 1 通过**
2. 把出现的 🅰 漏洞回填到 `tdd-progress.md` 对应 skill 的"后续可能的漏洞"段
3. 决策下一步：

| Tier A 状态 | 下一步 |
|---|---|
| ≥ 80 + 无 🅰 漏洞 | 直接进 Gate 2 矩阵跑测 |
| ≥ 80 + 1-2 个 🅰 漏洞 | 修 skill → 重跑出错场景 → Gate 2 |
| < 80 | 修 skill；**不**扩矩阵 |

---

## 8. 链接

| 用途 | 文件 |
|---|---|
| 矩阵设计 + Gate 门槛 | `tests/e2e-test-matrix.md` |
| 评分模板 | `tests/e2e-evaluation-template.md` |
| 收尾 prompt 模板 | `tests/e2e-fixtures/_shared/wrap-up-prompt.md` |
| Judge 评分包（独立 Judge / 汇总 Judge）| `tests/e2e-fixtures/_shared/judge-prompt.md` |
| 单场景说明（仅测试者读）| `tests/e2e-fixtures/<场景>/_tester-only/README.md` |
| 单场景 prompt（仅测试者读）| `tests/e2e-fixtures/<场景>/_tester-only/prompt.md` |
| TDD 进度 / 漏洞回填 | `tdd-progress.md` |
