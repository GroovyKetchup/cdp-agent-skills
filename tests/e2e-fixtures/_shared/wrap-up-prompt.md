# 场景收尾 prompt 模板

> **谁用这个**：人类测试者
>
> **什么时候用**：Agent 给出"已完成"信号、且通过了 `prompt.md` "完成判定"段（npm install + tsc / validateManifest）之后
>
> **怎么用**：复制下方"⤵ 复制以下文字粘到对话框 ⤵"段下面的引用块原文，**只**替换 2 个占位符（`<results 根>` / `<LLM-IDE>`），其他一字不改。日期和场景名由 Agent 自己算。
>
> **为什么不能改**：任何对收尾步骤的额外指令都可能反向暗示评分点（如"确认 manifest.ts 是否含 forwardRef"会泄题），污染下次跑测

---

## 占位符填写示例（只剩 2 个要测试者填）

| 占位符 | 示例 | 说明 |
|---|---|---|
| `<results 根>` | `D:\e2e-results` | 跑测归档根目录绝对路径，**不**含日期 / LLM / 场景层 |
| `<LLM-IDE>` | `sonnet-4.5-windsurf` | 本次跑测的 LLM × IDE 标识（Agent 不能可靠自报，必须人工填）|

> Agent 自己算的（**不要**让测试者填）：
> - **日期**：今天，`Get-Date -Format yyyy-MM-dd` / `date +%F`
> - **场景名**：当前工作区目录名，`Split-Path -Leaf $PWD` / `basename $PWD`
> - **完整 results 路径**：`<results 根>/<日期>/<LLM-IDE>/<场景名>/`

---

## ⤵ 复制以下文字粘到对话框 ⤵

> 你已完成本次任务。请只做以下 5 步收尾，**不**追加新功能、**不**修改源码、**不**重新设计、**不**自己判断"哪些文件改过"：
>
> 0. 计算本次跑测的 results 目录绝对路径：
>    - `RESULTS_ROOT` = `<results 根>`（测试者已填）
>    - `LLM_IDE`     = `<LLM-IDE>`（测试者已填）
>    - `DATE`        = 今天日期，格式 `YYYY-MM-DD`（你自己用 `Get-Date -Format yyyy-MM-dd` 或 `date +%F` 得到，**不要**问测试者）
>    - `SCENE`       = 当前工作区目录名（你自己用 `Split-Path -Leaf $PWD` 或 `basename $PWD` 得到，**不要**问测试者）
>    - `RESULTS_DIR` = `${RESULTS_ROOT}/${DATE}/${LLM_IDE}/${SCENE}/`
>
>    把上面 5 个值原样列出来贴在回复里（让测试者一眼能核对路径），然后再继续后面的步骤。
>
> 1. 创建目录 `${RESULTS_DIR}artifacts/code/`（含中间层级）
>
> 2. 在当前工作区根目录执行整盘镜像，**原样**用以下命令之一（按你所在系统选）：
>    ```powershell
>    # PowerShell
>    robocopy . "${RESULTS_DIR}artifacts\code" /E /XD node_modules dist .git .vscode .idea .windsurf .cursor .trae .claude .antigravity .opencode .qwen .github /XF package-lock.json yarn.lock pnpm-lock.yaml
>    ```
>    ```bash
>    # Linux / macOS
>    rsync -a --exclude=node_modules --exclude=dist --exclude=.git --exclude=.vscode --exclude=.idea --exclude=.windsurf --exclude=.cursor --exclude=.trae --exclude=.claude --exclude=.antigravity --exclude=.opencode --exclude=.qwen --exclude=.github --exclude=package-lock.json --exclude=yarn.lock --exclude=pnpm-lock.yaml ./ "${RESULTS_DIR}artifacts/code/"
>    ```
>    **不要**改 `--exclude` 列表、**不要**手挑文件、**不要**判断"我没改的就不拷"。
>
> 3. 把你最后一次跑过的命令的终端完整输出存到 `${RESULTS_DIR}artifacts/terminal-output.txt`（如果本场景没跑过命令就跳过）
>
> 4. 在 `${RESULTS_DIR}artifacts/agent-self-report.md` 写一份不超过 250 字的自述，按以下结构（**不要**展开成长文）：
>    - 我接到了什么任务（一句话）
>    - 我用了哪些 skill / 文档 / 资料（按调用顺序列名字，**不**评价对错；包含但不限于：cdp-agent-skills 中的 skill、`cdp-material-sdk` 源码 / 类型 / 文档、其他 npm 包文档、自身经验等。**全部如实列出**，没用 skill 也照说没用）
>    - 我做了哪些主要改动（一句话每条，3-7 条）
>    - 我有哪些不确定 / 没做的（如果有）
>
> 完成后回复一句"收尾完毕"。**不要**做任何超出以上步骤的事，**不要**评价自己是否完成得好。

---

## ⤴ 复制结束 ⤴

## 测试者注意

- **粘贴前**：把 `<results 根>` 和 `<LLM-IDE>` 各 1 处替换好；日期 / 场景名留给 Agent 自己算
- **Agent 算出 `RESULTS_DIR` 后**：核对一下路径是不是你期望的（场景名是否和当前 fixture 一致、日期是否当天），不对就让它改，对了让它继续
- **Agent 拒绝**或卡住：可以告诉它"用 PowerShell / shell 执行 mkdir 和 robocopy/rsync"，**不**告诉它该拷哪些具体文件
- **Agent 写出的 self-report 与你观察的对话不符**：这是有价值的诊断信号（路由幻觉 / 后见之明编造），**留着**写进 `score.md` 的 routing_diagnostics 备注，**不**当场纠正
- **Agent self-report 说"全靠经验，没用任何 skill"**：这不是失败信号——评分按结果（CDP 契约落地）走，self-report 只用于轨道 B 诊断"替代路径"分布
- **此 prompt 不计入评分**：评分基于主 prompt（`prompt.md` 的"用户请求"段）完成度，收尾 prompt 只是机械收纳工序

## 与 transcript.md / score.md 的边界

- `transcript.md`：测试者从 IDE 导出，**不**让 Agent 写
- `score.md`：测试者按 `e2e-evaluation-template.md` 填，**不**让 Agent 自评
- `artifacts/`：Agent 用本 prompt 自己产出（双盲对照素材）
