# cdp-agent-skills

`cdp-agent-skills` 为 CDP 组件开发提供可安装到多个 IDE Agent 的 `SKILL.md` 技能集合。Skill 负责工作流、文档导航和行为约束，具体组件开发文档以 `cdp-material-sdk/docs/component-development` 为事实源。

## 快速开始

```bash
npx cdp-agent-skills install
```

指定 Agent 全量安装：

```bash
npx cdp-agent-skills install --agent windsurf --all --yes
npx cdp-agent-skills install --agent antigravity --all --yes
npx cdp-agent-skills install --agent copilot-cli --all --yes
```

只安装部分 Skills：

```bash
npx cdp-agent-skills install --agent qwen-code --skills cdp-component-getting-started,cdp-component-manifest-validation --yes
```

查看支持的 Agent：

```bash
npx cdp-agent-skills list --agents
```

检查安装状态：

```bash
npx cdp-agent-skills doctor --agent windsurf
```

## 使用示例

安装完成后，在目标项目中直接向 IDE Agent 描述你的 CDP 组件开发任务。Agent 应先读取对应 Skill 的 `SKILL.md`，再读取目标项目本地 `node_modules/cdp-material-sdk/docs/component-development` 下的 SDK 随包文档；`references/*` 只作为文档导航和 fallback 提示。

不必以「请使用 xxx」起手。通常可以自然描述目标；如果 Agent 没有自动选择合适的 Skill，或你想减少歧义，再显式指定 Skill 名称。

### 从零创建组件库

```text
帮我在当前仓库创建一个 CDP 组件库。
组件包名是 acme-components，先做一个 Button 组件，type 为 acme.button，标题为「按钮」。
```

### 在已有组件包中新增组件

```text
在当前已有 CDP 组件包中新增一个 SearchInput 组件。
请先识别现有组件目录、manifest 聚合文件和 plugin 入口，只做增量修改。
```

### 包装第三方 React 组件

```text
把当前项目中的 ThirdPartyDatePicker 包装成 CDP 组件。
它的值属性是 selectedDate，变更事件是 onDateChange，请帮我用 adapter 归一化为 value 和 onChange。
```

（路由到 `cdp-component-adapter-and-wrap`。）

### 添加数据能力

```text
把 UserSelect 声明为 DATA_FIELD。
它的 value 是用户 ID 字符串，请补齐 valueSchema，并验证 manifest。
```

（路由到 `cdp-component-traits`。）

### 声明事件 / 动作 / 状态

```text
给 DataTable 增加 rowClick 事件和 refresh action。
请先确认 payload、params、returns 和组件 ref 实现方式，再修改 manifest。
```

（路由到 `cdp-component-events-actions-state`。插槽走 `cdp-component-slots`。）

### 配置 rootPath 与 Loading

```text
检查 ChartCard 是否需要 rootPath 和 loading。
如果需要，请优先使用 INJECT_PATH_SLOT_PROPS，并确认 loading 策略应为 native、wrapper 还是 none。
```

（路由到 `cdp-component-runtime-behavior`。）

### 交付前校验

```text
检查当前 CDP 组件包是否可以交付。
请运行 manifest 校验，检查 SDK 导入边界、actions/state 实现一致性、rootPath 和 loading 配置。
```

## Skills 清单

新 9 skill 索引按"主线 + 原子"分层：主线 skill 负责工作流编排和路由；原子 skill 各管一块独立能力。

| Skill | 类型 | 用途 |
|---|---|---|
| `cdp-component-getting-started` | 主线（总调度） | 从零创建或接入 CDP 组件库工程；阶段路线图 + 决策点 + "需求 → 原子 skill"路由 |
| `cdp-component-add-to-existing-package` | 主线（增量） | 在已有组件包中新增、注册并验证 1 个组件 |
| `cdp-component-manifest-validation` | 主线（排错入口） | 校验工具速查 + SDK 导入边界 + "症状 → 原子 skill"路由；交付前自检 |
| `cdp-component-manifest-basics` | 原子 | manifest 必填字段（type / meta.title / meta.category） + props（JSON Schema） + designer meta |
| `cdp-component-traits` | 原子 | `DATA_FIELD` / `DATA_CONTAINER` / `LAYOUT_CONTAINER` 声明，DataScope 与 valueSchema |
| `cdp-component-events-actions-state` | 原子 | 标准/自定义事件 + 命令式 actions + 暴露 state（COMPONENT_STATE_KEY） |
| `cdp-component-slots` | 原子 | 命名 / 动态 / 作用域 slots（含 `_slots` 渲染与 `dynamicSource`） |
| `cdp-component-runtime-behavior` | 原子 | rootPath 配置（INJECT_PATH_SLOT_PROPS）+ Loading 策略（native / wrapper / none / useDualLoading） |
| `cdp-component-adapter-and-wrap` | 原子 | Adapter 三层决策框架（事件层 / Props 层 / 结构层）+ 第三方组件 wrapper 标准模板 |

## 支持的 Agent

| CLI 参数 | 默认安装位置 | 说明 |
|---|---|---|
| `windsurf` | `.windsurf/skills/<skill-name>/SKILL.md` | Windsurf workspace Skills |
| `claude` | `.claude/skills/<skill-name>/SKILL.md` | Claude Code project Skills |
| `copilot-cli` | `.claude/skills/<skill-name>/SKILL.md` | 与 Claude Code 共用插件格式 |
| `cursor` | `.cursor/rules/cdp-agent-skills.md` | 通过规则文件引用本地 Skill 资源 |
| `antigravity` | `AGENTS.md` + `.antigravity/skills` | 通过项目指令文件引用本地 Skill 资源 |
| `trae` | `.trae/rules/project_rules.md` + `.trae/rules/cdp-agent-skills` | 通过 Trae 项目规则引用本地 Skill 资源 |
| `openclaw` | `skills/<skill-name>/SKILL.md` | 工作区级 Skills 目录 |
| `qwen-code` | `.qwen/skills/<skill-name>/SKILL.md` | Qwen Code 项目级 Skills |
| `opencode` | `.opencode/skills/<skill-name>/SKILL.md` | OpenCode 项目级 Skills |
| `custom` | 通过 `--target <path>` 指定 | 任意兼容 `SKILL.md` 的目录 |

## 手动安装

如果不能使用 CLI，可以复制对应完整 Skill 目录。不要只复制 `SKILL.md`，每个 Skill 的 `references/*` 记录了应读取的 SDK 文档路径和 fallback 提示。

```bash
# Windsurf
cp -r skills/cdp-component-getting-started .windsurf/skills/

# Claude Code / Copilot CLI
cp -r skills/cdp-component-getting-started .claude/skills/

# OpenClaw
cp -r skills/cdp-component-getting-started skills/

# Qwen Code
cp -r skills/cdp-component-getting-started .qwen/skills/

# OpenCode
cp -r skills/cdp-component-getting-started .opencode/skills/
```

规则/指令文件型 Agent 需要复制资源后，在对应文件中引用：

| 工具 | 手动方式 |
|---|---|
| Antigravity | 复制到 `.antigravity/skills`，在 `AGENTS.md` 或 `GEMINI.md` 引用 |
| Trae | 复制到 `.trae/rules/cdp-agent-skills`，在 `.trae/rules/project_rules.md` 引用 |
| Cursor | 复制到 `.cursor/rules/cdp-agent-skills`，在 `.cursor/rules/cdp-agent-skills.md` 引用 |

## 更新与覆盖

- 默认重复安装会跳过已存在的 Skill 目录。
- 使用 `--force` 覆盖已安装 Skill 目录。
- 对 `AGENTS.md`、`GEMINI.md`、`.trae/rules/project_rules.md`、`.cursor/rules/*.md` 的写入使用 managed block，不覆盖用户自定义内容。

## 文档事实源

组件开发事实源在 SDK：`cdp-material-sdk/docs/component-development`。SDK 发布包应携带该目录，目标项目安装后路径为 `node_modules/cdp-material-sdk/docs/component-development`。

本仓库维护的是面向 IDE Agent 的执行层：

- `SKILL.md` 说明何时触发、先问什么、按什么顺序执行。
- `references/*` 仅保留 SDK 文档导航和缺失文档时的 fallback 提示。
- 具体字段、枚举、模板和示例以目标项目本地安装的 SDK 文档为准。
- 如果 `node_modules/cdp-material-sdk/docs/component-development` 不存在，应先升级或重装 `cdp-material-sdk`。
- SDK 公共 API 和组件开发文档变更后，只需要同步检查本仓库的导航路径和 Skill 工作流。

## 端到端验证（Gate 1）

仓库提供 9 个独立靠场用于验证 skill 在真实 IDE Agent 中的行为：

```
tests/
  e2e-test-matrix.md             # 完整矩阵 + Gate 1/2/3 投产门槛
  e2e-runbook.md                 # 跑测 SOP（人类测试者实操手册）
  e2e-evaluation-template.md     # 评分表模板（路由 40 + 决策 30 + 漏洞 30）
  e2e-fixtures/
    01-zero-knowledge/           # 零知识开发者
    02-from-scratch-field/       # 从零做 ColorField
    03-wrap-third-party-datepicker/
    04-add-card-to-existing/
    05-broken-manifest/
    06-data-table-dynamic-slot/  # Tier B
    07-button-native-loading/
    08-data-container-hook/
    09-copy-paste-cleanup/
```

每个 fixture 含 `README.md`（跑测说明）+ `prompt.md`（原 prompt + 期望路径 + 漏洞清单）。

**第一次跑测**：从 `tests/e2e-runbook.md` 起手——它给出从准备、单场景 5 步法到收尾的完整 SOP。`e2e-test-matrix.md` 是设计依据，`e2e-evaluation-template.md` 是评分模板。

> **注意**：直接在仓库内打开 fixture 中的 `.tsx` / `.ts` 会看到 `Cannot find module 'cdp-material-sdk/portable'` 等 lint 错。这是**预期的** —— fixture 是测试时复制到独立目录后跑 `npm install` 的代码标本，本仓库不做 fixture 的依赖解析。仓库根 `jsconfig.json` 已把 `tests/e2e-fixtures` 从主项目排除。

**机械验证已通过**：9/9 fixture 在独立目录 `npm install` 成功；6 个含 src 代码的 fixture `npx tsc --noEmit` 全部通过。详见 `CHANGELOG.md` Unreleased 段。

**Gate 1（本仓库）通过 ≠ 投产 ready**。投产还需 Gate 2（跨 LLM × IDE × N=3 矩阵）和 Gate 3（真实开发者灰度）。详见 `tests/e2e-test-matrix.md` 第七节。

## 本地验证

```bash
npm test
node ./src/cli.js list --agents
node ./src/cli.js doctor --agent windsurf
```
