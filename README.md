# cdp-agent-skills

`cdp-agent-skills` 为 CDP 组件开发提供可安装到多个 IDE Agent 的 `SKILL.md` 技能集合，帮助 Agent 按权威文档完成组件包创建、第三方 React 组件包装、Manifest 声明和交付前自检。

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

## Skills 清单

| Skill | 用途 |
|---|---|
| `cdp-component-getting-started` | 从零创建或接入 CDP 组件库工程 |
| `cdp-component-add-to-existing-package` | 在已有组件包中新增组件 |
| `cdp-component-wrap-react-library` | 包装 Ant Design、Arco、Material UI、ECharts 或自研 UI Kit |
| `cdp-component-data-field-container` | 声明 `DATA_FIELD`、`DATA_CONTAINER` 和 `valueSchema` |
| `cdp-component-actions-state-events-slots` | 声明 events、actions、state、slots |
| `cdp-component-rootpath-loading` | 配置 rootPath 和 Loading 策略 |
| `cdp-component-manifest-validation` | 做 Manifest 校验、SDK 边界检查和接入排错 |

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

如果不能使用 CLI，可以复制对应 Skill 目录：

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

组件开发事实源仍在 CDP 主仓：`docs/组件开发`。本仓库只保存面向 IDE Agent 的任务化 Skills 和安装分发工具。

## 本地验证

```bash
npm test
node ./src/cli.js list --agents
node ./src/cli.js doctor --agent windsurf
```
